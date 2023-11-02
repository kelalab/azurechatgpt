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
   
class Response:
    def __init__(self, message, cost, sources = list()):
        self.message = message
        self.cost = cost
        self.sources = sources
   
    def __str__(self):
        return f'{self.message},{self.cost},{self.sources}'