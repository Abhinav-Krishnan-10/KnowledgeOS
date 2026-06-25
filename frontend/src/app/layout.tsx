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
  title: "KnowledgeOS | AI-Powered Personal Knowledge Workspace",
  description: "Transform your documents into an intelligent knowledge repository. Chat, search, analyze, and generate professional materials grounded in your data.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={`${inter.variable} ${outfit.variable} h-full antialiased dark`}
      style={{ colorScheme: "dark" }}
    >
      <body className="min-h-full bg-mesh text-foreground font-sans antialiased overflow-x-hidden selection:bg-purple-500/30 selection:text-purple-200">
        {children}
      </body>
    </html>
  );
}
