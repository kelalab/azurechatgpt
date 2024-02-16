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
from model.bot import Bot

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


    def close(self):
        self.conn.close()

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

    def create_bot_table(self):
        cur = self.conn.cursor()
        table_create_command = f'''
        CREATE TABLE bots (
            id text primary key,
            name text,
            description text,
            prompt text,
            model text,
            temperature float,
            creator text,
            timestamp timestamptz,
            rag boolean,
            public boolean
            );
            '''
        cur.execute(table_create_command)
        self.conn.commit()
        cur.close()

    def update_bot(self, id, data):
        pass

    def create_bot(self, data:Bot):
        cur = self.conn.cursor()
        try:
            insert_command = '''
             INSERT INTO bots (id, name, description, prompt, model, temperature, creator, rag, public) VALUES ( %(id)s, %(name)s, %(description)s, %(prompt)s, %(model)s, %(temperature)s, %(creator)s, %(rag)s, %(public)s )
            '''
            cur.execute(insert_command, {"id": data.id, "name":data.name, "description":data.description, "prompt":data.prompt, "model":data.model, "temperature": data.temperature, "creator":data.creator, "rag": data.rag, "public": data.public})
            self.conn.commit()
            cur.close()
            return data.id
        except psycopg2.errors.UndefinedTable:
            self.conn.rollback()
            cur.close()
            self.create_bot_table()
            self.create_bot(data)
        

    def get_bot(self, id):
        cur = self.conn.cursor()
        try:
            get_bot_cmd = f'''
            SELECT id, name, description, prompt, model, temperature, creator, rag, public from bots where id=\'{id}\'
            '''
            cur.execute(get_bot_cmd)
            result = cur.fetchone()
            cur.close()
            return result
        except psycopg2.errors.UndefinedTable:
            self.conn.rollback()
            cur.close()
            self.create_bot_table()
            self.get_bot(id)
    
    def get_bots(self, name):
        cur = self.conn.cursor()
        try:
            get_bot_cmd = '''
            SELECT id, name, description, prompt, model, temperature, creator, rag, public FROM bots WHERE creator=%(name)s
            '''
            cur.execute(get_bot_cmd, {"name": name})
            result = cur.fetchall()
            cur.close()
            return result
        except psycopg2.errors.UndefinedTable:
            self.conn.rollback()
            cur.close()
            self.create_bot_table()
            self.get_bots(name)


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
        except psycopg2.errors.UndefinedColumn as udfcol:
            print(udfcol)
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

    def get_top3_similar_docs(self, benefit, query_embedding):
        return self.vector_search(benefit, query_embedding, 8)

    # Helper function: Get most similar documents from the database
    def vector_search(self, benefit, query_embedding, limit):
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
        cur.execute('SELECT id,pageContent,metadata,vector <=> %s AS distance FROM clause_embeddings ORDER BY distance LIMIT %s', (embedding_array,limit,))
        #cur.execute(f'''SELECT id,pageContent,metadata,vector <=> {embedding_array} AS distance FROM clause_embeddings WHERE benefit = \'' + benefit + '\' ORDER BY distance LIMIT {limit}''')

        top3_docs = cur.fetchall()
        cur.close()
        return top3_docs
    
    def full_text_search(self, benefit, input, common_words=[], limit=5):
        '''
        '''
        print('common_words', common_words)
        print('input', input)
        words = input.split()
        search_words = []
        for w in words:
            a = [y for y in common_words if w.lower().startswith(y)]
            if len(a) == 0:
                search_words.append(w)
        #edited_input = " OR ".join(search_words)
        edited_input = " ".join(search_words)
        print('edited_input', edited_input)
        cur = self.conn.cursor()
        cur.execute(f'''
                        SELECT id, pageContent, metadata, searchcontent @@ query AS matches, ts_rank_cd(searchcontent, query) AS rank 
                        FROM clause_embeddings, websearch_to_tsquery('finnish', '{edited_input}') query, to_tsvector('finnish', pagecontent) searchcontent
                        WHERE benefit='{benefit}' AND searchcontent @@ query ORDER BY "rank" desc LIMIT {limit}
                    ''')
        search_results = cur.fetchall()
        cur.close()
        return search_results

    common_words = ['miten']

    def hybrid_search(self, benefit, input, query_embedding, limit=5):
        embedding_array = np.array(query_embedding)
        words = input.split()
        search_words = []
        try:
            for w in words:
                a = [y for y in self.common_words if w.lower().startswith(y)]
                if len(a) == 0:
                    search_words.append(w)
            #edited_input = " OR ".join(search_words)
            edited_input = " ".join(search_words)
            print('edited_input', edited_input)
            register_vector(self.conn)
            cur = self.conn.cursor()
            sql = """
                WITH semantic_search AS (
                    SELECT id, pageContent, metadata, vector, RANK () OVER (ORDER BY vector <=> %(embedding)s) AS rank
                    FROM clause_embeddings
                    WHERE benefit=%(benefit)s
                    ORDER BY vector <=> %(embedding)s
                    LIMIT 20
                ),
                keyword_search AS (
                    SELECT id, pageContent, metadata, vector, RANK () OVER (ORDER BY ts_rank_cd(to_tsvector('finnish', pageContent), query) DESC)
                    FROM clause_embeddings, plainto_tsquery('finnish', %(query)s) query
                    WHERE benefit=%(benefit)s AND to_tsvector('finnish', pageContent) @@ query
                    ORDER BY ts_rank_cd(to_tsvector('finnish', pageContent), query) DESC
                    LIMIT 20
                )
                SELECT
                    COALESCE(semantic_search.id, keyword_search.id) AS id,
                    COALESCE(semantic_search.pageContent, keyword_search.pageContent) AS pageContent,
                    COALESCE(semantic_search.metadata, keyword_search.metadata) AS metadata,
                    COALESCE(1.0 / (%(k)s + semantic_search.rank), 0.0) +
                    COALESCE(1.0 / (%(k)s + keyword_search.rank), 0.0) AS score
                FROM semantic_search
                FULL OUTER JOIN keyword_search ON semantic_search.id = keyword_search.id
                ORDER BY score DESC
                LIMIT 5
            """
            k = 60
            cur.execute(sql, {'query': edited_input, 'embedding': embedding_array, 'k': k, 'benefit': benefit})
            results = cur.fetchall()
            cur.close()
            return results
        except psycopg2.errors.UndefinedTable:
            self.conn.rollback()
            self.create_table("clause_embeddings")
            return self.hybrid_search(benefit, input, query_embedding, limit)

