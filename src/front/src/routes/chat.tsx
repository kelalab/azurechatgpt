import ChatRoot from "../components/Chat";

const Chat = (props) => {
  const { title } = props;
  console.log("chatprops", props);
  return (
    <>
      <ChatRoot title={title} />
    </>
  );
};
export default Chat;
