import ChatRoot from "../components/Chat";
import {useParams} from 'react-router-dom';
import { PropsWithChildren } from "react";

interface ChatProps extends PropsWithChildren{
  title?: string;
  prompt?: string;
  id?: string;
  rag?: boolean;
}

const Chat = (props: ChatProps) => {
  const { title } = props;
  const { chatid } = useParams();
  console.log("chatprops", props, useParams());
  return (
    <ChatRoot title={title} id={chatid} />
  );
};
export default Chat;
