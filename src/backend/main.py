from fastapi import FastAPI, UploadFile
from fastapi.staticfiles import StaticFiles
import uvicorn
import os

from open_ai.open_ai import OpenAi
from add_document.add_document import AddDocument
from model.constants import UVICORN_HOST
from db.repository import Repository
from model.graph import GraphList
from model.message import MessageList

app = FastAPI()

@app.post('/message')
async def post_message(benefit:str, message: str):
    '''Function for sending a single message to openai'''
    response = OpenAi().process_input_with_retrieval(benefit, message)
    return {'response': response.response, 'messages':response.messages}

@app.post('/messages')
async def post_messages(benefit: str, data: MessageList):
    '''Function for sending the message chain to openai to continue the conversation'''
    #TODO: this method is untested and unfinished, need to begin with getting the message chain in the response from the initial message
    # and then check what the completion returns and what we need to pass back in the response to continue with the conversation
    dict_data = []
    for d in data.data:
        dict_data.append({'role': d.role, 'content': d.content})
    api = OpenAi()
    #convert chat history and new question to a separated new question
    combined = api.combine_history(dict_data)
    #ask openai like we only got a single message in
    response = OpenAi().process_input_with_retrieval(benefit, combined)
    #response = OpenAi().get_completion_from_messages(dict_data)
    return {'response': response.response, 'messages':data.data}

@app.post('/add_document')
async def add_document(benefit: str, file: UploadFile):
    content = await file.read()
    ad = AddDocument(file.filename, content)
    return ad.generate_embeddings(benefit)

@app.get('/get_source')
async def get_source(id: str):
    return Repository().get_source(id)

@app.post("/dummypath")
async def get_body(data: GraphList):
    return data

app.mount("/", StaticFiles(directory="static", html="true"), name="static")

if __name__ == "__main__":
    uvicorn.run("main:app", host=UVICORN_HOST, port=8000, log_level="info")