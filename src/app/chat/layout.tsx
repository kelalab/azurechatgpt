import { ProtectedPage } from "@/features/auth/protected-page";
import ChatLayout from "@/features/chat-layout";
import { ChatMenu } from "@/features/chat/chat-menu/chat-menu";
import { MainMenu } from "@/features/menu/menu";
import { AI_NAME } from "@/features/theme/customise";
import { useEffect, useState } from "react";
import Cookies from "universal-cookie";

export const metadata = {
  title: AI_NAME,
  description: AI_NAME,
};

export default async function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <ProtectedPage>
      <div className="grid grid-cols-1 h-full w-full auto-rows-max max-h-screen overflow-hidden">
        <ChatLayout>{children}</ChatLayout>
        {/* <div className="grid-cols-1 grid md:grid-cols-24 auto-rows-max md:auto-rows-fr max-h-[88vh] md:max-h-[86vh] lg:max-h-[88vh] gap-2">
          <div className="md:flex md:col-span-2 lg:col-span-1">
            <MainMenu />
          </div>
          <div className="md:col-span-7 md:flex border rounded-xl">
            <ChatMenu />
          </div>
          <div className="md:col-span-15 lg:col-span-16 flex flex-1">
            {children}
          </div>
        </div> */}
      </div>
    </ProtectedPage>
  );
}
