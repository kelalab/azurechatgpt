import io
from .splitter2 import Splitter
from .embeddings2 import Embeddings
from .repository import Repository
from models import Document

class FileEmbeddings:
    def __init__(self, file_name, content):
        self.embed = Embeddings()
        self.repo = Repository()
        self.file_name = file_name
        self.content = io.BytesIO(content)

    def generate_embeddings(self, etuus):
        texts = Splitter().split(self.content)

        for i in range(10):
            em = self.embed.embed(texts[i].page_content)
            metadata = texts[i].metadata
            page_content = texts[i].page_content
            vector = em.data[0].embedding
            self.repo.insert(Document(metadata,page_content, vector))
            
        return {'response': 'ok'}
