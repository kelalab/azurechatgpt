import { useEffect, useState } from "react";
import NewGPT from "./NewGPT";
import GPT from "./Gpt";
import { Bot } from "../../types";

const ChatSelection = () => {
  const [myBots, setMyBots] = useState([])

  const fetchMyBots = async() => {
    const myBotResp = await fetch('/bot?userName=Testikäyttäjä', {

    })
    if (myBotResp.status === 200){
      const myBotJson = await myBotResp.json();
      console.log('myBotJson', myBotJson)
      setMyBots(myBotJson)
    }
  }

  useEffect(() => {
    /* Load public and own private GPTs here */
    fetchMyBots()
  },[]);
  return (
    <div className="w-full p-2 flex flex-col overflow-hidden">
      <div className="flex flex-col p-8 gap-4">
        <h2 className="pb-4">Valitse käytettävä GPT</h2>
        <h2>Julkiset</h2>
        <div className="flex gap-4">
          {/* <GPT
            icon={<img src="ai-icon.png" className="h-12" />}
            name="selittaja"
            href="chat/selittaja"
          /> */}
          
        </div>
        <div className="border-b-2 border-slate-400"></div>
        <h2>Omat</h2>
        <div className="flex gap-4">
          
          {myBots?.map((bot: Bot, idx) => {
            return (
          <GPT
            key={'bot'+idx}
            icon={<img src="ai-icon.png" className="h-12" />}
            name={bot.name}
            href={`/chat/${bot.id}`}
            description={bot.description}
          />
        )})}</div>
        <div className="border-b-2 border-slate-400"></div>
        <h2>Toiminnot</h2>
        <NewGPT description="Luo uusi avustaja."/>
      </div>
    </div>
  );
};
export default ChatSelection;
