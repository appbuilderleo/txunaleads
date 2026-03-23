import type { Metadata } from "next";
import { Inter, Outfit } from "next/font/google";
import "./globals.css";

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
});

const outfit = Outfit({
  variable: "--font-outfit",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "TxunaLeads | Inteligência de Prospecção MZ",
  description: "A plataforma líder em prospecção de leads B2B em Moçambique.",
  icons: {
    icon: "/favicon.svg",
  }
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="pt"
      className={`${inter.variable} ${outfit.variable} h-full antialiased`}
    >
      <body className="font-sans antialiased min-h-screen bg-[#F8FAFC]">
        {children}
      </body>
    </html>
  );
}
