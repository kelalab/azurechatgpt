
from pgvector.psycopg2 import register_vector
from psycopg2.extras import execute_values
import psycopg2
import zipfile
import time
import uuid
import pandas as pd
import numpy as np
import tiktoken
import open_ai
import openai.error
import math
import sys, getopt, re
import os
from backend.model.models import Document
from langchain.document_loaders import JSONLoader
from backend.model.constants import AZURE_OPENAI_API_INSTANCE_NAME, AZURE_OPENAI_API_VERSION, AZURE_OPENAI_API_KEY

token_limit_per_minute = 180000
short_limit = 40000

db_host = os.environ['DB_HOST'] or 'localhost'

conn = psycopg2.connect(
    database='embeddings',
    user=os.environ['DB_USER'],
    password=os.environ['DB_PASS'],
    host=db_host
)

open_ai.api_key = AZURE_OPENAI_API_KEY
open_ai.api_base = 'https://' + AZURE_OPENAI_API_INSTANCE_NAME + '.openai.azure.com' # your endpoint should look like the following https://YOUR_RESOURCE_NAME.openai.azure.com/
open_ai.api_type = 'azure'
open_ai.api_version = AZURE_OPENAI_API_VERSION

cur = conn.cursor()

def my_get_embedding(text: str, progress: int,model='text-embedding-ada-002'):
    text = text.replace('\n', ' ')
    while True:
        try:
            embedding = open_ai.Embedding.create(input = [text], model=model, deployment_id=model)
            break
        except open_ai.error.RateLimitError as e:
            print('retrying...', progress, e)
            time.sleep(1)

    return embedding

def get_embedding(text: str, progress: int,model='text-embedding-ada-002'):
    text = text.replace('\n', ' ')
    try:
        embedding = open_ai.Embedding.create(input = [text], model=model, deployment_id=model)
    except open_ai.error.RateLimitError as e:
        print('retrying...', progress, e)
        time.sleep(1)
        return get_embedding(text, progress, model)
    
    return embedding
   
# Helper func: calculate number of tokens
def num_tokens_from_string(string: str, encoding_name = 'cl100k_base') -> int:
    if not string:
        return 0
    # Returns the number of tokens in a text string
    encoding = tiktoken.get_encoding(encoding_name)
    num_tokens = len(encoding.encode(string))
    return num_tokens

def get_embedding_cost(num_tokens):
    return num_tokens/1000*0.000096

def write_to_db(df_new, table='embeddings'):
    #Batch insert embeddings and metadata from dataframe into PostgreSQL database
    register_vector(conn)
    cur = conn.cursor()
    # Prepare the list of tuples to insert
    data_list = [(row['id'], row['chatThreadId'], row['userId'] or '', row['pageContent'], row['metadata'], np.array(row['vector'])) for index, row in df_new.iterrows()]
    # Use execute_values to perform batch insertion
    execute_values(cur, 'INSERT INTO ' + table + ' (id, chatthreadid, userid, pagecontent, metadata, vector) VALUES %s', data_list)
    # Commit after we insert all embeddings
    conn.commit()

def estimate_cost(zip_ref):
    tkn_count = 0
    for name in zip_ref.namelist():
        data = str(zip_ref.read(name), 'utf-8')
        tkn_count += num_tokens_from_string(data)
    print('estimated cost: ', get_embedding_cost(tkn_count))

def create_paragraph_embeddings():
    with zipfile.ZipFile('output_bk.zip', 'r') as zip_ref:
    # Returns a string with the contents of the in-memory zip.
        start_time = time.time()
        duration = 0
        usage = 0
        short_limit_passes = 1
        embedded_data = {}
        estimate_cost(zip_ref)
        time.sleep(10) 
        idx=0
        for name in zip_ref.namelist():
            data = str(zip_ref.read(name), 'utf-8')
            #print('name', name, 'data', data, 'usage', usage)
            print('usage', usage)
            if usage>token_limit_per_minute or usage > short_limit*short_limit_passes:
                if usage < token_limit_per_minute:
                    print('sleeping for: ', 3)
                    time.sleep(3)
                    short_limit_passes += 1
                else:
                    dur = 60-math.ceil(duration)
                    if dur < 0:
                        dur = 0
                    print('sleeping for: ', dur)
                    time.sleep(dur)
                    duration = 0
                    usage = 0
                    short_limit_passes = 1
        embedding = get_embedding(data, idx)
        id = str(uuid.uuid4()).replace('-','')
        obj = Document()
        obj.metadata = 'title='+name
        obj.pageContent = data
        obj.vector = embedding['data'][0]['embedding']
        obj.id = id
        #print('obj', obj)
        embedded_data[id] = obj.__dict__
        #print(embedded_data)
        #embedded_data.append(obj)
        duration = time.time()-start_time
        usage += embedding['usage']['total_tokens']
        idx += 1

    df_new = pd.DataFrame.from_dict(embedded_data, orient='index', columns=['id', 'chatThreadId', 'userId', 'pageContent', 'metadata', 'vector'])
    #print(df_new)
    write_to_db(df_new)

def create_clause_embeddings():
    with zipfile.ZipFile('output_bk.zip', 'r') as zip_ref:
    # Returns a string with the contents of the in-memory zip.
        start_time = time.time()
        duration = 0
        usage = 0
        short_limit_passes = 1
        embedded_data = {}
        estimate_cost(zip_ref)
        time.sleep(10) 
        for name in zip_ref.namelist():
            data = str(zip_ref.read(name), 'utf-8')
            #data = re.sub(r'\r\n', ' ', data)
            data = re.split(r'\r\n', data)
            clause_data = []
            for c in data:
                clause = c.strip()
                if len(clause) == 0:
                    continue
                idx = len(clause_data)
                print(idx, clause)
                ## lets see if the clause is a part of a list
                if len(clause) > 0 and clause[0] == '-':
                    clause = clause[1:]
                    list_beginning = clause_data[idx-1]
                    if len(clause_data) == 0:
                        clause_data.append(list_beginning + ' ' + clause)
                        continue
                    clause_data[idx-1] = list_beginning + ' ' + clause
                else:
                    clauses = re.split(r'(?<!\w\.\w.)(?<![A-Z][a-z]\.)(?<=\.|\?)(\s|[A-Z].*)', clause)
                    if len(clauses) > 1:
                        print('clause should be split to two')
                        for c in clauses:
                            if len(c.strip()) > 0:
                                clause_data.append(c)
                    else:
                        clause_data.append(clause)
            print('clause_data: ', clause_data)
            #data = re.split(r'(?<!\w\.\w.)(?<![A-Z][a-z]\.)(?<=\.|\?)(\s|[A-Z].*)', data)
            #print('name', name, 'data', data, 'usage', usage)
            print('usage', usage)
            if usage>token_limit_per_minute or usage > short_limit*short_limit_passes:
                if usage < token_limit_per_minute:
                    print('sleeping for: ', 3)
                    time.sleep(3)
                    short_limit_passes += 1
                else:
                    dur = 60-math.ceil(duration)
                    if dur < 0:
                        dur = 0
                    print('sleeping for: ', dur)
                    time.sleep(dur)
                    duration = 0
                    usage = 0
                    short_limit_passes = 1
            for c in clause_data:
                embedding = get_embedding(c)
                id = str(uuid.uuid4()).replace('-','')
                obj = Document()
                obj.metadata = 'file='+name
                obj.pageContent = c
                obj.vector = embedding['data'][0]['embedding']
                obj.id = id
                #print('obj', obj)
                embedded_data[id] = obj.__dict__
                #print(embedded_data)
                #embedded_data.append(obj)
                duration = time.time()-start_time
                usage += embedding['usage']['total_tokens']
        df_new = pd.DataFrame.from_dict(embedded_data, orient='index', columns=['id', 'chatThreadId', 'userId', 'pageContent', 'metadata', 'vector'])
        #print(df_new)
        write_to_db(df_new, 'clause_embeddings')

def metadata_func(record: dict, metadata: dict) -> dict:
    '''This function ensures necessary metadata is in our final Document'''
    #print(list(record.get(metadata)))
    if record.get('metadata').get('start_index'):
        metadata['start_index'] = record.get('metadata').get('start_index')
    #metadata['source'] = record.get('source').split('/')[-1]
    metadata['Header 1'] = record.get('metadata').get('Header 1')
    metadata['Header 2'] = record.get('metadata').get('Header 2')
    if record.get('metadata').get('Header 3'):
        metadata['Header 3'] = record.get('metadata').get('Header 3')
    if record.get('metadata').get('Header 4'):
        metadata['Header 4'] = record.get('metadata').get('Header 4')
    if record.get('metadata').get('Header 5'):
        metadata['Header 5'] = record.get('metadata').get('Header 5')
    if record.get('metadata').get('Header 6'):
        metadata['Header 6'] = record.get('metadata').get('Header 6')
    return metadata

def create_lc_embeddings(filename='output_lc'):
    print('Creating embeddings from langchain splitted data')
    isDirectory = os.path.isdir(filename)
    usage = 0
    embedded_data = {}
    if isDirectory:
        files = os.listdir(filename)
        files = sorted(files, key=lambda x: int(x.split('.')[0]))
        idx = 0
        for f in files:
            #print(f)
            loader = JSONLoader(
                file_path=f'{filename}/{f}',
                jq_schema='.',
                content_key='page_content',
                metadata_func=metadata_func,
                text_content=False
            )
            doc = loader.load()[0]
            # Remove full path from source file
            doc.metadata['source'] = doc.metadata['source'].split('/')[-1]
            # Pass everything to our document wrapper class
            doc = Document(pageContent=doc.page_content, metadata=str(doc.metadata))
            #print(doc)
            id = str(uuid.uuid4()).replace('-','')
            embedding = get_embedding(doc.pageContent,idx)
            doc.vector = embedding['data'][0]['embedding']
            doc.id = id
            embedded_data[id] = doc.__dict__
            usage += embedding['usage']['total_tokens']
            idx += 1
        df_new = pd.DataFrame.from_dict(embedded_data, orient='index', columns=['id', 'chatThreadId', 'userId', 'pageContent', 'metadata', 'vector'])
        write_to_db(df_new, 'clause_embeddings')
    else:
        print('input is a file')

if __name__ == '__main__':
    '''Read from args if we are doing paragraph or clause-based embeddings'''
    opts, args = getopt.getopt(sys.argv[1:], 'cl', [])
    for opt, arg in opts:
        if opt == '-c':
            create_clause_embeddings()
            sys.exit()
        if opt == '-l':
            create_lc_embeddings()
            sys.exit()
    create_paragraph_embeddings()
