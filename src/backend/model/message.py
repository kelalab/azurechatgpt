from pydantic import BaseModel
from typing import List

class Message(BaseModel):
    content: str
    role: str
    cost: float
    sources: list
    def __init__(self, content, role, cost=0, sources=[]):
        #self.content = content
        #self.role = role
        #self.cost = cost
        super().__init__(content=content, role=role, cost=cost, sources=sources)


class MessageList(BaseModel):
    data: List[Message]
