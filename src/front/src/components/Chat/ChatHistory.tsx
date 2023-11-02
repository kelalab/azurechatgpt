import React from "react";
import { Message } from "../../types";
import { AI_NAME } from "../../constants";

const ChatHistory = (props: any) => {
  const messages = props.messages;
  console.log("messages: ", messages);
  return (
    <div>
      ChatHistory
      <div className="flex flex-col">
        {messages.map((message, idx: Number) => {
          if (message.user === AI_NAME) {
            return (
              <div key={idx} className="border-2 self-end w-4/5">
                <div>{message.user}</div>
                <div>{message.message}</div>
                <div>{message.cost}</div>
              </div>
            );
          } else
            return (
              <div key={idx} className="border-2 w-4/5">
                <div>{message.user}</div>
                <div>{message.message}</div>
                <div>{message.cost}</div>
              </div>
            );
        })}
      </div>
    </div>
  );
};
export default ChatHistory;
