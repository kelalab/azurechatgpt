"use server";
import "server-only";

import { userHashedId, userSession } from "@/features/auth/helpers";
import { FindAllChats } from "@/features/chat/chat-services/chat-service";
import { nanoid } from "nanoid";
import { initDBContainer } from "../../common/posgres";
import {
  CHAT_DOCUMENT_ATTRIBUTE,
  CHAT_THREAD_ATTRIBUTE,
  ChatType,
  ConversationStyle,
  LLMModel,
  PromptGPTProps,
} from "./models";
import { ChatMessage, ChatThread } from "@prisma/client";

export const FindAllChatThreadForCurrentUser = async () => {
  const container = await initDBContainer();

  const resources = await container.chatThread.findMany({
    where: {
      type: CHAT_THREAD_ATTRIBUTE,
      userId: await userHashedId(),
      isDeleted: false,
    },
  });

  console.log("resources", resources);
  return resources;
};

export const FindChatThreadByID = async (id: string) => {
  const container = await initDBContainer();

  const resources = await container.chatThread.findMany({
    where: {
      type: CHAT_THREAD_ATTRIBUTE,
      userId: await userHashedId(),
      id: id,
      isDeleted: false,
    },
  });

  console.log("threads for user", resources);

  return resources;
};

export const SoftDeleteChatThreadByID = async (chatThreadID: string) => {
  const container = await initDBContainer();

  const threads = await FindChatThreadByID(chatThreadID);

  if (threads.length !== 0) {
    const chats = await FindAllChats(chatThreadID);

    chats.forEach(async (chat) => {
      const itemToUpdate = {
        ...chat,
      };
      itemToUpdate.isDeleted = true;
      await container.chatMessage.upsert({
        where: { id: chat.id },
        update: itemToUpdate,
        create: itemToUpdate,
      });
    });

    threads.forEach(async (thread) => {
      const itemToUpdate = {
        ...thread,
      };
      itemToUpdate.isDeleted = true;
      await container.chatThread.upsert({
        where: { id: thread.id },
        update: itemToUpdate,
        create: itemToUpdate,
      });
    });
  }
};

export const EnsureChatThreadIsForCurrentUser = async (
  chatThreadID: string
) => {
  const modelToSave = await FindChatThreadByID(chatThreadID);
  if (modelToSave.length === 0) {
    throw new Error("Chat thread not found");
  }

  return modelToSave[0];
};

export const UpsertChatThread = async (chatThread: ChatThread) => {
  const container = await initDBContainer();
  console.log("upsert chatThread", chatThread);
  const updatedChatThread = await container.chatThread.upsert({
    where: {
      id: chatThread.id,
    },
    update: {
      ...chatThread,
    },
    create: {
      id: chatThread.id,
      name: chatThread.name,
      userId: chatThread.userId,
      userName: chatThread.userName,
      model: chatThread.model,
      chatType: chatThread.chatType,
      conversationStyle: chatThread.conversationStyle,
      createdAt: chatThread.createdAt,
      isDeleted: chatThread.isDeleted,
      type: chatThread.type,
    },
  });
  console.log("updated chatThread", updatedChatThread);

  /*
  const updatedChatThread = await container.items.upsert<ChatThreadModel>(
    chatThread
  );

  if (updatedChatThread === undefined) {
    throw new Error("Chat thread not found");
  }*/

  return updatedChatThread;
};

export const updateChatThreadTitle = async (
  chatThread: ChatThread,
  messages: ChatMessage[],
  modelName: LLMModel,
  chatType: ChatType,
  conversationStyle: ConversationStyle,
  userMessage: string
) => {
  if (messages.length === 0) {
    const updatedChatThread = await UpsertChatThread({
      ...chatThread,
      model: modelName,
      chatType: chatType,
      conversationStyle: conversationStyle,
      name: userMessage.substring(0, 30),
    });

    return updatedChatThread!;
  }

  return chatThread;
};

export const CreateChatThread = async () => {
  const modelToSave: ChatThread = {
    name: "new chat",
    userName: (await userSession())!.name,
    userId: await userHashedId(),
    id: nanoid(),
    createdAt: new Date(),
    isDeleted: false,
    chatType: "simple",
    model: "gpt-3.5",
    conversationStyle: "precise",
    type: CHAT_THREAD_ATTRIBUTE,
  };

  const container = await initDBContainer();
  const response = await container.chatThread.create({ data: modelToSave });
  console.log("created chat", response);
  return response;
};

/**
 *
 * @param props
 * @returns
 */
export const initAndGuardChatSession = async (props: PromptGPTProps) => {
  const { messages, id, model, chatType, conversationStyle } = props;

  //last message
  const lastHumanMessage = messages[messages.length - 1];

  const currentChatThread = await EnsureChatThreadIsForCurrentUser(id);
  const chats = await FindAllChats(id);

  const chatThread = await updateChatThreadTitle(
    currentChatThread,
    chats,
    model,
    chatType,
    conversationStyle,
    lastHumanMessage.content
  );

  return {
    id,
    lastHumanMessage,
    chats,
    chatThread,
  };
};
