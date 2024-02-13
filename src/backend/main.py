from fastapi import FastAPI, UploadFile, HTTPException
from fastapi.staticfiles import StaticFiles
from fastapi.responses import FileResponse
import uuid
import uvicorn
import os
from starlette.background import BackgroundTasks
import datetime

from open_ai.open_ai import OpenAi
from add_document.add_document import AddDocument
from model.constants import UVICORN_HOST
from model.response import _Response
from db.repository import Repository
from model.message import MessageList
from model.bot import Bot
from hay import Hay

from routes import bot
import json


app = FastAPI()
log_key = os.environ['LOG_KEY']
date_format = '%Y-%m-%d'

def reuse_or_generate_uuid(session_uuid):
    if session_uuid:
        return session_uuid
    else:
        return uuid.uuid4()

def remove_file(path: str) -> None:
    os.unlink(path)

def parse_functions(functions:[]):
    if functions and functions != 'undefined' and len(functions) > 0:
        functions = functions.replace('/"', '\'')
        print('functions', functions)
        functions = json.loads(functions)
    else:
        functions = None
    return functions

@app.post('/message')
def post_message(index:str, message: str, llm:str, systemPrompt: str, session_uuid = None, useHay = True, rag = True, functions =  []):
    '''Function for sending a single message to openai'''
    session_uuid = reuse_or_generate_uuid(session_uuid)

    repo = Repository()
    # Save user input to db
    repo.insert_conv_question(session_uuid, benefit=index, message=message)

    
    useHay = useHay == True
    rag = rag == True
    # haetaan mallin tiedot tietokannasta
    bot = repo.get_bot(index)
    if bot:
        print('bot', bot)
        botModel = Bot(id=bot[0], name=bot[1], description=bot[2], prompt=bot[3], model=bot[4], temperature=bot[5], creator=bot[6], rag=bot[7], public=bot[8])
        print('bot', bot, botModel)
        rag = botModel.rag
        useHay = botModel.hay
        llm = botModel.model
        prompt = botModel.prompt
        temperature = botModel.temperature
        
    functions = parse_functions(functions)
    print('functions', functions)

    if useHay:
        response = Hay().inference(index, llm, message, prompt, temperature)
        print('hay response', response)
        #response.response.uuid = repo.insert_conv_answer(session_uuid, benefit, response.data, response.documents, 0)
        return {'session_uuid':'1234', 'response': {'message': {'content': response.data, 'role': 'assistant'}, 'sources': response.documents, 'cost': 0}, 'messages': [{"role":"user", "content": response.query}]}
    else:
      response = OpenAi().process_input_with_retrieval(index, message, llm, systemPrompt, functions, rag=rag)

      # Save gpt output to db

      print('response before db save', response)
      response.response.uuid = repo.insert_conv_answer(session_uuid, benefit=index, message=response.response.message.content, sources=response.response.sources, cost=response.response.cost)

      return {'session_uuid': session_uuid, 'response': response.response, 'messages': response.messages}

@app.post('/messages')
def post_messages(benefit: str, data: MessageList, llm:str, systemPrompt: str, combinePrompt: str, session_uuid = None, functions =  []):
    '''Function for sending the message chain to openai to continue the conversation'''
    session_uuid = reuse_or_generate_uuid(session_uuid)
    #TODO: this method is untested and unfinished, need to begin with getting the message chain in the response from the initial message
    # and then check what the completion returns and what we need to pass back in the response to continue with the conversation
    dict_data = []
    #if functions and functions != 'undefined' and len(functions) > 0:
    #    functions = functions.replace('/"', '\'')
    #   print('functions', functions)
    #    functions = json.loads(functions)
    #else:
    #    functions = None
    functions = parse_functions(functions)
    for d in data.data:
        item = {}
        item['role'] = d.message.role
        item['content'] = d.message.content
        if d.message.tool_calls and len(d.message.tool_calls) > 0:
            item['tool_calls'] = d.message.tool_calls
        if d.message.tool_call_id and len(d.message.tool_call_id) > 0:
            item['tool_call_id'] = d.message.tool_call_id
        if d.message.name and len(d.message.name) > 0:
            item['name'] = d.message.name
        dict_data.append(item)
    api = OpenAi()
    #convert chat history and new question to a separated new question
    repo = Repository()
    print('combinePrompt', combinePrompt)
    if combinePrompt and combinePrompt != "null": 
        combined = api.combine_history(dict_data)
        #ask openai like we only got a single message in

        
        # Save user input to db
        repo.insert_conv_question(session_uuid, benefit, data.data[-1].content)

        response = OpenAi().process_input_with_retrieval(benefit, combined, llm, systemPrompt)
    else:
        response = OpenAi().get_completion_from_messages(dict_data, functions=functions)

    print('response', response.response)
    # Save gpt output to db
    response.response.uuid = repo.insert_conv_answer(session_uuid, benefit, response.response.message.content, response.response.sources, response.response.cost)

    return {'session_uuid': session_uuid, 'response': response.response, 'messages': data.data}

@app.get('/thumb')
def thumb(message_id: str, thumb: int):
    if Repository().update_thumb(message_id, thumb):
        return {'status': 'success'}
    else:
        return {'status': 'error', 'desc': 'Message_id not found.'}

@app.post('/add_document')
def add_document(benefit: str, file: UploadFile, assistantId: str, max_depth = 0, useHay:bool = False):
    useHay = useHay == True
    print('useHay', useHay, 'assistantId', assistantId)
    if useHay:
      Hay().index(file, assistantId)
    else:
      content = file.file.read()
      ad = AddDocument(file.filename, content, int(max_depth))
      return ad.generate_embeddings(benefit)

@app.get('/logs')
def get_logs(background_tasks: BackgroundTasks, key = None, date = None, thumb = None):
    if log_key == key:
        udate = None
        if date:
            udate = datetime.datetime.strptime(date, date_format)
        path = Repository().get_logs(thumb, udate)
        background_tasks.add_task(remove_file, path)
        return FileResponse(path)
    else:
        return {'status': 'error', 'desc': 'Cannot do that'}

app.include_router(bot.router)

app.mount("/", StaticFiles(directory="static", html="true"), name="static")

if __name__ == "__main__":
    uvicorn.run("main:app", host=UVICORN_HOST, port=8000, log_level="info")