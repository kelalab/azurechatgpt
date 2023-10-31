"use client";
import { useEffect, useState } from "react";
import { ChatMenu } from "./chat/chat-menu/chat-menu";
import { MainMenu } from "./menu/menu";
import Cookies from "universal-cookie";

const ChatLayout = ({ children }: { children: React.ReactNode }) => {
  const cookies = new Cookies(null, { path: "/" });
  const [disclaimerVisible, setDisclaimerVisible] = useState(true);

  useEffect(() => {
    const load = async () => {
      const _show = cookies.get("showDisclaimer");
      console.log("show", _show);
      if (_show !== undefined && disclaimerVisible !== _show)
        setDisclaimerVisible(_show);
    };
    load();
  }, []);

  return (
    <div className="grid grid-cols-1 h-full w-full auto-rows-max md:auto-rows-auto max-h-screen overflow-hidden p-2 gap-2">
      {disclaimerVisible ? (
        <div
          className={`grid-cols-1 grid md:grid-cols-24 auto-rows-max md:auto-rows-fr max-h-[70vh] md:max-h-[86vh] lg:max-h-[88vh] gap-2`}
        >
          <div className="md:flex md:col-span-2 lg:col-span-1">
            <MainMenu />
          </div>
          <div className="md:col-span-7 md:flex border rounded-xl">
            <ChatMenu />
          </div>
          <div className="md:col-span-15 lg:col-span-16 flex flex-1">
            {children}
          </div>
        </div>
      ) : (
        <div
          className={`grid-cols-1 grid md:grid-cols-24 auto-rows-max md:auto-rows-auto max-h-[84vh] md:max-h-[100vh] lg:max-h-[93vh] gap-2`}
        >
          <div className="md:flex md:col-span-2 lg:col-span-1 lg:max-h-[93vh]">
            <MainMenu />
          </div>
          <div className="md:col-span-7 md:flex border rounded-xl lg:max-h-[93vh]">
            <ChatMenu />
          </div>
          <div className="md:col-span-15 lg:col-span-16 flex flex-1 lg:max-h-[93vh]">
            {children}
          </div>
        </div>
      )}
    </div>
  );
};

export default ChatLayout;
