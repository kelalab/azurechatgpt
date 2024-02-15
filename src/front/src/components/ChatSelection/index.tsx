import { useContext, useEffect, useReducer, useState } from "react";
import NewGPT from "./NewGPT";
import GPT from "./Gpt";
import { Bot } from "../../types";
import { Heading, Text } from "../../../kds/dist/esm/index";
import MyBotsContext, { MyBotsActions, myBotsReducer, initialState } from "../../context/MyBotsContext";
import { useQueryClient, useQuery } from '@tanstack/react-query';
import { fetchMyBots } from "../../queries/bots";

const ChatSelection = () => {
  //const {state, dispatch} = useContext(MyBotsContext);
  const {state, dispatch} = useContext(MyBotsContext);
  const query = useQuery({queryKey: ['myBots'], queryFn: fetchMyBots})

  //const [state, dispatch] = useReducer(myBotsReducer, initialState);
  //const [myBots, setMyBots] = useState([])
  //console.log('state', _myBots)
  //console.log('state', state)
  const myBots = query.data;
  //const myBots = state.myBots;
  console.log('myBots', myBots)
  //const myBots = state.myBots;
  /*const fetchMyBots = async () => {
    const myBotResp = await fetch('/bot?userName=Testikäyttäjä', {

    })
    if (myBotResp.status === 200) {
      const myBotJson = await myBotResp.json();
      console.log('myBotJson', myBotJson)
      //setMyBots(myBotJson)
      dispatch({ type: MyBotsActions.SET_BOTS, payload: myBotJson })
    }
  }*/

  useEffect(() => {
    /* Load public and own private GPTs here */
    fetchMyBots()
  }, []);
  return (
      <div className="w-full p-2 flex flex-col overflow-hidden">
        <div className="flex flex-col p-8 gap-4">
          <div className="bg-kela-blue-80 -ml-24 -mr-24 px-24 py-6">
            <Heading as="h2" className="pb-4 text-white ">Valitse käytettävä avustaja</Heading>
            <Text className="text-white">Alta voit valita avustajan jonka kanssa haluat keskustella. Muistathan, että avustajalle <span className="font-bold underline underline-offset-2">ei sovi lähettää asiakastietoja!</span></Text>
          </div>
          <Heading as="h2" className="dark:text-white">Julkiset</Heading>
          <div className="flex gap-4">
            {/* <GPT
            icon={<img src="ai-icon.png" className="h-12" />}
            name="selittaja"
            href="chat/selittaja"
          /> */}

          </div>
          <div className="border-b-2 border-slate-400"></div>
          <Heading as="h2" className="dark:text-white">Omat</Heading>
          <div className="flex gap-4">

            {myBots?.map((bot: Bot, idx) => {
              return (
                <GPT
                  key={'bot' + idx}
                  icon={<img src="ai-icon.png" className="h-12" />}
                  name={bot.name}
                  href={`/chat/${bot.id}`}
                  description={bot.description}
                />
              )
            })}</div>
          <div className="border-b-2 border-slate-400"></div>
          <Heading as="h2" className="dark:text-white">Toiminnot</Heading>
          <NewGPT description="Luo uusi avustaja." />
        </div>
      </div>
    // </MyBotsContext.Provider>
  );
};
export default ChatSelection;
