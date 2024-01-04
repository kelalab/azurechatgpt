import { useEffect, useState } from "react";
import TopBar from "../Layout/TopBar";
import { v4 } from "uuid";
import ChatWindow from "./ChatWindow";

const ChatCreator = () => {
  const [activeSource, setActiveSource] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [thread, setThread] = useState(v4());
  const [showSettings, setShowSettings] = useState(false);
  const [llm, setLlm] = useState("gpt-35-turbo-16k");
  const [systemPrompt, setSystemPrompt] = useState("");

  const setDefaults = () => {
    const defaultSystem = `CreatorBot is designed to assist the user in creating a new system prompt for a another ai assistant. Answer with a system prompt for the new bot.`;
    localStorage.setItem("creatorSystemPrompt", defaultSystem);
    setSystemPrompt(defaultSystem);

    const defaultLlm = "gpt-35-turbo-16k";
    localStorage.setItem("creatorllm", defaultLlm);
    setLlm(defaultLlm);
  };

  useEffect(() => {
    const _llm = localStorage.getItem("creatorllm");
    if (_llm && _llm !== llm) {
      setLlm(_llm);
    }
    const sPrompt = localStorage.getItem("creatorSystemPrompt");
    if (sPrompt && sPrompt !== systemPrompt) {
      setSystemPrompt(sPrompt);
    }

    if (!sPrompt || sPrompt.length === 0) {
      setDefaults();
    }
  }, []);

  const handleLlmSelect = (e, v) => {
    //console.log("handleLlmSelect", e);
    setLlm(e.target.value);
    localStorage.setItem("creatorllm", e.target.value);
  };

  const changeSystemPrompt = (e) => {
    localStorage.setItem("creatorSystemPrompt", e.target.value);
    setSystemPrompt(e.target.value);
  };

  return (
    <div className="w-full h-full p-2 items-center flex flex-col overflow-hidden">
      <TopBar icon="/ai-icon.png" title="ChatCreator">
        <div className="p-2">
          {/* <label className="text-white mr-4">Valitse etuus:</label>
           <select className="p-4 border-white border-2 rounded-lg bg-slate-950 text-white">
            <option>Toimeentulotuki</option>
            <option>Asumistuki</option>
          </select>*/}
        </div>
      </TopBar>
      <div className="flex flex-col w-full items-center justify-center">
        <button
          className="border-2 p-2"
          onClick={() => setShowSettings(!showSettings)}
        >
          {showSettings
            ? "Piilota keskustelun asetukset"
            : "Keskustelun asetukset"}
        </button>
        {showSettings && (
          <div className="flex flex-col gap-3 p-4 border-2">
            <div className="flex flex-col items-center gap-2">
              <button className="border-2 p-2" onClick={() => setDefaults()}>
                Palauta oletukset
              </button>
            </div>
            <div className="flex items-center gap-2 justify-between">
              Kielimalli:{" "}
              <select
                value={llm}
                onChange={handleLlmSelect}
                className="bg-transparent p-2 border-2 rounded-md"
              >
                <option value="gpt-35-turbo-16k">GPT 3.5 Turbo 16k</option>
                <option value="gpt-35-turbo-1106">GPT 3.5 Turbo 1106</option>
                <option value="gpt-4-turbo">GPT 4 Turbo</option>
              </select>
            </div>
            <div className="flex items-center gap-2 justify-between">
              System prompt:
              <textarea
                class="bg-transparent p-2 border-2"
                rows="6"
                cols="70"
                value={systemPrompt}
                onChange={(e) => changeSystemPrompt(e)}
              ></textarea>
            </div>
          </div>
        )}
      </div>
      <div className="flex w-full h-full">
        <ChatWindow
          activeSource={activeSource}
          setActiveSource={setActiveSource}
          thread={thread}
          setThread={setThread}
          loading={loading}
          setLoading={setLoading}
          llm={llm}
          systemPrompt={systemPrompt}
          combinePrompt={null}
        />
        {activeSource && (
          <div className="flex-1 overflow-y-auto chat-window border-l-2 px-2">
            <ActiveSource
              activeSource={activeSource}
              setActiveSource={setActiveSource}
            />
          </div>
        )}
      </div>
    </div>
  );
};
export default ChatCreator;