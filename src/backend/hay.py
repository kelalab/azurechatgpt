#from haystack.document_stores import InMemoryDocumentStore
from fastapi import UploadFile

from sqldocumentstore import SQLDocumentStore
from haystack.dataclasses import ByteStream
from haystack.components.converters import PyPDFToDocument
from haystack.components.preprocessors import DocumentCleaner, DocumentSplitter
from haystack.components.embedders import AzureOpenAIDocumentEmbedder, AzureOpenAITextEmbedder
from haystack import Pipeline
from haystack.components.routers import FileTypeRouter, DocumentJoiner
from haystack.components.writers import DocumentWriter
from ragpipeline import RAGPipeline
from haystack.components.generators import AzureOpenAIGenerator
from haystack.components.retrievers import InMemoryEmbeddingRetriever
from haystack.document_stores.protocol import DuplicatePolicy
from debugger import Debugger
from sqlretriever import SQLEmbeddingRetriever
from model.constants import DB_HOST, AZURE_OPENAI_API_VERSION, AZURE_OPENAI_API_INSTANCE_NAME
from os import environ

provider = "openai" 

#document_store = InMemoryDocumentStore()
#document_store = SQLDocumentStore(url=f"postgresql://pgvector:hassusalakala@{DB_HOST}:5432/embeddings")


class Hay:

  def __init__(self):
    pass

  def index(self, file: UploadFile, assistantId: str):
    try:
      document_store = SQLDocumentStore(url=f"postgresql://{environ.get('DB_USER')}:{environ.get('DB_PASS')}@{DB_HOST}:5432/embeddings", assistantId=assistantId)
      indexing_pipeline = Pipeline()
      #indexing_pipeline.add_component(instance=FileTypeRouter(mime_types=["text/plain", "application/pdf"]), name="file_type_router")
      indexing_pipeline.add_component(instance=PyPDFToDocument(), name="PDFConverter")
      indexing_pipeline.add_component(instance=DocumentJoiner(), name="joiner")
      indexing_pipeline.add_component(instance=DocumentCleaner(), name="cleaner")
      
      #indexing_pipeline.add_component(instance=DocumentSplitter(split_by="sentence", split_length=34, split_overlap=8), name="splitter")
      indexing_pipeline.add_component(instance=DocumentSplitter(split_by="sentence", split_length=50, split_overlap=8), name="splitter")
      indexing_pipeline.add_component(instance=AzureOpenAIDocumentEmbedder(azure_endpoint=f"https://{AZURE_OPENAI_API_INSTANCE_NAME}.openai.azure.com", api_key=environ.get('AZURE_OPENAI_API_KEY'), azure_deployment="text-embedding-ada-002", api_version=AZURE_OPENAI_API_VERSION), name="embedder")
      #indexing_pipeline.add_component(instance=Debugger(assistantId=assistantId), name="debugger")
      indexing_pipeline.add_component(instance=DocumentWriter(document_store=document_store, policy=DuplicatePolicy.SKIP), name="writer")

      #indexing_pipeline.connect("file_type_router.application/pdf", "PDFConverter.sources")
      indexing_pipeline.connect("PDFConverter.documents", "joiner.documents")
      indexing_pipeline.connect("joiner.documents", "cleaner.documents")
      indexing_pipeline.connect("cleaner.documents", "splitter.documents")
      indexing_pipeline.connect("splitter.documents", "embedder.documents")
      #indexing_pipeline.connect("embedder.documents", "debugger.documents")
      indexing_pipeline.connect("embedder.documents", "writer.documents")
      #indexing_pipeline.connect("debugger.documents", "writer.documents")
      #print(list(Path(".").iterdir()))
      bs = ByteStream(file.file.read(), meta={"filename": file.filename}, mime_type=file.content_type)
      indexing_pipeline.run({"PDFConverter": {"sources": [bs]}})
      #indexing_pipeline.run({"file_type_router": {"sources": [bs]}})
    except BaseException as e:
      print(e.args)
    #indexing_pipeline.run({"file_type_router": {"sources": list(Path(".").iterdir())}})
      
  basic_prompt_template = """
                  Given these documents, answer the question in Finnish language. 
                  If a user's question is outside the scope and content of these documents, 
                  you will inform them politely in Finnish. 
                  You will seek clarification for ambiguous or incomplete queries, always in Finnish.
                  Only answer questions regarding social benefits and welfare.
                  Documents:
                  {% for doc in documents %}
                      {{ doc.content }}
                  {% endfor %}

                  Question: {{question}}

                  Answer:
                  """

  def inference(self, index:str, model:str, query:str, prompt:str = basic_prompt_template , temperature:float = 0):
    print('model', model)       
    document_store = SQLDocumentStore(url=f"postgresql://{environ.get('DB_USER')}:{environ.get('DB_PASS')}@{DB_HOST}:5432/embeddings", assistantId=index)
    generator = AzureOpenAIGenerator(azure_deployment=model, azure_endpoint=f"https://{AZURE_OPENAI_API_INSTANCE_NAME}.openai.azure.com", api_key=environ.get('AZURE_OPENAI_API_KEY'), generation_kwargs={"temperature": temperature})
    prompt_template = prompt +"""
                  Documents: {% for doc in documents %}
                      {{ doc.content }}
                  {% endfor %}

                  Question: {{question}}

                  Answer:
                  """
    print("prompt_template", prompt_template)
    rag_pipeline = RAGPipeline(prompt_template=prompt_template, generator=generator, embedder=AzureOpenAITextEmbedder(azure_endpoint=f"https://{AZURE_OPENAI_API_INSTANCE_NAME}.openai.azure.com", api_key=environ.get('AZURE_OPENAI_API_KEY'), azure_deployment="text-embedding-ada-002", api_version=AZURE_OPENAI_API_VERSION), retriever=SQLEmbeddingRetriever(document_store=document_store, top_k=5))
    result = rag_pipeline.run(query=query)
    print(result.data)
    res_data = []
    for d in result.documents:
      res_data.append({"id": d.id, "content": d.content})
    print(res_data)
    return result

if __name__ == "__main__":
    hay = Hay()
    hay.index()
    hay.inference("gpt-35-turbo-16k", "mitä tarkoittaa vyöryttäminen?")
    #hay.inference("gpt-35-turbo-16k", "huomioidaanko nuohous omakotitalon menona toimeentulotuessa?")