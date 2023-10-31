import { Callbacks } from "langchain/callbacks";
import { Embeddings } from "langchain/embeddings/base";
import { VectorStore } from "langchain/vectorstores/base";

import { PrismaVectorStore } from "langchain/vectorstores/prisma";
import { OpenAIEmbeddings } from "langchain/embeddings/openai";
import { PrismaClient, Prisma, Document } from "@prisma/client";

const db = new PrismaClient();

const vectorStore = PrismaVectorStore.withModel<Document>(db).create(
  new OpenAIEmbeddings(),
  {
    prisma: Prisma,
    tableName: "Document",
    vectorColumnName: "vector",
    columns: {
      id: PrismaVectorStore.IdColumn,
      pageContent: PrismaVectorStore.ContentColumn,
    },
    /*filter: {
      pageContent: {
        equals: "default",
      },
    },*/
  }
);

// example index model below
// export interface AzureCogDocumentIndex extends Record<string, unknown> {
//     id: string;
//     content: string;
//     user: string;
//     embedding?: number[];
//     pageContent: string;
//     metadata: any;
//   }

interface SearchConfig {
  name: string;
  indexName: string;
  vectorFieldName: string;
}

interface DocumentSearchResponseModel<TModel> {
  value: TModel[];
}

type DocumentSearchModel = {
  "@search.score": number;
};

export interface AzureCogDocument extends Record<string, unknown> {}

type AzureCogVectorField = {
  value: number[];
  fields: string;
  k: number;
};

type AzureCogFilter = {
  search?: string;
  facets?: string[];
  filter?: string;
  top?: number;
  vectorFields: string;
};

type AzureCogRequestObject = {
  search: string;
  facets: string[];
  filter: string;
  vectors: AzureCogVectorField[];
  top: number;
};

export class PgVectorSearch<
  TModel extends Record<string, unknown>
> extends VectorStore {
  private _config: SearchConfig;

  constructor(embeddings: Embeddings, dbConfig: SearchConfig) {
    super(embeddings, dbConfig);
    this._config = dbConfig;
  }

  _vectorstoreType(): string {
    return "pgvector";
  }

  get config(): SearchConfig {
    return this._config;
  }

  get baseUrl(): string {
    return `http://localhost:5432/indexes/${this._config.indexName}/docs`;
  }

  async addDocuments(documents: Document[]) {
    console.log("addDocuments start", documents);
    const texts = documents?.map(({ pageContent }) => pageContent);
    //console.log("Texts", texts);
    //const no_nl_texts = texts.map((t) => t.replace("\n/g", " "));
    console.log("Texts", texts);
    console.log("PGVector this.embeddings", this.embeddings);

    /*let vectors = await this.addVectors(
      await this.embeddings.embedDocuments(texts),
      documents
    );
    return vectors;*/

    let embeddings = await this.embeddings.embedDocuments(texts);

    console.log("embeddings", embeddings, "documents", documents);
    await this.addVectors(embeddings, documents);
    //return vectors;

    /*return this.addVectors(
      await this.embeddings.embedDocuments(texts),
      documents
    );*/
  }

  async generateEmbedding(raw: string) {
    // OpenAI recommends replacing newlines with spaces for best results
    const input = raw.replace(/\n/g, " ");
    const embeddingData = await this.embeddings.embedQuery(input);
    const [{ embedding }] = (embeddingData as any).data;
    return embedding;
  }

  /**
   * Search for the most similar documents to a query
   */
  async similaritySearch(query: string, k?: number, filter?: any) {
    const embedQuery = await this.embeddings.embedQuery(
      query.replace(/\n/g, "")
    );
    console.log("similaritySearch", query, k, filter, embedQuery);

    //const results = await vectorStore.similaritySearch(query, k || 4);
    //console.log("embedQuery", embedQuery);
    const results = await vectorStore.similaritySearchWithScore(query, k || 4);
    results.sort((a, b) => a[1] - b[1]);
    /*const results = await vectorStore.similaritySearchVectorWithScore(
      embedQuery,
      k || 4
      //{
      //  user: { equals: filter.user },
      //chatThreadId: { equals: filter.chatThreadId },
      //}
      //filter
    );*/

    console.log(results);
    //return results;
    return results.map(([doc, _score]) => doc);
  }

  /**
   * Search for the most similar documents to a query,
   * and return their similarity score
   */
  async similaritySearchWithScore(
    query: string,
    k?: number,
    filter?: AzureCogFilter,
    _callbacks: Callbacks | undefined = undefined
  ) {
    const embeddings = await this.embeddings.embedQuery(query);
    return this.similaritySearchVectorWithScore(embeddings, k || 5, filter);
  }

  /**
   * Advanced: Add more documents to an existing VectorStore,
   * when you already have their embeddings
   */
  async addVectors(vectors: number[][], documents: Document[]) {
    console.log("addVectors start", vectors, documents);
    const indexes: Array<any> = [];

    /*documents.forEach((document, i) => {
      indexes.push({
        id: nanoid().replace("_", ""),
        ...document,
        [this._config.vectorFieldName]: vectors[i],
      });
    });*/

    //console.log("updated documetns", indexes);

    // run through indexes and if the id has _ then remove it
    /*indexes.forEach((index) => {
      if (index.id.includes("_")) {
        index.id = index.id.replace("_", "");
      }
    });*/

    await vectorStore.addModels(
      await db.$transaction(
        documents.map((content) =>
          db.document.create({
            data: {
              id: content.id,
              chatThreadId: content.chatThreadId,
              user: content.user,
              pageContent: content.pageContent,
              metadata: content.metadata,
            },
          })
        )
      )
    );
    await vectorStore.addVectors(vectors, documents);
    //const responseObj = await  vectorStore.

    //const url = `${this.baseUrl}/index?api-version=${this._config.apiVersion}`;
    /*const responseObj = await fetcher(
      url,
      documentIndexRequest,
      this._config.apiKey
    );*/

    //return responseObj.map((doc: any) => doc.key);
  }

  /**
   * Advanced: Search for the most similar documents to a query,
   * when you already have the embedding of the query
   */
  async similaritySearchVectorWithScore(
    query: number[],
    k: number,
    filter?: any
  ): Promise<any> {
    const resultDocuments = await vectorStore.similaritySearchVectorWithScore(
      query,
      k,
      filter
    );
    return resultDocuments.map((doc) => [doc, doc["@search.score"] || 0]);
  }
}
