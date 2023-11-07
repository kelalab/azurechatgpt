import React, { useState } from "react";
import ChatWindow from "./components/Chat/ChatWindow";
import { Message } from "./types";
import TopBar from "./components/Layout/TopBar";
import ActiveSource from "./components/Chat/ActiveSource";

const App = () => {
  const [activeSource, setActiveSource] = useState("");

  return (
    <div className="w-full h-full p-2 items-center flex flex-col bg-slate-950 overflow-hidden">
      <TopBar icon="ai-icon.png" title="Selittäjä">
        <div className="p-2">
          <label className="text-white mr-4">Valitse etuus:</label>
          <select className="p-4 border-white border-2 rounded-lg bg-slate-950 text-white">
            <option>Toimeentulotuki</option>
            <option>Asumistuki</option>
          </select>
        </div>
      </TopBar>
      <div className="flex w-full h-full">
        <ChatWindow
          activeSource={activeSource}
          setActiveSource={setActiveSource}
        />
        {activeSource && (
          <div className="flex-1 overflow-y-auto chat-window">
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

export default App;
