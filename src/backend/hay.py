from haystack.document_stores import InMemoryDocumentStore
from haystack.components.converters import PyPDFToDocument
from haystack.components.preprocessors import DocumentCleaner, DocumentSplitter
from embedder import KLabOpenAIDocumentEmbedder
from textembedder import KlabOpenAITextEmbedder
from haystack import Pipeline, Document
from haystack.components.routers import FileTypeRouter, DocumentJoiner
from haystack.components.writers import DocumentWriter
#from haystack.pipeline_utils import build_rag_pipeline
from ragpipeline import RAGPipeline
from haystack.components.generators import GPTGenerator
from haystack.components.retrievers import InMemoryEmbeddingRetriever
from pathlib import Path
from haystack.document_stores import DuplicatePolicy
from debugger import Debugger

provider = "openai" 

document_store = InMemoryDocumentStore()
#document_store = SQLDocumentStore(url="postgresql://pgvector:hassusalakala@localhost:5432/embeddings")
#preprocessor = PreProcessor(language="fi")
#retriever = EmbeddingRetriever(
  #embedding_model="text-embedding-ada-002",
 # embedding_model="ada",
  #azure_deployment_name="oai-services-swe",
  #azure_deployment_name="text-embedding-ada-002",
  #azure_api_version="2023-06-01-preview",
  #api_key="d19b3def742143ef808cd44fe05d2a90",
  #azure_base_url="https://oai-services-swe.openai.azure.com"
#)
#converter = PDFToTextConverter(
#  remove_numeric_tables=True,
 # valid_languages=["fi","en"]
#)
generator = GPTGenerator(model_name="gpt-35-turbo-16k", api_base_url="https://oai-services-swe.openai.azure.com", api_key="d19b3def742143ef808cd44fe05d2a90", generation_kwargs={"deployment_id":"gpt-35-turbo-16k"})

def index():
  indexing_pipeline = Pipeline()
  indexing_pipeline.add_component(instance=FileTypeRouter(mime_types=["text/plain", "application/pdf"]), name="file_type_router")
  indexing_pipeline.add_component(instance=PyPDFToDocument(), name="PDFConverter")
  indexing_pipeline.add_component(instance=DocumentJoiner(), name="joiner")
  indexing_pipeline.add_component(instance=DocumentCleaner(), name="cleaner")
  indexing_pipeline.add_component(instance=DocumentSplitter(split_by="sentence", split_length=44, split_overlap=8), name="splitter")

  #indexing_pipeline.add_component(instance=DocumentSplitter(split_by="sentence", split_length=150, split_overlap=30), name="splitter")
  
  indexing_pipeline.add_component(instance=KLabOpenAIDocumentEmbedder(api_key="d19b3def742143ef808cd44fe05d2a90", model_name="text-embedding-ada-002"), name="embedder")
  #indexing_pipeline.add_node(component=converter, name="PDFConverter", inputs=["File"])
  #indexing_pipeline.add_node(component=preprocessor, name="Preprocessor", inputs=["PDFConverter"])
  #indexing_pipeline.add_node(component=retriever, name="Retriever", inputs=["Preprocessor"])
  #indexing_pipeline.add_node(component=document_store, name="document_store", inputs=["Retriever"])
  #indexing_pipeline.run(documents=[Document("This is my document")])
  #indexing_pipeline.run(file_paths=["Toimeentulotuki.pdf"])

  indexing_pipeline.add_component(instance=Debugger(), name="debugger")
  indexing_pipeline.add_component(instance=DocumentWriter(document_store=document_store, policy=DuplicatePolicy.SKIP ), name="writer")

  indexing_pipeline.connect("file_type_router.application/pdf", "PDFConverter.sources")
  #indexing_pipeline.connect("text_file_converter.documents", "joiner.documents")
  indexing_pipeline.connect("PDFConverter.documents", "joiner.documents")
  indexing_pipeline.connect("joiner.documents", "cleaner.documents")
  indexing_pipeline.connect("cleaner.documents", "splitter.documents")
  indexing_pipeline.connect("splitter.documents", "embedder.documents")
  indexing_pipeline.connect("embedder.documents", "debugger.documents")
  #indexing_pipeline.connect("embedder.documents", "writer.documents")

  indexing_pipeline.connect("debugger.documents", "writer.documents")

  indexing_pipeline.run({"file_type_router": {"sources": list(Path(".").iterdir())}})
  rag_pipeline = RAGPipeline(prompt_template="""
                Given these documents, answer the question. If you cannot find an answer in the documents refuse to answer in a polite manner.

                Documents:
                {% for doc in documents %}
                    {{ doc.content }}
                {% endfor %}

                Question: {{question}}

                Answer:
                """, generator=generator, embedder=KlabOpenAITextEmbedder(api_key="d19b3def742143ef808cd44fe05d2a90", model_name="text-embedding-ada-002"), retriever=InMemoryEmbeddingRetriever(document_store=document_store,))
  result = rag_pipeline.run(query="milloin opintolainan valtiontakaus ei ole tuloa ?")
  print(result.data)
  res_data = []
  for d in result.documents:
    res_data.append({"id": d.id, "content": d.content})
  print(res_data)

if __name__ == "__main__":
    index()