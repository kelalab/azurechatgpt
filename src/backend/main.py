from fastapi import FastAPI, UploadFile
from fastapi.staticfiles import StaticFiles
from chat_completion import ChatCompletion
from add_document.add_document import AddDocument
from models import Message, MessageList
import uvicorn
import os
from constants import UVICORN_HOST
from pydantic import BaseModel
from typing import List
from db.repository import Repository

app = FastAPI()

@app.post('/message')
async def post_message(benefit:str, message: str):
    '''Function for sending a single message to openai'''
    response = ChatCompletion().process_input_with_retrieval(benefit, message)
    return {'response': response.response, 'messages':response.messages}

@app.post('/messages')
async def post_messages(data: MessageList):
    '''Function for sending the message chain to openai to continue the conversation'''
    #TODO: this method is untested and unfinished, need to begin with getting the message chain in the response from the initial message
    # and then check what the completion returns and what we need to pass back in the response to continue with the conversation
    dict_data = []
    for d in data.data:
        dict_data.append({'role': d.role, 'content': d.content})
    response = ChatCompletion().get_completion_from_messages(dict_data)
    return {'response': response.response, 'messages':data.data}

@app.post('/add_document')
async def add_document(benefit: str, file: UploadFile):
    content = await file.read()
    ad = AddDocument(file.filename, content)
    return ad.generate_embeddings(benefit)

@app.get('/get_source')
async def get_source(id: str):
    return Repository().get_source(id)

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