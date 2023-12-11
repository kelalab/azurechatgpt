import psycopg2
from psycopg2.extras import execute_values, register_uuid
from psycopg2.extensions import register_adapter, AsIs
from pgvector.psycopg2 import register_vector
from psycopg2.sql import SQL
import numpy as np
import os
import json
import uuid
import datetime
import tempfile
import csv

from model.constants import DB_HOST
from model.document import Document

def adapt_dict(dict_var):
    return AsIs("'" + json.dumps(dict_var) + "'")

def addapt_numpy_array(numpy_array):
    return AsIs(tuple(numpy_array))

register_adapter(dict, adapt_dict)
register_adapter(np.ndarray, addapt_numpy_array)
register_uuid()

class Repository:
    def __init__(self):
        self.conn = psycopg2.connect(database='embeddings', user=os.environ['DB_USER'], password=os.environ['DB_PASS'], host=DB_HOST)

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
            thumb integer,
            sources text,
            cost decimal
            );
            '''
        cur.execute(table_create_command)
        self.conn.commit()
        cur.close()

    def alter_conversations_table(self):
        cur = self.conn.cursor()
        table_create_command = f'''
        ALTER TABLE conversations
        ADD COLUMN sources text,
        ADD COLUMN cost decimal;
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

    def insert_conv_question(self, session_uuid: str, benefit: str, message: str):
        try:
            cur = self.conn.cursor()
            sql = SQL('SELECT MAX(sequence)+1 FROM conversations WHERE session_uuid = \'{0}\''.format(session_uuid))
            cur.execute(sql)
            result = cur.fetchall()

            seq = 0
            try:
                seq = int(result[0][0])
            except:
                pass

            id = uuid.uuid4()
            args = {'id': id, 'timestamp': datetime.datetime.now(), 'session_uuid': session_uuid, 'sequence': seq, 'benefit': benefit, 'message': message}
            sql = '''
                INSERT INTO conversations (id, timestamp, session_uuid, sequence, benefit, message)
                VALUES (%(id)s, %(timestamp)s, %(session_uuid)s, %(sequence)s, %(benefit)s, %(message)s)
            '''

            cur.execute(sql, args)

            self.conn.commit()
            cur.close()

            return id
        except psycopg2.errors.UndefinedTable:
            self.conn.rollback()
            self.create_conversations_table()
            return self.insert_conv_question(session_uuid, benefit, message)
        except psycopg2.errors.UndefinedColumn:
            self.conn.rollback()
            self.alter_conversations_table()
            return self.insert_conv_question(session_uuid, benefit, message)

    def insert_conv_answer(self, session_uuid: str, benefit: str, message: str, sources: [], cost: float):
        try:
            cur = self.conn.cursor()

            sql = SQL('SELECT MAX(sequence)+1 FROM conversations WHERE session_uuid = \'{0}\''.format(session_uuid))
            cur.execute(sql)
            result = cur.fetchall()

            seq = 0
            try:
                seq = int(result[0][0])
            except:
                pass

            parsed_sources = []
            for source in sources:
                source_items = []
                jsn = json.loads(source)
                print('jsn', jsn)
                for key in jsn.keys():
                    if 'id' == key:
                        continue
                    source_items.append( str(jsn[key]) )
                
                parsed_sources.append('/'.join(source_items))

            id = uuid.uuid4()
            args = {'id': id, 'timestamp': datetime.datetime.now(), 'session_uuid': session_uuid, 'sequence': seq, 'benefit': benefit, 'message': message, 'sources': ', '.join(parsed_sources), 'cost': cost}

            sql = '''
                INSERT INTO conversations (id, timestamp, session_uuid, sequence, benefit, message, sources, cost)
                VALUES (%(id)s, %(timestamp)s, %(session_uuid)s, %(sequence)s, %(benefit)s, %(message)s, %(sources)s, %(cost)s)
            '''

            cur.execute(sql, args)
            self.conn.commit()
            cur.close()

            return id
        except psycopg2.errors.UndefinedTable:
            self.conn.rollback()
            self.create_conversations_table()
            return self.insert_conv_answer(session_uuid, benefit, message, sources, cost)
        except psycopg2.errors.UndefinedColumn:
            self.conn.rollback()
            self.alter_conversations_table()
            return self.insert_conv_answer(session_uuid, benefit, message, sources, cost)

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
    
    def get_logs(self, thumb, date):
        cur = self.conn.cursor()

        if date:
            dateStart = date
            dateEnd = date + datetime.timedelta(days=1)

        sql = 'SELECT sequence, timestamp, thumb, sources, cost, message FROM conversations WHERE 1 = 1 '
        params = []

        if thumb:
            sql = sql + 'and thumb = {} '
            params.append(thumb)

        if date:
            sql = sql + 'and timestamp BETWEEN \'{}\' and \'{}\' '
            params.append(dateStart.date())
            params.append(dateEnd.date())

        sql = sql + 'ORDER BY session_uuid, sequence'
        sql = sql.format(*params)

        cur.execute(sql)

        f, path = tempfile.mkstemp(suffix='.csv')

        with os.fdopen(f, 'w') as tf:
            writer = csv.writer(tf, delimiter=',', quotechar='"', quoting=csv.QUOTE_MINIMAL)

            tf.write('Sequence, Timestamp, Thumb, Sources, Cost, Message\n')
            while True:
                rows = cur.fetchmany(1000)
                
                if not rows:
                    break

                for row in rows:
                    writer.writerow(row)

        cur.close()
        return path

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
