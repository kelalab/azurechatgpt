import os
import openai
import openai.error
# imports
import time
import openai
import psycopg2
import pandas as pd
import numpy as np
import tiktoken
from pgvector.psycopg2 import register_vector
from psycopg2.extras import execute_values
from models import Document, Response
import re
from util import num_tokens_from_string
from constants import DB_HOST
from env import AZURE_OPENAI_API_DEPLOYMENT_NAME, AZURE_OPENAI_API_INSTANCE_NAME, AZURE_OPENAI_API_KEY, AZURE_OPENAI_API_VERSION

conn = psycopg2.connect(
    database='embeddings',
    user='pgvector',
    password='hassusalakala',
    host=DB_HOST
)

GPT35PROMPTPER1KTKN = 0.003
GPT35COMPLETIONPER1KTKN = 0.004

# we have to be have some confidence that docs are relevant
#
distance_limit = 0.17
#distance_limit = 0.134

def get_embedding_cost(num_tokens):
    return num_tokens/1000*0.000096

# Calculate the delay based on your rate limit
rate_limit_per_minute = 20
delay = 60.0 / rate_limit_per_minute

openai.api_key = AZURE_OPENAI_API_KEY
openai.api_base = 'https://' + AZURE_OPENAI_API_INSTANCE_NAME + '.openai.azure.com' # your endpoint should look like the following https://YOUR_RESOURCE_NAME.openai.azure.com/
openai.api_type = 'azure'
openai.api_version = AZURE_OPENAI_API_VERSION

#token_limit_per_minute = 240000
token_limit_per_minute = 180000
short_limit = 40000

def get_embedding(text:str, model='text-embedding-ada-002'):
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

# Helper function: Get most similar documents from the database
def get_top3_similar_docs(benefit, query_embedding, conn):
    ''' Finds the three closest documents from the database based on K Nearest Neighbor vector comparison algorithm
    
    Parameters
    ----------
    query_embedding : []
    conn : psycopg2.connection

    Returns
    ----------
    list
       a list of top three document results
    '''
    embedding_array = np.array(query_embedding)
    # Register pgvector extension
    register_vector(conn)
    cur = conn.cursor()
    # Get the top 3 most similar documents using the KNN <=> operator
    #cur.execute('SELECT pageContent,metadata,vector <=> %s AS distance FROM embeddings ORDER BY vector <=> %s LIMIT 3', (embedding_array,embedding_array,))
    
    cur.execute('SELECT pageContent,metadata,vector <=> %s AS distance FROM clause_embeddings WHERE benefit = \'' + benefit + '\' ORDER BY vector <=> %s LIMIT 6', (embedding_array,embedding_array,))

    top3_docs = cur.fetchall()
    return top3_docs

# Helper function: get text completion from OpenAI API
# Note we're using the latest azure gpt-35-turbo-16k model
def get_completion_from_messages(messages, model=AZURE_OPENAI_API_DEPLOYMENT_NAME, deployment_id=AZURE_OPENAI_API_DEPLOYMENT_NAME, temperature=0, max_tokens=1000):
    response = openai.ChatCompletion.create(
        model=model,
        messages=messages,
        temperature=temperature, 
        max_tokens=max_tokens, 
        deployment_id=deployment_id

    )
    print(response)
    cost = response.usage.prompt_tokens / 1000.0 * GPT35PROMPTPER1KTKN + response.usage.completion_tokens / 1000.0 * GPT35COMPLETIONPER1KTKN
    #return 'message': response.choices[0].message['content'], 'cost': cost
    return Response(response.choices[0].message['content'],cost,response.choices[0].message['role'])

def process_input_with_retrieval(benefit, user_input, add_guidance = True):
    delimiter = '```'

    #Step 1: Get documents related to the user input from database
    related_docs = get_top3_similar_docs(benefit, get_embedding(user_input)['data'][0]['embedding'], conn)
    print('related_docs before filter', related_docs)
    related_docs = list(filter(lambda x: x[2]<distance_limit,related_docs))
    print('related_docs', related_docs)
    content = ''
    for rl in related_docs:
        content += re.sub(r'\n', ' ',rl[0])
    #TODO: siivoa dokumentit

    if add_guidance:    
        #content = ''
        system_message = f'''
        Käyttäydy kuin Kelan asiantuntija. Mikäli et löydä vastausta perustelua tukevasta tekstistä, kieltäydy kohteliaasti vastaamasta. Vastaa lyhyesti Kelan päätöksiä tekevän henkilön kysymyksiin.
        Vastauksen muotoilu tulee olla:
        1. Suositus
        2. Perustelu suositukselle.
        3. Listaus kaikista poikkeustilanteista
        Perustelut löytyvät tästä tekstistä: ### {content} ###
        '''
    else:
        system_message = user_input
    
    system_message = re.sub(r'\n', ' ', system_message)
    #    

    # Prepare messages to pass to model
    # We use a delimiter to help the model understand the where the user_input starts and ends
    messages = [
        {'role': 'system', 'content': system_message},
        {'role': 'user', 'content': f'{delimiter}{user_input}{delimiter}'},
    ]

    print('MESSAGES: ', messages)
    openai_response = get_completion_from_messages(messages).response
    sources = map(lambda x: x[1].replace('title=','') ,related_docs)
    final_response = Response(openai_response.message, openai_response.cost, openai_response.role, list(sources), messages)
    print('final_response', final_response)
    return final_response