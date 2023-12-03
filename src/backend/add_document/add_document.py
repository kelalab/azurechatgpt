import io
import filetype
import traceback

from add_document.dita.splitter import Splitter
from add_document.docx.parser import DocxParser
from add_document.csv.parser import CsvParser
from add_document.embeddings import Embeddings
from db.repository import Repository
from model.document import Document
from util.util import Util
import tiktoken

# true max length is 8191
# even 2048 * 8 documents goes over the max length of gpt 35 turbo 16k
ADA_MAX_LEN = 1536

class AddDocument:
    def __init__(self, file_name, content, max_depth):
        self.embed = Embeddings()
        self.repo = Repository()
        self.file_name = file_name
        self.content = io.BytesIO(content)
        self.max_depth = max_depth

    def split_on_tkn_limit(self, text, limit):
        tokens = tiktoken.get_encoding("cl100k_base").encode(text)
        parts = []
        text_parts = []
        current_part = []
        current_count = 0

        for token in tokens:
            current_part.append(token)
            current_count += 1

            if current_count >= limit:
               parts.append(current_part)
               current_part = []
               current_count = 0

        if current_part:
            parts.append(current_part)

        # Convert the tokenized parts back to text
        for part in parts:
            text = [
                tiktoken.get_encoding("cl100k_base").decode_single_token_bytes(token).decode("utf-8", errors="replace")
                for token in part
            ]
            text_parts.append("".join(text))

        return text_parts

    def generate_embeddings(self, benefit):
        try:
            if self.file_name.endswith('.dita'):
                # dita
                return self.handle_dita(benefit)
            elif self.file_name.endswith('.csv'):
                print('csv')
                return self.handle_csv(benefit, self.file_name)
            else:
                kind = filetype.guess(self.content)
                if kind:
                    if 'application/vnd.openxmlformats-officedocument.wordprocessingml.document' == kind.mime:
                        # docx
                        return self.handle_docx(benefit, kind.mime)
                return {'status': 'error', 'mime': 'unknown'}

        except Exception as e:
            traceback.print_exc()
            return {'status': 'error', 'details': str(e)}

    def handle_docx(self, benefit, mime):
        texts = DocxParser().parse(self.content, self.max_depth)

        for text in texts:
            metadata = text[0]
            page_content = text[1]
            tkns = Util().num_tokens_from_string(page_content)
            print('handle_docx tokens', tkns)
            if tkns > ADA_MAX_LEN:
               print("handle_docx need to split section in parts")
               if tkns > ADA_MAX_LEN:
                    parts = self.split_on_tkn_limit(page_content, ADA_MAX_LEN)
                    print('text parts len', len(parts))
                    print('text parts', parts)
                    print('metadata', metadata)
                    idx = 1
                    for part in parts:
                        part_metadata = text[0]
                        part_metadata["part"] = idx
                        part_page_content = part
                        em = self.embed.embed(part_page_content)
                        vector = em.data[0].embedding
                        self.repo.insert(Document(part_metadata, part_page_content, vector, benefit))
                        idx += 1
            else:         
                em = self.embed.embed(page_content)
                vector = em.data[0].embedding
                self.repo.insert(Document(metadata, page_content, vector, benefit))

        return {'status': 'success', 'mime': mime, 'rows_inserted': len(texts)}

    def handle_dita(self, benefit):
        texts = Splitter().split(self.content)

        for text in texts:
            metadata = text.metadata
            page_content = text.page_content
            em = self.embed.embed(text.page_content)
            vector = em.data[0].embedding
            self.repo.insert(Document(metadata, page_content, vector, benefit))
            
        return {'status': 'success', 'mime': 'dita', 'rows_inserted': len(texts)}
    
    def handle_csv(self, benefit, filename):
        texts = CsvParser().parse(self.content, self.max_depth)
        for text in texts:
            metadata = {"source":filename}
            page_content = text
            em = self.embed.embed(page_content)
            vector = em.data[0].embedding
            self.repo.insert(Document(metadata, page_content, vector, benefit))
        return {'status': 'success', 'mime': 'csv', 'rows_inserted': len(texts)}
