import "./globals.css";
import { Providers } from "./providers";
import Navbar from "../components/Navbar";
import { Inter } from "next/font/google";
import config from "@/lib/config";

const inter = Inter({ subsets: ["latin"], display: "swap" });

export const metadata = {
  title: "UGCore Studio — Estudio AI UGC & Actores Virtuales",
  description:
    "Crea anuncios UGC, reels con actores IA y contenido de alto impacto para redes sociales y e-commerce en UGCore Studio.",
  keywords: [
    "AI UGC",
    "UGC ads",
    "AI actors",
    "AI video ads",
    "UGCore Studio",
    "AI video generator",
    "text to video",
    "image to video",
  ],
};

export default function RootLayout({ children }) {
  const theme = config?.theme || "slate-indigo";

  return (
    <html lang="es" className="h-full w-full" data-theme={theme}>
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
