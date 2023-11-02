import React, { useState } from "react";
import { Message } from "../../types";

const ChatInput = (props: any) => {
  const { addMessage, messages } = props;
  const [input, setInput] = useState("");
  const [benefit, setBenefit] = useState("Toimeentulotuki");
  //const [messages, setMessages] = useState([]);
  const sendMessage = async (message: string) => {
    console.log("sendMessage", message);
    if (messages.length === 0) {
      const my_msg: Message = { message: message, user: "Me" };
      addMessage(my_msg);
      const response = await fetch(
        `/message?benefit=${benefit}&message=${message}`,
        {
          headers: {
            Accept: "application/json",
          },
          method: "POST",
        }
      );
      const json = await response.json();
      const resp_msg: Message = {
        message: json.response,
        cost: json.cost,
        user: "KelalabGPT",
      };
      addMessage(resp_msg);
      setInput("");
      console.log("response", json);
    } else {
      const my_msg: Message = { message: message, user: "Me" };
      addMessage(my_msg);
      const response = await fetch(`/messages`, {
        headers: {
          Accept: "application/json",
        },
        method: "POST",
        body: JSON.stringify(messages),
      });
    }
  };
  return (
    <div className="flex p-2 border-2">
      <input
        className="flex-1"
        onChange={(e) => setInput(e.currentTarget.value)}
        value={input}
      />
      <button onClick={() => sendMessage(input)}>Lähetä</button>
    </div>
  );
};
export default ChatInput;
