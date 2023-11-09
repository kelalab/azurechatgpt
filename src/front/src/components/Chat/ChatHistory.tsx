import { PropsWithChildren } from "react";
import { Message } from "../../types";
import { AI_NAME } from "../../constants";

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
    <div className="border-2 rounded-b-xl rounded-tr-xl w-4/5 p-4 text-white">
      <div className="font-bold text-sky-600 p-2">{user}</div>
      <div className="p-2">{children}</div>
    </div>
  );
};

const ChatHistory = (props: any) => {
  const { messages, setActiveSource, loading } = props;
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
                  {message.content.split("\n").map((m) => {
                    return <p>{m}</p>;
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
                          {json["Header 2"]}
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
      {loading && <MessageBox skeleton user={AI_NAME} />}
    </div>
  );
};
export default ChatHistory;
