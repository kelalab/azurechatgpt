import { useState } from "react";
import ChatHistory from "./ChatHistory";
import ChatInput from "./ChatInput";
import { Message } from "../../types";

const ChatWindow = (props: any) => {
  const [messages, setMessages] = useState<Message[]>([]);
  const {
    activeSource,
    setActiveSource,
    loading,
    setLoading,
    setThread,
    thread,
    llm,
    systemPrompt,
    combinePrompt,
    useHay,
    rag,
    functions_for_llm,
    setAssistantName,
    setAssistantSystemPrompt,
    assistantId,
    setAssistantDescription
  } = props;
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
    <div className="chat-window w-4/5 flex-1 h-full gap-4 flex flex-col justify-between overflow-hidden px-2">
      <ChatHistory
        messages={messages}
        setActiveSource={setActiveSource}
        loading={loading}
        setThread={setThread}
        llm={llm}
        assistantId={assistantId}
      />
      <ChatInput
        addMessage={addMessage}
        resetMessages={resetMessages}
        setAllMessages={setAllMessages}
        messages={messages}
        loading={loading}
        setLoading={setLoading}
        thread={thread}
        setThread={setThread}
        llm={llm}
        systemPrompt={systemPrompt}
        combinePrompt={combinePrompt}
        useHay={useHay}
        rag={rag}
        functions_for_llm={functions_for_llm}
        setAssistantName={setAssistantName}
        setAssistantSystemPrompt={setAssistantSystemPrompt}
        assistantId={assistantId}
        setAssistantDescription={setAssistantDescription}
      />
    </div>
  );
};

export default ChatWindow;
