## Running postgres

```
docker compose -f pgvector.yaml up
```

or

```
npm run localdb
```

## Running python REST-api

```
cd backend
uvicorn main:app --reload
```

### Create tables for python

Run both lines to compare diy and langchain split or just the second command for langchain

```
cd backend
python3 create_table.py
python3 create_table.py -n clause_embeddings
```

### Prep data

This processes the input xml file to a markdown document and then uses either diy or lanchain to split the data into chunks.

Langchain:

```
python3 splitter.py -i <name>.dita -l -sFalse
```

### Create embeddings

This calls openai ada002 model to create embedding vectors for our data and stores them in db.

```
python3 create_embeddings.py -l
```
