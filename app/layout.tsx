import "./globals.css";
import type { Metadata, Viewport } from "next";
import { BottomNav } from "@/components/BottomNav";

export const metadata: Metadata = {
  title: "lst",
  description: "Meu App de Tudo",
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  themeColor: "#E9E9E9",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="pt-BR">
      <body className="min-h-screen">
        <div className="mx-auto max-w-[460px] min-h-screen px-4 py-6 pb-28">
          {children}
        </div>
        <BottomNav />
      </body>
    </html>
  );
}
