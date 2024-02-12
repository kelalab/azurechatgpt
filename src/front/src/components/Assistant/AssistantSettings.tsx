import { useState } from "react";

const AssistantSettings = (props) => {
  const {llm, handleLlmSelect} = props;
  // we should track if user made changes to settings
  const [changed, setChanged] = useState(false);

    return (<div className="flex flex-col gap-3 p-4 border-2">
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
        className="bg-transparent p-2 border-2"
        rows={6}
        cols={70}
        value={systemPrompt}
        onChange={(e) => changeSystemPrompt(e)}
      ></textarea>
    </div>
    <div className="flex items-center gap-2 justify-between">
      Yhdistely prompt:
      <textarea
        className="bg-transparent p-2 border-2"
        rows={6}
        cols={70}
        value={combinePrompt}
        onChange={(e) => changeCombinePrompt(e)}
      ></textarea>
    </div>
  </div>)
}

export default AssistantSettings;