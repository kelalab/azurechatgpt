import { ChangeEvent, MouseEvent, PropsWithChildren, useEffect, useState } from "react";
import { v4 } from "uuid";
import ChatWindow from "./ChatWindow";
import { Accordion, AccordionBody, AccordionToggle, Alert, Button, Checkbox, Heading, InputGroup, Select, Text } from "../../../kds/dist/esm/index";
import InputLabel from "../../../kds/dist/esm/InputLabel";
import Input from "../Input";
import Textarea from "../Textarea";

interface CreatorProps extends PropsWithChildren {
  newChatName: string;
  setNewChatName: Function;
  newChatSystemPrompt: string;
  setNewChatSystemPrompt: Function;
  newChatDescription: string;
  setNewChatDescription: Function;
  uploadFile: Function;
  newChatId: string;
  save: Function;
}

const ChatCreator = (props: CreatorProps) => {
  const { newChatName, setNewChatName, newChatSystemPrompt, setNewChatSystemPrompt, newChatDescription, setNewChatDescription, uploadFile, newChatId, save } = props;
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [thread, setThread] = useState(v4());
  const [showSettings, setShowSettings] = useState(false);
  const [llm, setLlm] = useState("gpt-35-turbo-16k");
  const [systemPrompt, setSystemPrompt] = useState("");
  const [publc, setPublc] = useState(false);
  const [saving, setSaving] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);

  const functions_for_llm = [
    {
      type: "function",
      function: {
        name: "setAssistantName",
        description: "Set name for a new openai assistant",
        parameters: {
          type: "object",
          properties: {
            name: {
              type: "string",
              description: 'Name of the new assistant, e.g. MyAssistant',
            },
          },
          required: ["name"],
        },
      },
    },
    {
      type: "function",
      function: {
        name: "setAssistantSystemPrompt",
        description: "Set system prompt for a new openai assistant",
        parameters: {
          type: "object",
          properties: {
            prompt: {
              type: "string",
              description: 'The complete system prompt for a new assistant',
            },
          },
          required: ["prompt"],
        },
      },
    },
    {
      type: "function",
      function: {
        name: "setAssistantDescription",
        description: "Set brief description for a new openai assistant",
        parameters: {
          type: "object",
          properties: {
            description: {
              type: "string",
              description: 'Brief description of the assistant',
            },
          },
          required: ["description"],
        },
      },
    },
  ]

  const setAssistantName = (name: string) => {
    console.log('setAssistantName called')
    setNewChatName(name)
  }

  const setAssistantSystemPrompt = (prompt: string) => {
    console.log('setAssistantSystemPrompt called')
    setNewChatSystemPrompt(prompt)
  }

  const setAssistantDescription = (description: string) => {
    console.log("setAssistantDescription called")
    setNewChatDescription(description)
  }

  const setDefaults = () => {
    const defaultSystem = `CreatorBot is designed to assist the user in creating a new ai assistant.
    Start by asking user what the new assistant will be used for.
    Next ask the user if they wish to generate a name for the assistant. Generate a name for the if the user wishes so and
    ALWAYS ask for confimation about the generated name.

    After you have got confirmation from the that they accept the generated name, call function setAssistantName and continue with the next step.
    Provide user with an internal system prompt suitable for the ai assistant. You can ask the user questionss that help CreatorBot form a system promt.
    ALWAYS ask for confimation that the prompt is acceptable.

    Finally, create a short summarizing description (max 100 characters) of the assistant and ask the user for confirmation.
    `;
    //localStorage.setItem("creatorSystemPrompt", defaultSystem);
    setSystemPrompt(defaultSystem);

    const defaultLlm = "gpt-35-turbo-16k";
    //localStorage.setItem("creatorllm", defaultLlm);
    setLlm(defaultLlm);
  };

  useEffect(() => {
    /*const _llm = localStorage.getItem("creatorllm");
    if (_llm && _llm !== llm) {
      setLlm(_llm);
    }
    const sPrompt = localStorage.getItem("creatorSystemPrompt");
    if (sPrompt && sPrompt !== systemPrompt) {
      setSystemPrompt(sPrompt);
    }
    */
    if (!systemPrompt || systemPrompt.length === 0) {
      setDefaults();
    }
  }, []);

  const handleLlmSelect = (e: ChangeEvent<HTMLSelectElement>) => {
    //console.log("handleLlmSelect", e);
    setLlm(e.target?.value);
    //localStorage.setItem("creatorllm", e.target.value);
  };

  const changeSystemPrompt = (e: Event) => {
    const target = e.target as HTMLInputElement;
    localStorage.setItem("creatorSystemPrompt", target.value);
    //setSystemPrompt(e.target.value);
  };

  const saveAssistant = async (e: MouseEvent) => {
    console.log("saveAssistant called", e);
    setSaving(true)
    const id = await save()
    setSaving(false)
    if(id){
      setSaveSuccess(true)
    }
  }

  return (
    <div className="w-full p-8 flex flex-col overflow-hidden gap-4">
      <div className="bg-kela-blue-80 -ml-24 -mr-24 px-24 py-6">
          <Heading as="h2" className="pb-4 text-white ">Luo uusi avustaja</Heading>
          <Text className="text-white">Tällä sivulla voit luoda uuden avustajan omaan tai julkiseen käyttöön.</Text>
      </div>
      <Heading as="h2" className="pb-4 text-white">Avustajan asetukset</Heading>
      <Accordion id="chat-settings" isOpen={showSettings}>
        <AccordionToggle className="dark:hover:bg-kela-gray-80 dark:aria-expanded:bg-kela-gray-80" onClick={() => setShowSettings(!showSettings)}>Uuden avustajan asetukset</AccordionToggle>
        <AccordionBody>
        <InputGroup>
          <InputLabel htmlFor="name-assistant">Name of the assistant: </InputLabel>
          <Input className="dark:bg-transparent dark:text-white dark:border-kela-gray-30" id="name-assistant" value={newChatName} onChange={(e) => setAssistantName(e.target.value)}/>
        </InputGroup>
        <InputGroup>
          <InputLabel htmlFor="description-assistant">Description of the assistant: </InputLabel>
          <Textarea id="description-assistant" value={newChatDescription} onChange={(e) => setAssistantDescription(e.target.value)}/>
        </InputGroup>
        <InputGroup>
          <InputLabel htmlFor="prompt-assistant">Prompt of the assistant: </InputLabel>
          <Textarea id="prompt-assistant" value={newChatSystemPrompt} onChange={(e) => setAssistantSystemPrompt(e.target.value)}/>
        </InputGroup>
        <InputGroup>
          <InputLabel htmlFor="public-assistant">Julkinen</InputLabel>
          <Checkbox id="public-assistant" className="dark:*:*:bg-transparent" checked={publc} onChange={() => setPublc(!publc)}></Checkbox>
        </InputGroup>
        <InputGroup>
        <InputLabel>Kielimalli:</InputLabel>
          <Select
            value={llm}
            onChange={handleLlmSelect}
            defaultValue="gpt-35-turbo-16k"
            className="dark:bg-transparent dark:!color-white after:content-[''] after:border-red"
          >
            <option value="gpt-35-turbo-16k">GPT 3.5 Turbo 16k</option>
            <option value="gpt-35-turbo-1106">GPT 3.5 Turbo 1106</option>
            <option value="gpt-4-turbo">GPT 4 Turbo</option>
          </Select>
        </InputGroup>
        <div className="border-2 p-4 mt-2 rounded-lg">
          <label className="primary">Choose a file for the new assistant</label>
          <input type="file" onChange={(e) => uploadFile(e)} />
        </div>
        
        </AccordionBody>
      </Accordion>
      <div className="flex mt-4 gap-8 py-8">
          <Button className="border-2 px-4 py-2" onClick={(e) => saveAssistant(e)}>Tallenna avustaja</Button>
          <Button appearance="outline" variant="danger" className="border-2 px-4 py-2 dark:bg-transparent dark:hover:bg-kela-gray-100">Peruuta</Button>
      </div>
      <div>
          {saveSuccess && <Alert variant="success"><Text>Avustaja tallennettu.</Text></Alert>}
      </div>
      <Heading as="h2" className="pb-4 text-white">Interaktiivinen assistentti avustajan luontiin</Heading>
      <div className="flex flex-col w-full h-full">
        <span className="mt-4">I can help you create an assistant, please start a chat with me if you wish so.</span>
        <ChatWindow
          thread={thread}
          setThread={setThread}
          loading={loading}
          setLoading={setLoading}
          llm={llm}
          systemPrompt={systemPrompt}
          combinePrompt={null}
          useHay={false}
          rag={false}
          functions_for_llm={functions_for_llm}
          setAssistantName={setAssistantName}
          setAssistantSystemPrompt={setAssistantSystemPrompt}
          assistantId={newChatId}
          setAssistantDescription={setAssistantDescription}
        />
      </div>
    </div>
  );
};
export default ChatCreator;