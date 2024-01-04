import ChatCreator from "../components/Chat/ChatCreator";
import Chat from "./chat";

const NewChat = () => {
  return (
    <div className="flex">
      <ChatCreator />
      <Chat title="uusi" />
    </div>
  );
};
export default NewChat;
