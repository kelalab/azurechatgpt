import psycopg2
import sys, getopt

conn = psycopg2.connect(
   database='embeddings',
   user='pgvector',
   password='hassusalakala',
   host='localhost'
)

def create_table(name='embeddings'):
   cur = conn.cursor()
   table_create_command = f'''
   CREATE EXTENSION IF NOT EXISTS vector;
   CREATE TABLE {name} (
               id text primary key, 
               chatThreadId text,
               userId text,
               pageContent text,
               metadata text,
               vector vector(1536)
               );
               '''
   cur.execute(table_create_command)
   cur.close()
   conn.commit()

if __name__ == '__main__':
   '''Read table name from args '''
   opts, args = getopt.getopt(sys.argv[1:], 'n:', ['name='])
   for opt, arg in opts:
      print('opt', opt)
      if opt == '-n':
         create_table(arg)
         print('created table: ', arg)
         sys.exit()
   create_table()
