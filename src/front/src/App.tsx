import React, { useState } from "react";
import ChatWindow from "./components/Chat/ChatWindow";
import { Message } from "./types";
import TopBar from "./components/Layout/TopBar";

const App = () => {
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
      <ChatWindow />
    </div>
  );
};

export default App;
