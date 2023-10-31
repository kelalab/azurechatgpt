"use server";
import "server-only";

import { nanoid } from "nanoid";
import { initDBContainer } from "../../common/posgres";
import { ChatMessageModel, MESSAGE_ATTRIBUTE } from "./models";
import { ChatMessage } from "@prisma/client";

export const FindAllChats = async (chatThreadID: string) => {
  const container = await initDBContainer();

  const resources: ChatMessage[] = await container.chatMessage.findMany({
    where: {
      type: MESSAGE_ATTRIBUTE,
      threadId: chatThreadID,
      isDeleted: false,
    },
  });

  /*
  const querySpec: SqlQuerySpec = {
    query:
      "SELECT * FROM root r WHERE r.type=@type AND r.threadId = @threadId AND r.isDeleted=@isDeleted",
    parameters: [
      {
        name: "@type",
        value: MESSAGE_ATTRIBUTE,
      },
      {
        name: "@threadId",
        value: chatThreadID,
      },
      {
        name: "@isDeleted",
        value: false,
      },
    ],
  };

  const { resources } = await container.items
    .query<ChatMessageModel>(querySpec)
    .fetchAll();*/

  return resources;
};

export const UpsertChat = async (chatModel: ChatMessage) => {
  const modelToSave: ChatMessage = {
    ...chatModel,
    id: nanoid(),
    createdAt: new Date(),
    type: MESSAGE_ATTRIBUTE,
    isDeleted: false,
  };

  const container = await initDBContainer();
  await container.chatMessage.upsert({
    where: {
      id: chatModel.id,
    },
    update: {
      ...modelToSave,
    },
    create: {
      ...modelToSave,
    },
  });
};

export const insertPromptAndResponse = async (
  threadID: string,
  userQuestion: string,
  assistantResponse: string
) => {
  console.log("assistantResponse", assistantResponse);
  await UpsertChat({
    ...newChatModel(),
    content: userQuestion,
    threadId: threadID,
    role: "user",
  });
  await UpsertChat({
    ...newChatModel(),
    content: assistantResponse,
    threadId: threadID,
    role: "assistant",
  });
};

export const newChatModel = (): ChatMessageModel => {
  return {
    content: "",
    threadId: "",
    role: "user",
    userId: "",
    id: nanoid(),
    createdAt: new Date(),
    type: MESSAGE_ATTRIBUTE,
    isDeleted: false,
  };
};
