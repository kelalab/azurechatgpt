import React, { useState } from "react";
import ChatWindow from "./components/Chat/ChatWindow";
import { Message } from "./types";

const App = () => {
  const [messages, setMessages] = useState<Message[]>([]);
  const addMessage = (message: Message) => {
    setMessages((prev_state) => {
      return [...prev_state, message];
    });
  };
  return <ChatWindow messages={messages} addMessage={addMessage} />;
};

export default App;
