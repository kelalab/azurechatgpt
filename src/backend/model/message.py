from pydantic import BaseModel
from typing import List, Optional

class Message(BaseModel):
    content: Optional[str] = ""
    role: str
    name: str
    tool_call_id: str
    function_call: None
    tool_calls: Optional[List]

    def __init__(self, content, role, tool_call_id="", function_call=None, tool_calls=None, name=""):
        super().__init__(content=content, role=role, tool_call_id=tool_call_id, name=name, function_call=function_call, tool_calls=tool_calls)

class IMessage(BaseModel):
    uuid: str
    message: Message
    cost: float
    sources: list
    visible: bool
    def __init__(self, message, uuid="", cost=0, sources=[], visible=True):
        #self.content = content
        #self.role = role
        #self.cost = cost
        super().__init__(uuid=uuid, message=message, cost=cost, sources=sources, visible=visible)


class MessageList(BaseModel):
    data: List[IMessage]
