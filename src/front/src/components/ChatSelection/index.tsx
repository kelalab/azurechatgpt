import { useEffect } from "react";
import NewGPT from "./NewGPT";
import GPT from "./Gpt";

const ChatSelection = () => {
  useEffect(() => {
    /* Load public and own private GPTs here */
  });
  return (
    <div className="w-full h-full p-2 items-center justify-center flex flex-col overflow-hidden">
      <div className="items-center flex flex-col p-8 border-2 rounded-lg">
        <h1 className="pb-4">Valitse käytettävä GPT</h1>
        <div className="flex gap-4">
          <GPT
            icon={<img src="ai-icon.png" className="h-12" />}
            name="selittaja"
            href="chat/selittaja"
          />
          <NewGPT />
        </div>
      </div>
    </div>
  );
};
export default ChatSelection;
