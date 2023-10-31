import { userHashedId } from "@/features/auth/helpers";
import { CosmosDBChatMessageHistory } from "@/features/langchain/memory/cosmosdb/cosmosdb";
import { LangChainStream, StreamingTextResponse } from "ai";
import { loadQAMapReduceChain } from "langchain/chains";
import { ChatOpenAI } from "langchain/chat_models/openai";
import { OpenAIEmbeddings } from "langchain/embeddings/openai";
import { BufferWindowMemory } from "langchain/memory";
import {
  ChatPromptTemplate,
  HumanMessagePromptTemplate,
  SystemMessagePromptTemplate,
} from "langchain/prompts";
import { PgVectorSearch } from "../../langchain/vector-stores/pgvector/pgvector-store";
import { insertPromptAndResponse } from "../chat-services/chat-service";
import { initAndGuardChatSession } from "../chat-services/chat-thread-service";
import { FaqDocumentIndex, PromptGPTProps } from "../chat-services/models";
import { transformConversationStyleToTemperature } from "../chat-services/utils";

export const ChatData = async (props: PromptGPTProps) => {
  const { lastHumanMessage, id, chatThread } = await initAndGuardChatSession(
    props
  );

  console.log("chatThread", chatThread);

  const chatModel = new ChatOpenAI({
    temperature: transformConversationStyleToTemperature(
      chatThread.conversationStyle
    ),
    streaming: true,
  });

  //TODO: synonym rules here
  const _lastHumanMessage = lastHumanMessage.content.replace(
    /totu/g,
    "toimeentulotuki"
  );
  console.log(_lastHumanMessage);

  const relevantDocuments = await findRelevantDocuments(
    //lastHumanMessage.content,
    _lastHumanMessage,
    id
  );

  const chain = loadQAMapReduceChain(chatModel, {
    combinePrompt: defineSystemPrompt(),
  });

  const { stream, handlers } = LangChainStream({
    onCompletion: async (completion: string) => {
      //await insertPromptAndResponse(id, lastHumanMessage.content, completion);
      await insertPromptAndResponse(id, _lastHumanMessage, completion);
    },
  });

  const userId = await userHashedId();

  const memory = new BufferWindowMemory({
    k: 100,
    returnMessages: true,
    memoryKey: "history",
    chatHistory: new CosmosDBChatMessageHistory({
      sessionId: id,
      userId: userId,
    }),
  });

  chain.call(
    {
      input_documents: relevantDocuments,
      //question: lastHumanMessage.content,
      question: _lastHumanMessage,
      memory: memory,
    },
    [handlers]
  );

  return new StreamingTextResponse(stream);
};

const findRelevantDocuments = async (query: string, chatThreadId: string) => {
  const vectorStore = initVectorStore();

  const relevantDocuments = await vectorStore.similaritySearch(query, 10, {
    vectorFields: vectorStore.config.vectorFieldName,
    filter: { user: await userHashedId(), chatThreadId: chatThreadId },
    //filter: `user eq '${await userHashedId()}' and chatThreadId eq '${chatThreadId}'`,
  });

  console.log("relevantDocuments", relevantDocuments);

  return relevantDocuments;
};

const defineSystemPrompt = () => {
  //const system_combine_template = `Given the following context and a question, create a final answer.
  //If the context is empty or If you don't know the answer, politely decline to answer the question. Don't try to make up an answer.
  //----------------
  //context: {summaries}`;
  const system_combine_template = `Anna lopullinen vastaus seuraavan kontekstin ja kysymyksen pohjalta. 
  Jos konteksti on tyhjä tai et tiedä vastausta, kieltäydy kohteliaasti vastaamasta kysymykseen. Älä yritä keksiä vastausta.
  ----------------
  konteksti: {summaries}`;

  const combine_messages = [
    SystemMessagePromptTemplate.fromTemplate(system_combine_template),
    HumanMessagePromptTemplate.fromTemplate("{question}"),
  ];
  const CHAT_COMBINE_PROMPT =
    ChatPromptTemplate.fromPromptMessages(combine_messages);

  return CHAT_COMBINE_PROMPT;
};

const initVectorStore = () => {
  const embedding = new OpenAIEmbeddings();
  const azureSearch = new PgVectorSearch<FaqDocumentIndex>(embedding, {
    name: process.env.AZURE_SEARCH_NAME,
    indexName: process.env.AZURE_SEARCH_INDEX_NAME,
    vectorFieldName: "vector",
  });

  return azureSearch;
};
