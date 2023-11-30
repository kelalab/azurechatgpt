import React, { useEffect, useState } from "react";
import { Message } from "../../types";

const func = (json_msgs: Message[]) => {
  let list = [];
  for (let msg of json_msgs) {
    let _msg: Message = msg;
    if (_msg.role == "system") {
      _msg.visible = false;
    } else {
      _msg.visible = true;
    }
    console.log("_msg", _msg);
    list.push(_msg);
  }
  return list;
};

const ChatInput = (props: any) => {
  const {
    addMessage,
    resetMessages,
    setAllMessages,
    messages,
    loading,
    setLoading,
    thread,
    setThread,
  } = props;
  const [input, setInput] = useState("");
  const [benefit, setBenefit] = useState("Toimeentulotuki");

  const scrollToLast = () => {
    const chat_history = document.querySelector("#chat-history");
    console.log(chat_history);
    const last = chat_history?.lastChild;
    console.log("last", last);
    last?.scrollIntoView();
  };

  const sendMessage = async (message: string) => {
    console.log("sendMessage", message);
    // if we are waiting for response we shouldn't be able to send another message
    if (loading) return;
    if (messages.length === 0) {
      const my_msg: Message = { content: message, role: "user", visible: true };
      addMessage(my_msg);
      setLoading(true);
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
      const json_msgs: Message[] = json.messages;
      // clear our message list
      if (json_msgs.length > 0) {
        resetMessages();
      }
      console.log("jsonmessages", json_msgs);
      for (let msg of json_msgs) {
        let _msg: Message = msg;
        if (_msg.role == "system") {
          _msg.visible = false;
        } else {
          _msg.visible = true;
        }
        console.log("_msg", _msg);
        addMessage(_msg);
      }
      const resp_msg: Message = {
        uuid: json.response.uuid,
        content: json.response.message,
        cost: json.response.cost,
        //user: "KelalabGPT",
        role: json.response.role,
        sources: json.response.sources,
        visible: true,
      };
      addMessage(resp_msg);
      setInput("");
      setThread(json.session_uuid);
      setLoading(false);
    } else {
      const my_msg: Message = { content: message, role: "user", visible: true };
      addMessage(my_msg);
      const messages_to_send = messages.map((m: Message) => {
        return {
          content: m.content,
          role: m.role,
          cost: m.cost,
          sources: m.sources,
        };
      });
      messages_to_send.push({ content: my_msg.content, role: my_msg.role });
      console.log("messages_to_send", messages_to_send);
      const response = await fetch(
        `/messages?benefit=${benefit}&session_uuid=${thread}`,
        {
          headers: {
            Accept: "application/json",
            "Content-Type": "application/json",
          },
          method: "POST",
          body: JSON.stringify({ data: messages_to_send }),
        }
      );
      const json = await response.json();
      const json_msgs: Message[] = json.messages;
      // clear our message list
      if (json_msgs.length > 0) {
        resetMessages();
      }
      const r_list = func(json_msgs);
      const resp_msg: Message = {
        content: json.response.message,
        cost: json.response.cost,
        role: json.response.role,
        sources: json.response.sources,
        visible: true,
      };
      r_list.push(resp_msg);
      setAllMessages(r_list);
      setInput("");
    }
  };

  useEffect(() => {
    scrollToLast();
  }, [messages]);

  const handleKey = (keyboardEvent: KeyboardEvent) => {
    //console.log("key input", keyboardEvent.key);
    if (keyboardEvent.key == "Enter") {
      sendMessage(input);
    }
  };

  return (
    <div className="flex p-2 border-2 rounded-lg mx-8">
      <input
        className="flex-1 bg-slate-950 text-white"
        onChange={(e) => setInput(e.currentTarget.value)}
        onKeyUp={handleKey}
        value={input}
      />
      <button
        className="border-2 p-2 rounded-lg text-white"
        onClick={() => sendMessage(input)}
      >
        Lähetä
      </button>
    </div>
  );
};
export default ChatInput;
