import { PropsWithChildren, useState } from "react";
import { RMessage, Source } from "../../types";
import { AI_NAME } from "../../constants";
import { FaThumbsUp, FaThumbsDown } from "react-icons/fa6";
import "./chathistory.css";
import ChatMessage from "../../../kds/dist/esm/ChatMessage";
import Text from "../../../kds/dist/esm/Text";

interface CostProps extends PropsWithChildren {
  cost?: Number;
  llm?: string;
}

const Cost = (props: CostProps) => {
  const { cost, llm } = props;
  return (
    <div className="font-bold amber text-xs py-2">
      Hinta: {cost?.toFixed(3)}€ ({llm})
    </div>
  );
};

interface MessageBoxProps extends PropsWithChildren {
  right?: Boolean;
  skeleton?: Boolean;
  message?: RMessage;
  user?: string;
  cost?: Number;
}

const MessageBox = (props: MessageBoxProps) => {
  const { children, right, user, cost, skeleton, message } = props;
  const [evaluation, setEvaluation] = useState(-1);
  const sendEvaluation = async (messageId?: string, score?: number) => {
    if (!messageId || !score) return;
    const response = await fetch(
      `/thumb?message_id=${messageId}&thumb=${score}`
    );
    setEvaluation(score);
  };

  if (right)
    return (
      <>
        {/*<div className="message__wrapper right border-2 rounded-b-xl rounded-tl-xl self-end w-4/5 p-4">
          <div className="font-bold text-sky-600 p-2">{user}</div>
          <div className="p-2">{children}</div>
        </div>*/}
        <ChatMessage position="right" animate={false} name={user}>
          <Text className="dark:text-kela-gray-100">{children}</Text>
        </ChatMessage>
      </>
    );
  return (
    <>
    <ChatMessage position="left" loading={skeleton} name={user}>
      <>{children}</>
    </ChatMessage>
    {/* <SkeletonTheme baseColor="#202020" highlightColor="#444">
      <div className="message__wrapper border-2 rounded-b-xl rounded-tr-xl w-4/5 p-4">
        <div className="font-bold text-sky-600 p-2 flex flex-wrap justify-between">
          {user}
          <div className="inline-flex gap-4">
            <span className="text-sm">Arvioi vastaus: </span>
            <button
              onClick={() => sendEvaluation(message?.uuid, 0)}
              className={
                evaluation == 0 ?
                  "outline outline-offset-2 rounded-sm outline-2" :
                  ""
              }
            >
              <FaThumbsDown color="red" />
            </button>
            <button
              onClick={() => sendEvaluation(message?.uuid, 2)}
              className={
                evaluation == 2 ?
                  "outline outline-offset-2 rounded-sm outline-2" :
                  ""
              }
            >
              <div className="-rotate-90">
                <FaThumbsUp color="yellow" />
              </div>
            </button>
            <button
              onClick={() => sendEvaluation(message?.uuid, 4)}
              className={
                evaluation == 4 ?
                  "outline outline-offset-2 rounded-sm outline-2" :
                  ""
              }
            >
              <FaThumbsUp color="green" />
            </button>
          </div>
        </div>
        <div className="p-2">
          {skeleton ? (
            <>
              <p className="mb-2">
                <Skeleton className="mb-2" inline count={3} />
              </p>
              <p className="mb-2">
                <Skeleton className="mb-2" count={1} />
              </p>
              <Skeleton className="mb-2" count={1} />
            </>
          ) : (
            children
          )}
        </div>
      </div>
    </SkeletonTheme> */}
    </>
  );
};

const ChatHistory = (props: any) => {
  const { messages, setActiveSource, loading, setThread, llm, assistantId } = props;
  console.log("messages: ", messages);

  const fetchSource = async (id: String) => {
    const response = await fetch(`/get_source?id=${id}`);
    const json = await response.json();
    console.log("json", json);
    setActiveSource(json[0][1]);
  };

  return (
    <div
      id="chat-history"
      className="flex flex-col gap-4 overflow-y-auto scroll-smooth"
    >
      {messages?.map((message: RMessage, idx: Number) => {
        if (message.visible && message.message?.content) {
          if (message?.message?.role === "assistant") {
            return (
              <MessageBox key={"msg-" + idx} user={AI_NAME} message={message}>
                <>
                  {message?.message?.content?.split("\n").map((m, idx) => {
                    return <span key={`p-${idx}`}>{m}</span>;
                  })}
                </>
                <div className="amber text-sm ">
                  <div className="font-bold py-2">Lähteet:</div>
                  {message.sources?.map((source) => {
                    // force cast to Source
                    let json = source as unknown as Source;
                    try {
                      json = JSON.parse(source);
                    } catch (e) {

                    }
                    const id = json.id;
                    //console.log("id", id, "json", json);
                    return (
                      <div key={id}>
                        <a onClick={() => json?.content ? setActiveSource(json.content) : () => fetchSource(id)} href={"#"}>
                          {json["source"] || json?.meta?.filename}
                          {json["Header 1"]}
                          {json["Header 2"] && "/" + json["Header 2"]}
                          {json["Header 3"] && "/" + json["Header 3"]}
                          {json["Header 4"] && "/" + json["Header 4"]}
                          {json["Header 5"] && "/" + json["Header 5"]}
                          {json["Header 6"] && "/" + json["Header 6"]}
                        </a>
                      </div>
                    );
                  })}
                </div>
                <Cost cost={message.cost} llm={llm} />
              </MessageBox>
            );
          } else
            if (!message?.message?.content) {
              return null;
            }
          return (
            <MessageBox key={"msg-" + idx} right user="Minä">
              {message.message.content.replace(/```/g, "")}
            </MessageBox>
          );
        }
      })}
      {loading && <MessageBox skeleton user={AI_NAME}></MessageBox>}
    </div>
  );
};
export default ChatHistory;
