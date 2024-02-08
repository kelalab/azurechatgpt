import GPT, {GPTProps} from "./Gpt";

const NewGPT = (props: GPTProps) => {
  const {description} = props;
  return (
    <div>
      <GPT image="/new_ai.jfif" name="Uusi" href="chat/new" description={description}/>
    </div>
  );
};
export default NewGPT;
