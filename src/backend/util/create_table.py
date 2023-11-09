import psycopg2
import os, sys, getopt
from model.constants import DB_HOST

conn = psycopg2.connect(
    database='embeddings',
    user='pgvector',
    password='hassusalakala',
    host=DB_HOST
)

def create_table(conn, name='embeddings'):
    cur = conn.cursor()
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
    conn.commit()
    cur.close()
    

if __name__ == '__main__':
    '''Read table name from args '''
    opts, args = getopt.getopt(sys.argv[1:], 'n:', ['name='])
    for opt, arg in opts:
        print('opt', opt)
        if opt == '-n':
            create_table(conn, arg)
            print('created table: ', arg)
            sys.exit()
    create_table()
