import ChatRoot from "../components/Chat";
import {useParams} from 'react-router-dom';
import Layout from "../components/Layout";
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
    <Layout>
      <ChatRoot title={title} id={chatid} />
    </Layout>
  );
};
export default Chat;
