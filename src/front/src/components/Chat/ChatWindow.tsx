import React, { ReactNode, useEffect, useState } from "react";
import ChatHistory from "./ChatHistory";
import ChatInput from "./ChatInput";
import { Message } from "../../types";

const ChatWindow = (props: any) => {
  const { messages, addMessage } = props;
  //const [messages, setMessages] = useState<Message[]>([]);

  // const addMessage = (message: Message) => {
  //   console.log("messages before", messages);
  //   setMessages([...messages, message]);
  //   console.log("messages after", messages);
  // };

  // --------- Start block ---------

  useEffect(() => {
    console.log(`current state:`, messages);
  }, [messages]);

  // --------- End block ---------

  return (
    <div>
      <ChatHistory messages={messages} />
      <ChatInput addMessage={addMessage} messages={messages} />
    </div>
  );
};

export default ChatWindow;
