class Message:
    content=''
    role=''
    function_call=''
    def __str__(self):
        return f'{self.content},{self.role}'
 
class _Response:
    uuid=''
    message:Message=Message()
    message=''
    cost=0
    sources=[]
    role=''
    reason=''

    def __str__(self):
        return f'"message":{self.message},"cost":{self.cost},"sources":{self.sources}, "reason":{self.reason}'

class Response:
    response:_Response
    messages: []
    def __init__(self, message, cost, role, sources = list(), messages = list(), reason=''):
        self.response = _Response()
        self.response.message = message
        self.response.cost = cost
        self.response.role = role
        self.response.sources = sources
        self.messages = messages
        self.response.reason = reason
   
    def __str__(self):
        return f'{self.response}'