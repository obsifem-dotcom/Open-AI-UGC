import "./globals.css";
import { Providers } from "./providers";
import Navbar from "../components/Navbar";
import { Inter } from "next/font/google";
import config from "@/lib/config";

const inter = Inter({ subsets: ["latin"], display: "swap" });

export const viewport = {
  themeColor: "#8B5CF6",
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
  viewportFit: "cover",
};

export const metadata = {
  title: "UGCore Studio — Estudio AI UGC & Actores Virtuales",
  description:
    "Crea anuncios UGC, reels con actores IA y contenido de alto impacto para redes sociales y e-commerce en UGCore Studio.",
  manifest: "/manifest.json",
  appleWebApp: {
    capable: true,
    statusBarStyle: "black-translucent",
    title: "UGCore Studio",
  },
  icons: {
    icon: "/icons/icon-192x192.png",
    shortcut: "/icons/icon-192x192.png",
    apple: "/icons/apple-touch-icon.png",
  },
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
