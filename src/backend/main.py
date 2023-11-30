from fastapi import FastAPI, UploadFile
from fastapi.staticfiles import StaticFiles
from fastapi.responses import FileResponse
import uuid
import uvicorn
import os
from starlette.background import BackgroundTasks

from open_ai.open_ai import OpenAi
from add_document.add_document import AddDocument
from model.constants import UVICORN_HOST
from db.repository import Repository
from model.graph import GraphList
from model.message import MessageList

app = FastAPI()
log_key = os.environ['LOG_KEY']

def reuse_or_generate_uuid(session_uuid):
    if session_uuid:
        return session_uuid
    else:
        return uuid.uuid4()

def remove_file(path: str) -> None:
    os.unlink(path)

@app.post('/message')
def post_message(benefit:str, message: str, session_uuid = None):
    '''Function for sending a single message to openai'''
    session_uuid = reuse_or_generate_uuid(session_uuid)

    repo = Repository()
    # Save user input to db
    repo.insert_conv(session_uuid, benefit, message)

    response = OpenAi().process_input_with_retrieval(benefit, message)

    # Save gpt output to db
    response.response.uuid = repo.insert_conv(session_uuid, benefit, response.response.message)

    return {'session_uuid': session_uuid, 'response': response.response, 'messages':response.messages}

@app.post('/messages')
def post_messages(benefit: str, data: MessageList, session_uuid = None):
    '''Function for sending the message chain to openai to continue the conversation'''
    session_uuid = reuse_or_generate_uuid(session_uuid)
    #TODO: this method is untested and unfinished, need to begin with getting the message chain in the response from the initial message
    # and then check what the completion returns and what we need to pass back in the response to continue with the conversation
    dict_data = []
    for d in data.data:
        dict_data.append({'role': d.role, 'content': d.content})
    api = OpenAi()
    #convert chat history and new question to a separated new question
    combined = api.combine_history(dict_data)
    #ask openai like we only got a single message in

    repo = Repository()
    # Save user input to db
    repo.insert_conv(session_uuid, benefit, data.data[-1].content)

    response = OpenAi().process_input_with_retrieval(benefit, combined)
    #response = OpenAi().get_completion_from_messages(dict_data)

    # Save gpt output to db
    response.response.uuid = repo.insert_conv(session_uuid, benefit, response.response.message)

    return {'session_uuid': session_uuid, 'response': response.response, 'messages':data.data}

@app.get('/thumb')
def thumb(message_id: str, thumb: int):
    if Repository().update_thumb(message_id, thumb):
        return {'status': 'success'}
    else:
        return {'status': 'error', 'desc': 'Message_id not found.'}

@app.post('/add_document')
def add_document(benefit: str, file: UploadFile, max_depth = 0):
    content = file.file.read()
    ad = AddDocument(file.filename, content, int(max_depth))
    return ad.generate_embeddings(benefit)

@app.get('/get_source')
def get_source(id: str):
    return Repository().get_source(id)

@app.post('/dummypath')
def get_body(data: GraphList):
    return data

@app.get('/logs')
def get_logs(background_tasks: BackgroundTasks, key = None, thumb = None):
    if log_key == key:
        path = Repository().get_logs(thumb)
        background_tasks.add_task(remove_file, path)
        return FileResponse(path)
    else:
        return {'status': 'error', 'desc': 'Cannot do that'}

app.mount("/", StaticFiles(directory="static", html="true"), name="static")

if __name__ == "__main__":
    uvicorn.run("main:app", host=UVICORN_HOST, port=8000, log_level="info")