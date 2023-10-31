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
from fastapi import FastAPI
from models import Document, Response
import re
from util import num_tokens_from_string
from env import AZURE_OPENAI_API_DEPLOYMENT_NAME, AZURE_OPENAI_API_INSTANCE_NAME, AZURE_OPENAI_API_KEY, AZURE_OPENAI_API_VERSION

app = FastAPI()

conn = psycopg2.connect(
   database="embeddings",
   user="pgvector",
   password="hassusalakala",
   host="localhost"
)

input = "jos työttömyysturvan kerroin poistuu pois käytöstä vahingossa, milloin se otetaan uudelleen käyttöön?"

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
openai.api_base = "https://" + AZURE_OPENAI_API_INSTANCE_NAME + ".openai.azure.com" # your endpoint should look like the following https://YOUR_RESOURCE_NAME.openai.azure.com/
openai.api_type = 'azure'
openai.api_version = AZURE_OPENAI_API_VERSION

def get_top3_similar_docs(query_embedding, conn):
    """ Finds the three closest documents from the database based on K Nearest Neighbor vector comparison algorithm
    
    Parameters
    ----------
    query_embedding : []
    conn : psycopg2.connection

    Returns
    ----------
    list
       a list of top three document results
    """
    embedding_array = np.array(query_embedding)
    print("ea", embedding_array)
    # Register pgvector extension
    register_vector(conn)
    cur = conn.cursor()
    # Get the top 3 most similar documents using the KNN <=> operator
    cur.execute("SELECT pageContent FROM embeddings ORDER BY vector <=> %s LIMIT 3", (embedding_array,))
    top3_docs = cur.fetchall()
    return top3_docs

#token_limit_per_minute = 240000
token_limit_per_minute = 180000
short_limit = 40000

def get_embedding(text, model="text-embedding-ada-002"):
   text = text.replace("\n", " ")
   try:
     embedding = openai.Embedding.create(input = [text], model=model, deployment_id=model)
   except openai.error.RateLimitError:
     print('retrying...')
     time.sleep(1)
     return get_embedding(text)
   return embedding

query_embedding = get_embedding(input)['data'][0]['embedding']
num_tokens = num_tokens_from_string(input)
query_embedding_cost = get_embedding_cost(num_tokens)

# Helper function: Get most similar documents from the database
def get_top3_similar_docs(query_embedding, conn):
    embedding_array = np.array(query_embedding)
    # Register pgvector extension
    register_vector(conn)
    cur = conn.cursor()
    # Get the top 3 most similar documents using the KNN <=> operator
    #cur.execute("SELECT pageContent,metadata,vector <=> %s AS distance FROM embeddings ORDER BY vector <=> %s LIMIT 3", (embedding_array,embedding_array,))
    
    cur.execute("SELECT pageContent,metadata,vector <=> %s AS distance FROM clause_embeddings ORDER BY vector <=> %s LIMIT 6", (embedding_array,embedding_array,))

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
    #return "message": response.choices[0].message["content"], "cost": cost
    return Response(response.choices[0].message["content"],cost)

def process_input_with_retrieval(user_input):
    delimiter = "```"

    #Step 1: Get documents related to the user input from database
    related_docs = get_top3_similar_docs(get_embedding(user_input)['data'][0]['embedding'], conn)
    print("related_docs before filter", related_docs)
    related_docs = list(filter(lambda x: x[2]<distance_limit,related_docs))
    print("related_docs", related_docs)
    content = ""
    system_message = f"""
    Käyttäydy kuin Kelan asiantuntija. Vastaa lyhyesti Kelan päätöksiä tekevän henkilön kysymyksiin.
    Vastauksen muotoilu tulee olla:
    1. Suositus
    2. Perustelu suositukselle. Perustelut löytyvät tästä tekstistä: ### {content} ### \n
    3. Listaus kaikista poikkeustilanteista
    """

    # Prepare messages to pass to model
    # We use a delimiter to help the model understand the where the user_input starts and ends
    messages = [
        {"role": "system", "content": system_message},
        {"role": "user", "content": f"{delimiter}{user_input}{delimiter}"},
    ]

    openai_response = get_completion_from_messages(messages)
    sources = map(lambda x: x[1].replace("title=","") ,related_docs)
    final_response = Response(openai_response.message, openai_response.cost, list(sources))
    print('final_response', final_response)
    return final_response

@app.get("/")
async def root():
    return {"message": "Hello World"}

@app.post("/message")
async def post_message(message: str):
   """Function for sending a single message to openai"""
   response = process_input_with_retrieval(message)
   return {"response": response.message, "cost": response.cost, "sources": response.sources}

@app.post("/messages")
async def post_messages(messages: list[str]):
   """Function for sending the message chain to openai to continue the conversation"""
   #TODO: this method is untested and unfinished, need to begin with getting the message chain in the response from the initial message
   # and then check what the completion returns and what we need to pass back in the response to continue with the conversation
   response = get_completion_from_messages(messages)
   return {"response": response.message, "cost": response.cost, "sources": response.sources}