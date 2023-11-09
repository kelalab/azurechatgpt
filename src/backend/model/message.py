from pydantic import BaseModel
from typing import List

class Message(BaseModel):
    content: str
    role: str
    #def __init__(self, content, role):
    #    super().__init__(content=content, role=role)
        #self.content=content
        #self.role=role

class MessageList(BaseModel):
    data: List[Message]
