"use client";
import { Menu, MenuContent, MenuFooter, MenuHeader } from "@/components/menu";
import { FindAllChatThreadForCurrentUser } from "@/features/chat/chat-services/chat-thread-service";
import { ThemeToggle } from "@/features/theme/theme-toggle";
import { MenuItems } from "./menu-items";
import { NewChat } from "./new-chat";
import { Button } from "@/components/ui/button";
import { useEffect, useState } from "react";
import { ChatThreadModel } from "../chat-services/models";

export const ChatMenu = () => {
  //const items = await FindAllChatThreadForCurrentUser();
  //const items = FindAllChatThreadForCurrentUser();
  const [items, setItems] = useState<ChatThreadModel[]>([]);
  useEffect(() => {
    const load = async () => {
      const _items = await FindAllChatThreadForCurrentUser();
      setItems(_items);
    };
    load();
  }, []);
  const [showMenu, setShowMenu] = useState(true);

  return (
    <>
      <Button
        variant="link"
        className="md:invisible md:hidden md:h-0 md:w-0 md:p-0"
        onClick={() => setShowMenu(!showMenu)}
      >
        {showMenu ? "Hide chat list" : "Show chat list"}
      </Button>
      <Menu
        className={`${
          showMenu ? "visible" : "invisible h-0 w-0"
        } md:visible md:h-auto md:w-full`}
      >
        <MenuHeader className="justify-end">
          <NewChat />
        </MenuHeader>
        <MenuContent>
          <MenuItems menuItems={items} />
        </MenuContent>
        <MenuFooter className="invisible h-0 md:visible md:h-auto">
          <div className="flex flex-col gap-3">
            <ThemeToggle />
          </div>
        </MenuFooter>
      </Menu>
    </>
  );
};
