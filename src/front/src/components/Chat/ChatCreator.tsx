import { ChangeEvent, MouseEvent, PropsWithChildren, useEffect, useState } from "react";
import TopBar from "../Layout/TopBar";
import { v4 } from "uuid";
import ChatWindow from "./ChatWindow";

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
    save()
  }

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
      <div className="flex flex-col w-full items-left px-10 justify-center">
        <div><label>Name of the assistant: </label><input value={newChatName} /></div>
        <div><label>Description of the assistant: </label><input value={newChatDescription} /></div>
        <div><label>Prompt of the assistant: </label><span>{newChatSystemPrompt}</span></div>
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
        <div className="border-2 p-4 mt-2 rounded-lg">
          <label className="primary">Choose a file for the new assistant</label>
          <input type="file" onChange={(e) => uploadFile(e)} />
        </div>
        <div className="flex justify-evenly mt-4">
          <button className="border-2 px-4 py-2" onClick={(e) => saveAssistant(e)}>Save</button>
          <button className="border-2 px-4 py-2">Cancel</button>
        </div>
      </div>
      <hr />
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
'[{"type":"function","function":{"name":"setAssistantName","description":"Set name for a new openai assistant","parameters":{"type":"object","properties":{"name":{"type":"string","description":"Name of the new assistant, e.g. /"MyAssistant/""}},"required":["name"]}}},{"type":"function","function":{"name":"setAssistantSystemPrompt","description":"Set system prompt for a new openai assistant","parameters":{"type":"object","properties":{"prompt":{"type":"string","description":"The complete system prompt for a new assistant"}},"required":["prompt"]}}},{"type":"function","function":{"name":"setAssistantDescription","description":"Set brief description for a new openai assistant","parameters":{"type":"object","properties":{"description":{"type":"string","description":"Brief description of the assistant"}},"required":["description"]}}}]'