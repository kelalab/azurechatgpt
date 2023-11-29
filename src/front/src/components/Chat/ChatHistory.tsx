import { PropsWithChildren } from "react";
import { Message } from "../../types";
import { AI_NAME } from "../../constants";
import Skeleton, { SkeletonTheme } from "react-loading-skeleton";
import { FaThumbsUp, FaThumbsDown } from "react-icons/fa6";
import "react-loading-skeleton/dist/skeleton.css";

interface CostProps extends PropsWithChildren {
  cost?: Number;
}

const Cost = (props: CostProps) => {
  const { cost } = props;
  return (
    <div className="font-bold text-amber-500 text-xs py-2">
      Hinta: {cost?.toFixed(3)}€
    </div>
  );
};

interface MessageBoxProps extends PropsWithChildren {
  right?: Boolean;
  skeleton?: Boolean;
}

const MessageBox = (props: MessageBoxProps) => {
  const { children, right, user, cost, skeleton } = props;
  if (right)
    return (
      <div className="border-2 rounded-b-xl rounded-tl-xl self-end w-4/5 p-4 text-white bg-slate-800">
        <div className="font-bold text-sky-600 p-2">{user}</div>
        <div className="p-2">{children}</div>
      </div>
    );
  return (
    <SkeletonTheme baseColor="#202020" highlightColor="#444">
      <div className="border-2 rounded-b-xl rounded-tr-xl w-4/5 p-4 text-white">
        <div className="font-bold text-sky-600 p-2">
          {user}
          <div className="inline-flex gap-4 ml-24">
            <span className="text-white text-sm">Arvioi vastaus: </span>
            <button>
              <FaThumbsDown color="red" />
            </button>
            <button className="-rotate-90">
              <FaThumbsUp color="yellow" />
            </button>
            <button>
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
    </SkeletonTheme>
  );
};

const ChatHistory = (props: any) => {
  const { messages, setActiveSource, loading, setThread } = props;
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
      {messages?.map((message: Message, idx: Number) => {
        if (message.visible) {
          if (message.role === "assistant") {
            return (
              <MessageBox key={"msg-" + idx} user={AI_NAME}>
                <div>
                  {message.content.split("\n").map((m, idx) => {
                    return <p key={`p-${idx}`}>{m}</p>;
                  })}
                </div>
                <div className="text-amber-500 text-sm ">
                  <div className="font-bold py-2">Lähteet:</div>
                  {message.sources?.map((source) => {
                    const json = JSON.parse(source);
                    const id = json.id;
                    console.log("id", id, "json", json);
                    return (
                      <div key={id}>
                        <a
                          className="text-sky-500"
                          onClick={() => fetchSource(id)}
                          href={"#"}
                        >
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
      {loading && <MessageBox skeleton user={AI_NAME}></MessageBox>}
    </div>
  );
};
export default ChatHistory;
