"use client";
import { Menu, MenuContent, MenuFooter, MenuHeader } from "@/components/menu";
import { FindAllChatThreadForCurrentUser } from "@/features/chat/chat-services/chat-thread-service";
import { ThemeToggle } from "@/features/theme/theme-toggle";
import { MenuItems } from "./menu-items";
import { NewChat } from "./new-chat";
import { Button } from "@/components/ui/button";
import { useEffect, useState } from "react";
import { ChatThreadModel } from "../chat-services/models";
import Cookies from "universal-cookie";

export const ChatMenu = () => {
  //const items = await FindAllChatThreadForCurrentUser();
  //const items = FindAllChatThreadForCurrentUser();
  const [items, setItems] = useState<ChatThreadModel[]>([]);
  const [showMenu, setShowMenu] = useState(true);
  const cookies = new Cookies(null, { path: "/" });

  useEffect(() => {
    const load = async () => {
      const _showMenu = cookies.get("showChatList");
      const _items = await FindAllChatThreadForCurrentUser();
      console.log("items", _items);
      if (_items.length !== items.length) setItems(_items);
    };
    load();
  }),
    [];

  const toggleShowChatList = () => {
    cookies.set("showChatList", !showMenu);
    setShowMenu(!showMenu);
  };

  return (
    <div className="h-full w-full relative">
      <div className="flex justify-between md:flex-row-reverse">
        <Button
          variant="link"
          className="md:invisible md:hidden md:h-0 md:w-0 md:p-0"
          onClick={() => toggleShowChatList()}
        >
          {showMenu ? "Hide chat list" : "Show chat list"}
        </Button>
        <NewChat />
      </div>
      <Menu
        className={`${
          showMenu ? "visible" : "invisible h-0 w-0"
        } md:visible md:h-auto md:w-full`}
      >
        <MenuHeader className="justify-end">{/* <NewChat /> */}</MenuHeader>
        <MenuContent>
          <MenuItems menuItems={items} />
        </MenuContent>
        <MenuFooter className="invisible h-0 md:visible md:h-auto absolute bottom-0 w-full">
          <div className="flex flex-col gap-3">
            <ThemeToggle />
          </div>
        </MenuFooter>
      </Menu>
    </div>
  );
};
