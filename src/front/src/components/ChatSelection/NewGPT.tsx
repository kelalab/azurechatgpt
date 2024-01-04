import { FaCirclePlus } from "react-icons/fa6";
import GPT from "./Gpt";

const NewGPT = () => {
  return (
    <div>
      <GPT icon={<FaCirclePlus size={48} />} name="Uusi" href="chat/new" />
    </div>
  );
};
export default NewGPT;
