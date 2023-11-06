import psycopg2
from psycopg2.extras import execute_values
from psycopg2.extensions import register_adapter, AsIs
import numpy as np
import os
from create_table import create_table
from constants import DB_HOST

from models import Document
import json
import uuid

def adapt_dict(dict_var):
    return AsIs("'" + json.dumps(dict_var) + "'")

register_adapter(dict, adapt_dict)

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