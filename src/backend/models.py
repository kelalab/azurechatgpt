from pydantic import BaseModel
import json
from typing import List

class Document:
    metadata=''
    pageContent=''
    vector=[]
    id=''
    chatthreadid=''
    userid=''
    benefit=''
   
    def __init__(self, metadata='', pageContent='', vector=[], benefit=''):
        self.metadata = metadata
        self.pageContent = pageContent
        self.vector = vector
        self.benefit = benefit

    def __str__(self):
        return f'{self.metadata}({self.pageContent}, {self.vector})'

class Message(BaseModel):
    content: str
    role: str
    #def __init__(self, content, role):
    #    super().__init__(content=content, role=role)
        #self.content=content
        #self.role=role

class MessageList(BaseModel):
    data: List[Message]

class _Response:
    message=''
    cost=0
    sources=[]
    role=''
 
class Response:
    response:_Response
    messages: []
    def __init__(self, message, cost, role, sources = list(), messages = list()):
        self.response = _Response()
        self.response.message = message
        self.response.cost = cost
        self.response.role = role
        self.response.sources = sources
        self.messages = messages
   
    def __str__(self):
        return f'{self.response.message},{self.response.cost},{self.response.sources}'