from typing import Literal, Any, Dict, List, Optional, Iterable

from haystack import default_from_dict, default_to_dict
from haystack.dataclasses import Document
from haystack.document_stores.protocol import DuplicatePolicy
from haystack.utils.filters import document_matches_filter, convert
from haystack.document_stores.errors import DuplicateDocumentError, DocumentStoreError
from haystack.utils import expit
import psycopg2
from psycopg2.extras import execute_values, register_uuid
from psycopg2.extensions import register_adapter, AsIs
from pgvector.psycopg2 import register_vector
from psycopg2 import sql
import logging
import numpy as np

logger = logging.getLogger(__name__)
BM25_SCALING_FACTOR = 8
DOT_PRODUCT_SCALING_FACTOR = 100

class SQLDocumentStore:

    def __init__(self, url:str, assistantId:str):
        self.url = url
        self.conn = psycopg2.connect(url)
        self.assistantId = assistantId
        print("initializing sqldocumentstore with assistantId", assistantId)
        self.embedding_similarity_function: Literal["dot_product", "cosine"] = "dot_product"

    def to_dict(self) -> Dict[str, Any]:
        """
        Serializes this store to a dictionary.
        """

    @classmethod
    def from_dict(cls, data: Dict[str, Any]) -> "SQLDocumentStore":
        """
        Deserializes the store from a dictionary.
        """
        return default_from_dict(cls, data)

    def count_documents(self) -> int:
        """
        Returns the number of documents stored.
        """

    def filter_documents(self, filters: Optional[Dict[str, Any]] = None) -> List[Document]:
        """
        Returns the documents that match the filters provided.
        """
        return self.fetchAll('document')
        
    def fetchAll(self, table) -> List[Document]:
       cur = self.conn.cursor()
       query = sql.SQL("SELECT * FROM {table} WHERE index={index}").format(table=sql.Identifier(table), index=sql.Literal(self.assistantId))
       #cur.execute("SELECT * FROM %(table)s WHERE index=%(index)s", {'table':table, 'index':self.assistantId})
       cur.execute(query)
       ret = cur.fetchall()
       cur.close()
       docs = []
       for r in ret:
           docs.append(Document(content=r[0], id=r[4], meta=eval(r[5]), embedding=eval(r[6])))
       return docs

    def write_documents(self, documents: List[Document], policy: DuplicatePolicy = DuplicatePolicy.FAIL) -> int:
        """
        Writes (or overwrites) documents into the DocumentStore, return the number of documents that was written.
        """
        print("write_documents")
        if (
            not isinstance(documents, Iterable)
            or isinstance(documents, str)
            or any(not isinstance(doc, Document) for doc in documents)
        ):
            raise ValueError("Please provide a list of Documents.")

        if policy == DuplicatePolicy.NONE:
            policy = DuplicatePolicy.FAIL

        print('policy', policy)

        written_documents = len(documents)
        for document in documents:
            #if policy != DuplicatePolicy.OVERWRITE: # and document.id in self.storage.keys():
            #    if policy == DuplicatePolicy.FAIL:
            #        raise DuplicateDocumentError(f"ID '{document.id}' already exists.")
            #    if policy == DuplicatePolicy.SKIP:
            #        logger.warning("ID '%s' already exists", document.id)
            #        written_documents -= 1
            #        continue
            #self.storage[document.id] = document
            result = self.insert(document, self.assistantId, policy)
            if not result or result < 0:
                written_documents -= 1
        return written_documents

    def delete_documents(self, document_ids: List[str]) -> None:
        """
        Deletes all documents with a matching document_ids from the DocumentStore.
        """

    def embedding_retrieval(
        self,
        query_embedding: List[float],
        filters: Optional[Dict[str, Any]] = None,
        top_k: int = 10,
        scale_score: bool = False,
        return_embedding: bool = False,
    ) -> List[Document]:
        """
        Retrieves documents that are most similar to the query embedding using a vector similarity metric.

        :param query_embedding: Embedding of the query.
        :param filters: A dictionary with filters to narrow down the search space.
        :param top_k: The number of top documents to retrieve. Default is 10.
        :param scale_score: Whether to scale the scores of the retrieved Documents. Default is False.
        :param return_embedding: Whether to return the embedding of the retrieved Documents. Default is False.
        :return: A list of the top_k documents most relevant to the query.
        """
        if len(query_embedding) == 0 or not isinstance(query_embedding[0], float):
            raise ValueError("query_embedding should be a non-empty list of floats.")

        filters = filters or {}
        all_documents = self.filter_documents(filters=filters)

        documents_with_embeddings = [doc for doc in all_documents if doc.embedding is not None]
        if len(documents_with_embeddings) == 0:
            logger.warning(
                "No Documents found with embeddings. Returning empty list. "
                "To generate embeddings, use a DocumentEmbedder."
            )
            return []
        elif len(documents_with_embeddings) < len(all_documents):
            logger.info(
                "Skipping some Documents that don't have an embedding. "
                "To generate embeddings, use a DocumentEmbedder."
            )

        scores = self._compute_query_embedding_similarity_scores(
            embedding=query_embedding, documents=documents_with_embeddings, scale_score=scale_score
        )

        # create Documents with the similarity score for the top k results
        top_documents = []
        for doc, score in sorted(zip(documents_with_embeddings, scores), key=lambda x: x[1], reverse=True)[:top_k]:
            doc_fields = doc.to_dict()
            doc_fields["score"] = score
            if return_embedding is False:
                doc_fields["embedding"] = None
            top_documents.append(Document.from_dict(doc_fields))

        return top_documents


    def insert(self, document: Document, assistantId, policy, table = 'document'):
        print('insert', assistantId)
        try:
            cur = self.conn.cursor()
            print('metadata', document.meta)
            execute_values(cur, 'INSERT INTO ' + table + ' (content, content_type, index, vector_id, id, metadata, embedding) VALUES %s', [[document.content, 'text', assistantId, '', document.id, str(document.meta), document.embedding]])
            self.conn.commit()
            cur.close()
            return 1
        except psycopg2.errors.UndefinedTable:
            self.conn.rollback()
            self.create_table(table, {'content': 'text', 'content_type': 'text', 'index': 'varchar', 'vector_id': 'varchar', 'id': 'varchar', 'metadata': 'text', 'embedding':'vector(1536)'}, 'CONSTRAINT test_pkey PRIMARY KEY (index, id)')
            return self.insert(document, assistantId, policy, table)
        except psycopg2.errors.UniqueViolation as e:
            print('error', e)
            if policy != DuplicatePolicy.OVERWRITE: # and document.id in self.storage.keys():
                if policy == DuplicatePolicy.FAIL:
                    self.conn.rollback()
                    raise DuplicateDocumentError(f"ID '{document.id}' already exists.")
                if policy == DuplicatePolicy.SKIP:
                    logger.warning("ID '%s' already exists", document.id)
                    self.conn.rollback()
                    cur.close()
                    return -1
    
    def create_table(self, table, columns: Dict, constraint=''):
        cur = self.conn.cursor()
        cols = []
        for k in columns.keys():
            cols.append(' '.join([k, columns.get(k)]))
        table_create_command = f'''
        CREATE EXTENSION IF NOT EXISTS vector;
        CREATE TABLE {table} (
            {','.join(cols)
            },
            {constraint}
            );
            '''
        cur.execute(table_create_command)
        self.conn.commit()
        cur.close()

    def _compute_query_embedding_similarity_scores(
        self, embedding: List[float], documents: List[Document], scale_score: bool = False
    ) -> List[float]:
        """
        Computes the similarity scores between the query embedding and the embeddings of the documents.

        :param embedding: Embedding of the query.
        :param documents: A list of Documents.
        :param scale_score: Whether to scale the scores of the Documents. Default is False.
        :return: A list of scores.
        """
        print('QUERY_EMBEDDING', len(embedding))
        query_embedding = np.array(embedding)
        if query_embedding.ndim == 1:
            query_embedding = np.expand_dims(a=query_embedding, axis=0)

        try:
            document_embeddings = np.array([doc.embedding for doc in documents], dtype=float)
        except ValueError as e:
            if "inhomogeneous shape" in str(e):
                raise DocumentStoreError(
                    "The embedding size of all Documents should be the same. "
                    "Please make sure that the Documents have been embedded with the same model."
                ) from e
            raise e
        if document_embeddings.ndim == 1:
            document_embeddings = np.expand_dims(a=document_embeddings, axis=0)
            print('DOC_EMBEDDING', document_embeddings.size)

        if self.embedding_similarity_function == "cosine":
            # cosine similarity is a normed dot product
            query_embedding /= np.linalg.norm(x=query_embedding, axis=1, keepdims=True)
            document_embeddings /= np.linalg.norm(x=document_embeddings, axis=1, keepdims=True)

        try:
            #scores = np.dot(a=query_embedding, b=document_embeddings.T)[0].tolist()
            scores = np.dot(a=query_embedding, b=document_embeddings.T)[0].tolist()

        except ValueError as e:
            if "shapes" in str(e) and "not aligned" in str(e):
                raise DocumentStoreError(
                    "The embedding size of the query should be the same as the embedding size of the Documents. "
                    "Please make sure that the query has been embedded with the same model as the Documents."
                ) from e
            raise e

        if scale_score:
            if self.embedding_similarity_function == "dot_product":
                scores = [expit(float(score / DOT_PRODUCT_SCALING_FACTOR)) for score in scores]
            elif self.embedding_similarity_function == "cosine":
                scores = [(score + 1) / 2 for score in scores]

        return scores