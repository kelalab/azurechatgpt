import React, { ReactNode, useEffect, useState } from "react";
import ChatHistory from "./ChatHistory";
import ChatInput from "./ChatInput";
import { Message } from "../../types";

const ChatWindow = (props: any) => {
  const [messages, setMessages] = useState<Message[]>([]);

  const addMessage = (message: Message) => {
    setMessages((prev_state) => {
      return [...prev_state, message];
    });
  };

  const resetMessages = () => {
    setMessages([]);
  };

  const setAllMessages = (messages: Message[]) => {
    setMessages([...messages]);
  };

  return (
    <div className="w-4/5 h-full gap-4 flex flex-col justify-between">
      <ChatHistory messages={messages} />
      <ChatInput
        addMessage={addMessage}
        resetMessages={resetMessages}
        setAllMessages={setAllMessages}
        messages={messages}
      />
    </div>
  );
};

export default ChatWindow;
