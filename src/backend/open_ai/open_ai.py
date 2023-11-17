import openai
import openai.error
import time
import re
import json

from model.constants import AZURE_OPENAI_API_DEPLOYMENT_NAME, AZURE_OPENAI_API_INSTANCE_NAME, AZURE_OPENAI_API_VERSION, AZURE_OPENAI_API_KEY
from model.response import Response
from db.repository import Repository

class OpenAi:
    def __init__(self):
        self.GPT35PROMPTPER1KTKN = 0.003
        self.GPT35COMPLETIONPER1KTKN = 0.004

        # we have to be have some confidence that docs are relevant
        #
        self.distance_limit = 0.22
        #distance_limit = 0.17
        #distance_limit = 0.134

        # Calculate the delay based on your rate limit
        self.rate_limit_per_minute = 20
        self.delay = 60.0 / self.rate_limit_per_minute

        #token_limit_per_minute = 240000
        self.token_limit_per_minute = 180000
        self.short_limit = 40000

        openai.api_key = AZURE_OPENAI_API_KEY
        openai.api_base = 'https://' + AZURE_OPENAI_API_INSTANCE_NAME + '.openai.azure.com' # your endpoint should look like the following https://YOUR_RESOURCE_NAME.openai.azure.com/
        openai.api_type = 'azure'
        openai.api_version = AZURE_OPENAI_API_VERSION

    # Helper function: get text completion from OpenAI API
    # Note we're using the latest azure gpt-35-turbo-16k model
    def get_completion_from_messages(self, messages, model=AZURE_OPENAI_API_DEPLOYMENT_NAME, deployment_id=AZURE_OPENAI_API_DEPLOYMENT_NAME, temperature=0, max_tokens=1000):
        response = openai.ChatCompletion.create(
            model=model,
            messages=messages,
            temperature=temperature, 
            max_tokens=max_tokens, 
            deployment_id=deployment_id

        )
        cost = response.usage.prompt_tokens / 1000.0 * self.GPT35PROMPTPER1KTKN + response.usage.completion_tokens / 1000.0 * self.GPT35COMPLETIONPER1KTKN
        #return 'message': response.choices[0].message['content'], 'cost': cost
        return Response(response.choices[0].message['content'],cost,response.choices[0].message['role'])

    def get_embedding_cost(self, num_tokens):
        return num_tokens/1000*0.000096

    def get_embedding(self, text:str, model='text-embedding-ada-002'):
        while True:
            print('text', text)
            text = text.replace('\n', ' ')
            try:
                embedding = openai.Embedding.create(input = [text], model=model, deployment_id=model)
                break
            except openai.error.RateLimitError:
                print('retrying...')
                time.sleep(1)
        return embedding

    def process_input_with_retrieval(self, benefit, user_input, add_guidance = True):
        delimiter = '```'
        sources = []

        #Step 1: Get documents related to the user input from database
        related_docs = Repository().get_top3_similar_docs(benefit, self.get_embedding(user_input)['data'][0]['embedding'])
        related_docs = list(filter(lambda x: x[3]<self.distance_limit,related_docs))
        
        content = ''
        i=0
        if len(related_docs) >= 2:
            for rl in related_docs:
                content += '<LÄHDE'+ str(i) + '> '+ re.sub(r'######', '', re.sub(r'\n', ' ',rl[1])) + '</LÄHDE'+ str(i) + '>'
                i += 1
            print('content',content)
            system_message = f'''ARVIOI MITKÄ LÄHTEET vastaavat parhaiten käyttäjän esittämään kysymykseen. 
                                Palauta vähintään kaksi lähdettä. 
                                Vastaa muodossa: LÄHDEx, LÄHDEy, LÄHDEz.
                                Vastauksesi saa sisältää vain listauksen lähteiden numeroista.
                                [LÄHTEET]{content}[/LÄHTEET]'''
                                # Vastaa muodossa: LÄHDEx, LÄHDEy, LÄHDEz.

            messages = [
                {'role': 'system', 'content': system_message},
                {'role': 'user', 'content': f'{delimiter}{user_input} {delimiter} '},
            ]
            openai_response = self.get_completion_from_messages(messages).response.message

            optimal_sources = openai_response.split(",")
            optimal_src_indexes = []
            for os in optimal_sources:
                optimal_src_indexes.append(int(re.sub('LÄHDE','',os)))

            print('optimal_src_indexes:', optimal_src_indexes)

            content = ''
            
            for idx in optimal_src_indexes:
                content += re.sub(r'\n', ' ',related_docs[idx][1])

            for idx in optimal_src_indexes:
                doc = related_docs[idx]
                source = json.loads(doc[2])
                source['id'] = doc[0]
                sources.append(json.dumps(source))
        else:
          for rl in related_docs:
            content += re.sub(r'\n', ' ',rl[1])
        if add_guidance:    
            #content = ''
            system_message = f'''
            Käyttäydy kuin Kelan asiantuntija. Pysy annetussa kontekstissa. Vastaa lyhyesti Kelan päätöksiä tekevän henkilön kysymyksiin.
            Vastauksen muotoilun pitää olla:
            1. Suositus
            2. Perustelu suositukselle (annetusta kontekstista)
            3. Listaus kaikista poikkeustilanteista, jotka löytyvät annetusta kontekstista
            Annettu konteksti: [KONTEKSTI] {content} [/KONTEKSTI]
            Mikäli et löydä vastausta annetusta kontekstista, kieltäydy kohteliaasti vastaamasta.
            '''
            # '''
            # Käyttäydy kuin Kelan asiantuntija. Mikäli et löydä vastausta perustelua tukevasta tekstistä, kieltäydy kohteliaasti vastaamasta. Vastaa lyhyesti Kelan päätöksiä tekevän henkilön kysymyksiin.
            # Vastauksen muotoilu tulee olla:
            # 1. Suositus
            # 2. Perustelu suositukselle.
            # 3. Listaus kaikista poikkeustilanteista
            # Perustelut löytyvät tästä tekstistä: ### {content} ###
            # '''
        else:
            system_message = user_input
            for doc in related_docs:
                source = json.loads(doc[2])
                source['id'] = doc[0]
                sources.append(json.dumps(source))
        
        system_message = re.sub(r'\n', ' ', system_message)
        #    
        # Prepare messages to pass to model
        # We use a delimiter to help the model understand the where the user_input starts and ends
        
        messages = [
            {'role': 'system', 'content': system_message},
            {'role': 'user', 'content': f'{delimiter}{user_input} {delimiter} '},
        ]

        openai_response = self.get_completion_from_messages(messages).response
        
        
        
        

        final_response = Response(openai_response.message, openai_response.cost, openai_response.role, sources, messages)

        return final_response
    
    def combine_history(self, messages):
        questions = list(messages)
        print(questions)
        new_message = questions.pop(-1)
        system_message = f'''
            Ottaen huomioon seuraavan keskusteluhistorian ja jatkokysymyksen, muotoile jatkokysymys uudelleen sen alkuperäisellä kielellä.
            Keskusteluhistoria: {questions}
            Jatkokysymys: {new_message}
            Vastaa siis ANTAMALLA MINULLE MUOTOILTU JATKOKYSYMYS.
            '''
        print(system_message)
        openai_response = self.get_completion_from_messages([{'role':'system','content':system_message}]).response
        print('openai combine response', openai_response.message)
        return openai_response.message

