import { FaCirclePlus } from "react-icons/fa6";
import GPT, {GPTProps} from "./Gpt";

const NewGPT = (props: GPTProps) => {
  const {description} = props;
  return (
    <div>
      <GPT icon={<FaCirclePlus size={48} />} name="Uusi" href="chat/new" description={description}/>
    </div>
  );
};
export default NewGPT;
