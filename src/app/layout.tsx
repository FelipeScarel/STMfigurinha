import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { Providers } from "@/components/layout/Providers";
import { Header } from "@/components/layout/Header";
import { Footer } from "@/components/layout/Footer";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: {
    default: "StickerShop — Figurinhas Personalizadas e Colecionáveis",
    template: "%s | StickerShop",
  },
  description:
    "Crie e compre figurinhas personalizadas de alta qualidade. Upload da sua arte, acabamentos exclusivos e frete para todo Brasil.",
  keywords: ["figurinhas", "adesivos", "personalizados", "stickers", "colecionáveis"],
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="pt-BR">
      <body className={`${inter.className} min-h-screen flex flex-col`}>
        <Providers>
          <Header />
          <main className="flex-1">{children}</main>
          <Footer />
        </Providers>
      </body>
    </html>
  );
}
