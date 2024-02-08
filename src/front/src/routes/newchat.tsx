import { useState } from "react";
import ChatCreator from "../components/Chat/ChatCreator";
import Chat from "./chat";
import ChatRoot from "../components/Chat";
import { v4 } from 'uuid';
import Layout from "../components/Layout";

const NewChat = () => {
  const [newChatName, setNewChatName] = useState('Uusi')
  const [newChatSystemPrompt, setNewChatSystemPrompt] = useState('')
  const [newChatId, setNewChatId] = useState(v4())
  const [newChatFile, setNewChatFile] = useState(null)
  const [newChatDescription, setNewChatDescription] = useState('')
  const newChatTemperature = 0.0
  const newChatModel="gpt-35-turbo-1106"

  const uploadFile = async (event: Event) => {
    console.log('upload called', event);
    const target = event.target as HTMLInputElement;
    const files = target?.files;
    let req_data = new FormData()
    if (files)
      req_data.append("file", files[0])
    //req_data.append("assistantId", newChatId)
    await fetch(`/add_document?benefit=sotu&assistantId=${newChatId}&useHay=true`, {
      method: 'POST',
      body: req_data
    })
  }

  const save = async () => {
    console.log('save', 'id:', newChatId, 'name:', newChatName, 'prompt:', newChatSystemPrompt);
    const saveResponse = await fetch('/bot', {
      method: 'PUT',
      headers: {
        'Accept': 'application/json',
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        id: newChatId,
        name: newChatName,
        description: newChatDescription,
        model: newChatModel,
        temperature: newChatTemperature,
        prompt: newChatSystemPrompt,
        creator: "Testikäyttäjä",
        public: false
      })
    });
    const saveJson = await saveResponse.json()
    console.log('save response:', saveJson)
  }

  return (
    <Layout>
        <ChatCreator save={save} newChatName={newChatName} newChatSystemPrompt={newChatSystemPrompt} setNewChatName={setNewChatName} setNewChatSystemPrompt={setNewChatSystemPrompt} uploadFile={uploadFile} newChatId={newChatId} newChatDescription={newChatDescription} setNewChatDescription={setNewChatDescription}/>
    </Layout>
  );
};
export default NewChat;
