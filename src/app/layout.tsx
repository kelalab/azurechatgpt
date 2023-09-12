import { ThemeProvider } from "@/components/theme-provider";
import { Toaster } from "@/components/ui/toaster";
import { Providers } from "@/features/providers";
import { AI_NAME } from "@/features/theme/customise";
import { cn } from "@/lib/utils";
import { Inter } from "next/font/google";
import "./globals.css";
import Disclaimer from "@/components/disclaimer";

const inter = Inter({ subsets: ["latin"] });

export const metadata = {
  title: AI_NAME,
  description: AI_NAME,
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className="h-full lg:overflow-hidden">
      <body
        className={cn(
          inter.className,
          "flex flex-col w-full h-full bg-page-background"
        )}
      >
        <Providers>
          <ThemeProvider attribute="class" defaultTheme="system" enableSystem>
            <div className="px-2">
              <Disclaimer />
            </div>
            <div
              className={cn(
                inter.className,
                "flex flex-col md:flex-row md:h-full w-full p-2 gap-2 bg-page-background h-[85vh]"
              )}
            >
              {children}
            </div>
            <div className="border text-center py-2 text-2xs md:text-sm h-[15vh] md:h-auto">
              2023 Copyright Kela | a Kelalab product | Not for production use
            </div>
            <Toaster />
          </ThemeProvider>
        </Providers>
      </body>
    </html>
  );
}
