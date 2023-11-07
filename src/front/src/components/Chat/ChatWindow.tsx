import { useState } from "react";
import ChatHistory from "./ChatHistory";
import ChatInput from "./ChatInput";
import { Message } from "../../types";

const ChatWindow = (props: any) => {
  const [messages, setMessages] = useState<Message[]>([]);
  const { activeSource, setActiveSource } = props;
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
    <div className="chat-window w-4/5 flex-1 h-full gap-4 flex flex-col justify-between overflow-hidden">
      <ChatHistory messages={messages} setActiveSource={setActiveSource} />
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
