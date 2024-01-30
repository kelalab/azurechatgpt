import React, { KeyboardEvent, useEffect, useState } from "react";
import { RMessage, Message } from "../../types";
import "./chatinput.css";

const func = (json_msgs: RMessage[]) => {
  let list = [];
  for (let msg of json_msgs) {
    let _rmsg: RMessage = msg;
    let _msg = _rmsg.message;
    if (_msg?.role == "system") {
      _rmsg.visible = false;
    } else {
      _rmsg.visible = true;
    }
    //console.log("_msg", _rmsg);
    list.push(_rmsg);
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
  const [input, setInput] = useState("");
  const [benefit, setBenefit] = useState("Toimeentulotuki");

  const scrollToLast = () => {
    const chat_history = document.querySelector("#chat-history");
    //console.log(chat_history);
    const last = chat_history?.lastChild as HTMLElement;
    console.log("last", last);
    last?.scrollIntoView();
  };

  const sendMessage = async (message: string) => {
    console.log("sendMessage", message);
    // if we are waiting for response we shouldn't be able to send another message
    if (loading) return;
    if (messages.length === 0) {
      const my_msg: RMessage = {
        message: {
          content: message,
          role: "user",
        },
        visible: true,
      };
      addMessage(my_msg);
      setLoading(true);
      const response = await fetch(
        `/message?index=${assistantId}&message=${message}&llm=${llm}&systemPrompt=${systemPrompt}&combinePrompt=${combinePrompt}&useHay=${useHay}&rag=${rag}&functions=${JSON.stringify(functions_for_llm)}`,
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
        let _rmsg: RMessage = {}
        let _msg: Message = msg;
        _rmsg.message = _msg;
        //const _msg = _rmsg.message;
        if (_msg.role == "system") {
          _rmsg.visible = false;
        } else {
          _rmsg.visible = true;
        }
        console.log("_msg", _msg);

        addMessage(_rmsg);
      }
      const resp_msg: RMessage = {
        uuid: json.response.uuid,
        message: json.response.message,
        cost: json.response.cost,
        //user: "KelalabGPT",
        //role: json.response.role,
        sources: json.response.sources,
        visible: true,
      };
      addMessage(resp_msg);
      setInput("");
      setThread(json.session_uuid);
      setLoading(false);
    } else {
      const my_msg: RMessage = {
        message: {
          content: message,
          role: "user",
        },
        visible: true,
      };
      addMessage(my_msg);
      const messages_to_send = messages.map((m: RMessage) => {
        return {
          uuid: m.uuid,
          message: m.message,
          //content: m.message.content,
          //role: m.message.role,
          cost: m.cost,
          sources: m.sources,
          visible: m.visible
        };
      });
      messages_to_send.push({
        message: my_msg.message
      });
      console.log("messages_to_send", messages_to_send);
      const response = await fetch(
        `/messages?benefit=${benefit}&session_uuid=${thread}&llm=${llm}&systemPrompt=${systemPrompt}&combinePrompt=${combinePrompt}&rag=${rag}&functions=${JSON.stringify(functions_for_llm)}`,
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
      const json_msgs: RMessage[] = json.messages;
      // clear our message list
      if (json_msgs.length > 0) {
        resetMessages();
      }
      const r_list = func(json_msgs);

      if (json.response.message.tool_calls?.length > 0) {
        console.log('received function call!');

        const resp_msg: RMessage = {
          uuid: json.response.uuid,
          message: json.response.message,
          cost: json.response.cost,
          sources: json.response.sources,
          visible: false,
        };
        r_list.push(resp_msg);
        messages_to_send.push(resp_msg)
        const calls = json.response.message.tool_calls;
        const call = calls[0];
        const functionName = call.function?.name;
        const functionArguments = call.function?.arguments;
        const func_resp_message = {
          message: {
            role: "tool",
            tool_call_id: call.id,
            name: functionName,
            content: "done",
          },
          visible: false
        }
        if (functionName == 'setAssistantName') {
          messages_to_send.push(func_resp_message)
          r_list.push(func_resp_message);
          setAssistantName(JSON.parse(functionArguments).name)
        }
        else if(functionName == 'setAssistantSystemPrompt'){
          setAssistantSystemPrompt(JSON.parse(functionArguments).prompt)
          messages_to_send.push(func_resp_message)
          r_list.push(func_resp_message);
        }
        else if(functionName == 'setAssistantDescription'){
          setAssistantDescription(JSON.parse(functionArguments).description)
          messages_to_send.push(func_resp_message)
          r_list.push(func_resp_message);
        }
        //test updating list in between calls
        setAllMessages(r_list);
        const response2 = await fetch(
          `/messages?benefit=${benefit}&session_uuid=${thread}&llm=${llm}&systemPrompt=${systemPrompt}&combinePrompt=${combinePrompt}&rag=${rag}&functions=${JSON.stringify(functions_for_llm)}`,
          {
            headers: {
              Accept: "application/json",
              "Content-Type": "application/json",
            },
            method: "POST",
            body: JSON.stringify({ data: messages_to_send }),
          }
        );
        console.log('response2', response2)
        const json2 = await response2.json()
        const resp_msg2: RMessage = {
          uuid: json2.response.uuid,
          message: json2.response.message,
          cost: json2.response.cost,
          sources: json2.response.sources,
          visible: true,
        };
        r_list.push(resp_msg2);
        setAllMessages(r_list);
        setInput("");

      }
      else {
        const resp_msg: RMessage = {
          uuid: json.response.uuid,
          message: json.response.message,
          cost: json.response.cost,
          sources: json.response.sources,
          visible: true,
        };
        r_list.push(resp_msg);
        setAllMessages(r_list);
        setInput("");
      }
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
    <div className="input-wrapper flex p-2 border-2 rounded-lg mx-8">
      <input
        className="flex-1"
        onChange={(e) => setInput(e.currentTarget.value)}
        onKeyUp={handleKey}
        value={input}
      />
      <button
        className="border-2 p-2 rounded-lg"
        onClick={() => sendMessage(input)}
      >
        Lähetä
      </button>
    </div>
  );
};
export default ChatInput;
