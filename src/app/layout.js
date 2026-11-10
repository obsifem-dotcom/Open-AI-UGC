import "./globals.css";
import { Providers } from "./providers";
import Navbar from "../components/Navbar";
import { Inter } from "next/font/google";
import config from "@/lib/config";

const inter = Inter({ subsets: ["latin"], display: "swap" });

export const metadata = {
  title: "UGCora Studio — AI UGC Video Creator",
  description:
    "Create creator-style UGC video ads with AI actors, scripts, and voiceovers in UGCora Studio. Turn product ideas into social-ready videos.",
  keywords: [
    "AI UGC",
    "UGC ads",
    "AI actors",
    "AI video ads",
    "Arcads alternative",
    "MakeUGC alternative",
    "AI video generator",
    "text to video",
    "image to video",
  ],
};

export default function RootLayout({ children }) {
  const theme = config?.theme || "slate-indigo";

  return (
    <html lang="en" className="h-full w-full" data-theme={theme}>
      <body className={`${inter.className} h-full w-full flex flex-col antialiased bg-bg-page text-primary-text overflow-hidden`}>
        <Providers>
          <Navbar />
          <div className="flex-1 flex flex-col overflow-y-auto min-h-0">
            {children}
          </div>
        </Providers>
      </body>
    </html>
  );
}
