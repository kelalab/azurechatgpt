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
      <div className="flex flex-col">
        <Disclaimer />
        <div className="flex flex-col md:flex-row">
          <MainMenu />
          <ChatMenu />
          <div className="flex-1">{children}</div>
        </div>
      </div>
    </ProtectedPage>
  );
}
