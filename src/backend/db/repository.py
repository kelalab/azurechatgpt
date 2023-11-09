import psycopg2
from psycopg2.extras import execute_values
from psycopg2.extensions import register_adapter, AsIs
from pgvector.psycopg2 import register_vector
import numpy as np
import os
import json
import uuid

from create_table import create_table
from constants import DB_HOST
from models import Document

def adapt_dict(dict_var):
    return AsIs("'" + json.dumps(dict_var) + "'")

def addapt_numpy_array(numpy_array):
    return AsIs(tuple(numpy_array))

register_adapter(dict, adapt_dict)
register_adapter(np.ndarray, addapt_numpy_array)

class Repository:
    def __init__(self):
        self.conn = psycopg2.connect(
            database='embeddings',
            user='pgvector',
            password='hassusalakala',
            host=DB_HOST
        )

    def insert(self, document: Document, table = 'clause_embeddings'):
        try:
          cur = self.conn.cursor()
          execute_values(cur, 'INSERT INTO ' + table + ' (id, chatthreadid, userid, pagecontent, metadata, vector, benefit) VALUES %s', self.extract_arguments(document))
          self.conn.commit()
        except psycopg2.errors.UndefinedTable:
          self.conn.rollback()
          create_table(self.conn, table)
          self.insert(document, table)

    def extract_arguments(self, document: Document):
        return [[str(uuid.uuid4()).replace('-',''), document.chatthreadid, document.userid, document.pageContent, document.metadata, document.vector, document.benefit]]
    
    def get_source(self, id:str, table = 'clause_embeddings'):
       cur = self.conn.cursor()
       cur.execute('SELECT id, pagecontent FROM ' + table + ' WHERE id = \'' + id + '\'')
       ret = cur.fetchall()
       return ret
    
    # Helper function: Get most similar documents from the database
    def get_top3_similar_docs(self, benefit, query_embedding):
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
        #print(query_embedding)
        # Register pgvector extension
        register_vector(self.conn)
        cur = self.conn.cursor()
        # Get the top 3 most similar documents using the KNN <=> operator
        #cur.execute('SELECT pageContent,metadata,vector <=> %s AS distance FROM embeddings ORDER BY vector <=> %s LIMIT 3', (embedding_array,embedding_array,))
        
        cur.execute('SELECT id,pageContent,metadata,vector <=> %s AS distance FROM clause_embeddings WHERE benefit = \'' + benefit + '\' ORDER BY vector <=> %s LIMIT 8', (embedding_array,embedding_array,))

        top3_docs = cur.fetchall()
        return top3_docs
