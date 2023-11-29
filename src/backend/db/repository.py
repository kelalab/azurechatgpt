import psycopg2
from psycopg2.extras import execute_values
from psycopg2.extensions import register_adapter, AsIs
from pgvector.psycopg2 import register_vector
from psycopg2.sql import SQL
import numpy as np
import os
import json
import uuid
import datetime

from model.constants import DB_HOST
from model.document import Document

def adapt_dict(dict_var):
    return AsIs("'" + json.dumps(dict_var) + "'")

def addapt_numpy_array(numpy_array):
    return AsIs(tuple(numpy_array))

register_adapter(dict, adapt_dict)
register_adapter(np.ndarray, addapt_numpy_array)

class Repository:
    def __init__(self):
        self.conn = psycopg2.connect(database='embeddings', user='pgvector', password='hassusalakala', host=DB_HOST)

    def create_table(self, name='embeddings'):
        cur = self.conn.cursor()
        table_create_command = f'''
        CREATE EXTENSION IF NOT EXISTS vector;
        CREATE TABLE {name} (
            id text primary key, 
            chatThreadId text,
            userId text,
            pageContent text,
            metadata text,
            vector vector(1536),
            benefit text
            );
            '''
        cur.execute(table_create_command)
        self.conn.commit()
        cur.close()

    def create_conversations_table(self):
        cur = self.conn.cursor()
        table_create_command = f'''
        CREATE TABLE conversations (
            id text primary key,
            timestamp timestamptz,
            session_uuid text,
            sequence integer NOT NULL DEFAULT 0,
            benefit text,
            message text,
            thumb integer
            );
            '''
        cur.execute(table_create_command)
        self.conn.commit()
        cur.close()

    def insert(self, document: Document, table = 'clause_embeddings'):
        try:
            cur = self.conn.cursor()
            execute_values(cur, 'INSERT INTO ' + table + ' (id, chatthreadid, userid, pagecontent, metadata, vector, benefit) VALUES %s', self.extract_arguments(document))
            self.conn.commit()
            cur.close()
        except psycopg2.errors.UndefinedTable:
            self.conn.rollback()
            self.create_table(table)
            self.insert(document, table)

    def insert_conv(self, session_uuid: str, benefit: str, message: str):
        try:
            cur = self.conn.cursor()

            sql = SQL('SELECT MAX(sequence)+1 FROM conversations WHERE session_uuid = \'{0}\''.format(session_uuid))
            cur.execute(sql)
            result = cur.fetchall()

            id = str(uuid.uuid4())
            ts = datetime.datetime.now()
            try:
                int(result[0][0])
                sql = SQL('INSERT INTO conversations (id, timestamp, session_uuid, sequence, benefit, message) VALUES (\'{0}\', \'{1}\', \'{2}\', (SELECT MAX(sequence)+1 FROM conversations WHERE session_uuid = \'{2}\'), \'{3}\', \'{4}\')'.format(id, ts, session_uuid, benefit, message))
            except:
                sql = SQL('INSERT INTO conversations (id, timestamp, session_uuid, sequence, benefit, message) VALUES (\'{0}\', \'{1}\', \'{2}\', 0, \'{3}\', \'{4}\')'.format(id, ts, session_uuid, benefit, message))

            cur.execute(sql)
            self.conn.commit()
            cur.close()

            return id
        except psycopg2.errors.UndefinedTable:
            self.conn.rollback()
            self.create_conversations_table()
            return self.insert_conv(session_uuid, benefit, message)

    def update_thumb(self, message_uuid, thumb):
        try:
            cur = self.conn.cursor()
            sql = SQL('UPDATE conversations SET thumb = {1} WHERE id = \'{0}\''.format(message_uuid, thumb))
            cur.execute(sql)
            rowcount = cur.rowcount
            self.conn.commit()
            cur.close()
            return rowcount > 0
        except psycopg2.errors.UndefinedTable:
            self.conn.rollback()
            self.create_conversations_table()
            return self.update_thumb(message_uuid, thumb)

    def extract_arguments(self, document: Document):
        return [[str(uuid.uuid4()).replace('-',''), document.chatthreadid, document.userid, document.pageContent, document.metadata, document.vector, document.benefit]]
    
    def get_source(self, id:str, table = 'clause_embeddings'):
       cur = self.conn.cursor()
       cur.execute('SELECT id, pagecontent FROM ' + table + ' WHERE id = \'' + id + '\'')
       ret = cur.fetchall()
       cur.close()
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
        cur.close()
        return top3_docs
