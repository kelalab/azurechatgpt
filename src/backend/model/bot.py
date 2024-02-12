from pydantic import BaseModel

class Bot(BaseModel):
    id:str
    name:str
    description: str
    model:str
    temperature:float
    prompt:str
    creator:str=''
    rag: bool=False
    hay: bool=True
    public:bool=False
   #def __init__(self, id, name, prompt, creator, public):
     #   self.id = id
     #   self.name = name
     #   self.prompt = prompt
     #   self.creator = creator
     #   self.public = public
     #   super.__init__(id, name, prompt, creator, public)
    def __str__(self):
        return f'''id: {self.id}, name: {self.name}'''
    def create(self, *args):
        print(args)