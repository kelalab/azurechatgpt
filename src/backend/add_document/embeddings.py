import time
import open_ai
import openai.error

from model.constants import *

class Embeddings:
   def __init__(self):
      open_ai.api_key = AZURE_OPENAI_API_KEY
      open_ai.api_base = 'https://' + AZURE_OPENAI_API_INSTANCE_NAME + '.openai.azure.com' # your endpoint should look like the following https://YOUR_RESOURCE_NAME.openai.azure.com/
      open_ai.api_type = 'azure'
      open_ai.api_version = AZURE_OPENAI_API_VERSION

   def embed(self, text: str, model='text-embedding-ada-002'):
      text = text.replace('\n', ' ')
      while True:
         try:
            embedding = open_ai.Embedding.create(input = [text], model=model, deployment_id=model)
            break
         except open_ai.error.RateLimitError as e:
            print('retrying...', e)
            time.sleep(1)

      return embedding
