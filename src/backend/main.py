from fastapi import FastAPI, UploadFile
from fastapi.staticfiles import StaticFiles
from chat_completion import process_input_with_retrieval, get_completion_from_messages
from add_document.add_document import AddDocument
import uvicorn

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
async def post_messages(messages: list[str]):
    '''Function for sending the message chain to openai to continue the conversation'''
    #TODO: this method is untested and unfinished, need to begin with getting the message chain in the response from the initial message
    # and then check what the completion returns and what we need to pass back in the response to continue with the conversation
    response = get_completion_from_messages(messages)
    return {'response': response.response, 'messages':response.messages}

@app.post('/add_document')
async def add_document(benefit: str, file: UploadFile):
    content = await file.read()
    ad = AddDocument(file.filename, content)
    return ad.generate_embeddings(benefit)

app.mount("/", StaticFiles(directory="static", html="true"), name="static")

if __name__ == "__main__":
    uvicorn.run("main:app", host="127.0.0.1", port=8000, log_level="info")