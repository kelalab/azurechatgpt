import Disclaimer from "@/components/disclaimer";
import { ProtectedPage } from "@/features/auth/protected-page";
import { ChatMenu } from "@/features/chat/chat-menu/chat-menu";
import { MainMenu } from "@/features/menu/menu";
import { AI_NAME } from "@/features/theme/customise";

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
      <div className="grid grid-cols-1 h-full w-full auto-rows-min max-h-screen overflow-hidden">
        <Disclaimer />
        <div className="grid-cols-1 grid md:grid-cols-24 auto-rows-min md:auto-rows-fr max-h-[88vh] md:max-h-[86vh] lg:max-h-[88vh] gap-2">
          <div className="md:flex">
            <MainMenu />
          </div>
          <div className="md:col-span-16 flex flex-1">{children}</div>
        </div>
      </div>
    </ProtectedPage>
  );
}
