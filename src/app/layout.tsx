import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "台灣氣象 GIS 視覺化系統 | Taiwan Weather GIS",
  description:
    "整合中央氣象署 (CWA) 全台 800+ 自動氣象站 Open API 即時觀測資料，提供互動式氣溫、降雨量、風速地理資訊疊加與測站分析。",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="zh-TW" className="h-full dark">
      <body className="min-h-full flex flex-col bg-slate-950 text-slate-100 antialiased">
        {children}
      </body>
    </html>
  );
}
