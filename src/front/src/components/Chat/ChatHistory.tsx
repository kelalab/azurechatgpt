import React, { PropsWithChildren } from "react";
import { Message } from "../../types";
import { AI_NAME } from "../../constants";

interface CostProps extends PropsWithChildren {
  cost?: Number;
}

const Cost = (props: CostProps) => {
  const { cost } = props;
  return (
    <div className="font-bold text-amber-500 text-sm py-2">
      Cost: {cost?.toFixed(3)}€
    </div>
  );
};

interface MessageBoxProps extends PropsWithChildren {
  right?: Boolean;
}

const MessageBox = (props: MessageBoxProps) => {
  const { children, right, user, cost } = props;
  if (right)
    return (
      <div className="border-2 rounded-b-xl rounded-tl-xl self-end w-4/5 p-4 text-white bg-slate-800">
        <div className="font-bold text-sky-600 p-2">{user}</div>
        <div className="p-2">{children}</div>
      </div>
    );
  return (
    <div className="border-2 rounded-b-xl rounded-tr-xl w-4/5 p-4 text-white">
      <div className="font-bold text-sky-600 p-2">{user}</div>
      <div className="p-2">{children}</div>
    </div>
  );
};

const ChatHistory = (props: any) => {
  const messages = props.messages;
  console.log("messages: ", messages);
  return (
    <div
      id="chat-history"
      className="flex flex-col gap-4 overflow-y-auto scroll-smooth"
    >
      {messages.map((message: Message, idx: Number) => {
        if (message.visible) {
          if (message.role === "assistant") {
            return (
              <MessageBox key={"msg-" + idx} user={AI_NAME}>
                <div>{message.content}</div>
                <Cost cost={message.cost} />
              </MessageBox>
            );
          } else
            return (
              <MessageBox key={"msg-" + idx} right user="Me">
                <div>{message.content.replace(/```/g, "")}</div>
              </MessageBox>
            );
        }
      })}
    </div>
  );
};
export default ChatHistory;
