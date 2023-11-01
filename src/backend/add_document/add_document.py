import io
from .splitter import Splitter
from .embeddings import Embeddings
from .repository import Repository
from models import Document

class AddDocument:
    def __init__(self, file_name, content):
        self.embed = Embeddings()
        self.repo = Repository()
        self.file_name = file_name
        self.content = io.BytesIO(content)

    def generate_embeddings(self, etuus):
        texts = Splitter().split(self.content)

        for text in texts:
            metadata = text.metadata
            page_content = text.page_content
            em = self.embed.embed(text.page_content)
            vector = em.data[0].embedding
            self.repo.insert(Document(metadata,page_content, vector))
            
        return {'response': 'ok'}
