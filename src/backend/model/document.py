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