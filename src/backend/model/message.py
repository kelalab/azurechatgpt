from pydantic import BaseModel
from typing import List

class Message(BaseModel):
    content: str
    role: str
    cost: float
    def __init__(self, content, role, cost=0):
        #self.content = content
        #self.role = role
        #self.cost = cost
        super().__init__(content=content, role=role, cost=cost)


class MessageList(BaseModel):
    data: List[Message]
