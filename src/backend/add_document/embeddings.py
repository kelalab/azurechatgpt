import time
from open_ai.open_ai import OpenAi 
import openai.error

from model.constants import *

class Embeddings:
   def embed(self, text: str, model='text-embedding-ada-002'):
      text = text.replace('\n', ' ')
      while True:
         try:
            embedding = OpenAi().get_embedding(text)
            break
         except openai.error.RateLimitError as e:
            print('retrying...', e)
            time.sleep(1)

      return embedding
