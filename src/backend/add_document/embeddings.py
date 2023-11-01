import time
import openai
import openai.error
import env

class Embeddings:
   def __init__(self):
      openai.api_key = env.AZURE_OPENAI_API_KEY
      openai.api_base = 'https://' + env.AZURE_OPENAI_API_INSTANCE_NAME + '.openai.azure.com' # your endpoint should look like the following https://YOUR_RESOURCE_NAME.openai.azure.com/
      openai.api_type = 'azure'
      openai.api_version = env.AZURE_OPENAI_API_VERSION

   def embed(self, text: str, model='text-embedding-ada-002'):
      text = text.replace('\n', ' ')
      while True:
         try:
            embedding = openai.Embedding.create(input = [text], model=model, deployment_id=model)
            break
         except openai.error.RateLimitError as e:
            print('retrying...', e)
            time.sleep(1)

      return embedding
