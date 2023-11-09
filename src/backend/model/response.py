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