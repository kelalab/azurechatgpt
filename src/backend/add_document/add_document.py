import io
import filetype
import traceback

from add_document.dita.splitter import Splitter
from add_document.docx.parser import DocxParser
from add_document.embeddings import Embeddings
from db.repository import Repository
from model.document import Document

class AddDocument:
    def __init__(self, file_name, content):
        self.embed = Embeddings()
        self.repo = Repository()
        self.file_name = file_name
        self.content = io.BytesIO(content)

    def generate_embeddings(self, benefit):
        try:
            if self.file_name.endswith('.dita'):
                # dita
                return self.handle_dita(benefit)
            else:
                kind = filetype.guess(self.content)
                if kind:
                    if 'application/vnd.openxmlformats-officedocument.wordprocessingml.document' == kind.mime:
                        # docx
                        return self.handle_docx(benefit, kind.mime)
                
                return {'response': 'error', 'mime': 'unknown'}

        except Exception as e:
            traceback.print_exc()
            return {'response': 'error', 'details': e}

    def handle_docx(self, benefit, mime):
        texts = DocxParser().parse(self.content)

        for text in texts:
            metadata = text[0]
            page_content = text[1]
            em = self.embed.embed(page_content)
            vector = em.data[0].embedding
            self.repo.insert(Document(metadata, page_content, vector, benefit))

        return {'response': 'ok', 'mime': mime}

    def handle_dita(self, benefit):
        texts = Splitter().split(self.content)

        for text in texts:
            metadata = text.metadata
            page_content = text.page_content
            em = self.embed.embed(text.page_content)
            vector = em.data[0].embedding
            self.repo.insert(Document(metadata, page_content, vector, benefit))
            
        return {'response': 'ok', 'mime': 'dita'}
