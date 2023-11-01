from fastapi import FastAPI
from chat_completion import process_input_with_retrieval, get_completion_from_messages

app = FastAPI()

@app.get('/')
async def root():
    return {'message': 'Hello World'}

@app.post('/message')
async def post_message(message: str):
   '''Function for sending a single message to openai'''
   response = process_input_with_retrieval(message)
   return {'response': response.message, 'cost': response.cost, 'sources': response.sources}

@app.post('/messages')
async def post_messages(messages: list[str]):
   '''Function for sending the message chain to openai to continue the conversation'''
   #TODO: this method is untested and unfinished, need to begin with getting the message chain in the response from the initial message
   # and then check what the completion returns and what we need to pass back in the response to continue with the conversation
   response = get_completion_from_messages(messages)
   return {'response': response.message, 'cost': response.cost, 'sources': response.sources}
