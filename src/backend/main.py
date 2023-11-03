from fastapi import FastAPI, UploadFile
from fastapi.staticfiles import StaticFiles
from chat_completion import process_input_with_retrieval, get_completion_from_messages
from add_document.add_document import AddDocument
from models import Message, MessageList
import uvicorn
import os
from constants import UVICORN_HOST
from pydantic import BaseModel
from typing import List

app = FastAPI()

#@app.get('/')
#async def root():
#    return {'message': 'Hello World'}

@app.post('/message')
async def post_message(benefit:str, message: str):
    '''Function for sending a single message to openai'''
    response = process_input_with_retrieval(benefit, message)
    return {'response': response.response, 'messages':response.messages}

@app.post('/messages')
async def post_messages(data: MessageList):
    '''Function for sending the message chain to openai to continue the conversation'''
    #TODO: this method is untested and unfinished, need to begin with getting the message chain in the response from the initial message
    # and then check what the completion returns and what we need to pass back in the response to continue with the conversation
    print(data)
    dict_data = []
    for d in data.data:
        dict_data.append({'role': d.role, 'content': d.content})
    response = get_completion_from_messages(dict_data)
    print(response)
    return {'response': response.response, 'messages':data.data}

@app.post('/add_document')
async def add_document(benefit: str, file: UploadFile):
    content = await file.read()
    ad = AddDocument(file.filename, content)
    return ad.generate_embeddings(benefit)

class GraphBase(BaseModel):
    start: str
    end: str
    distance: int

class GraphList(BaseModel):
    data: List[GraphBase]

@app.post("/dummypath")
async def get_body(data: GraphList):
    return data

app.mount("/", StaticFiles(directory="static", html="true"), name="static")

if __name__ == "__main__":
    uvicorn.run("main:app", host=UVICORN_HOST, port=8000, log_level="info")