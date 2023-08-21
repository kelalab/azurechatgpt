import { FC, useState } from "react";
import { ChatType, ConversationStyle, LLMModel } from "../chat-services/models";
import { ChatModelSelector } from "./chat-model-selector";
import { ChatStyleSelector } from "./chat-style-selector";
import { ChatTypeSelector } from "./chat-type-selector";
import { Button } from "@/components/ui/button";

interface Prop {
  chatType: ChatType;
  conversationStyle: ConversationStyle;
  llmModel: LLMModel;
}

export const ChatHeader: FC<Prop> = (props) => {
  const [show, setShow] = useState(false);
  return (
    <div className="flex flex-wrap gap-2 justify-center">
      <div className={show ? "visible" : "invisible h-0"}>
        <ChatTypeSelector disable={true} chatType={props.chatType} />
        <ChatModelSelector disable={true} llmModel={props.llmModel} />
        <ChatStyleSelector
          disable={true}
          conversationStyle={props.conversationStyle}
        />
      </div>
      <Button variant="link" onClick={() => setShow(!show)}>
        {show ? "Hide" : "Show"} parameters for this chat
      </Button>
    </div>
  );
};
