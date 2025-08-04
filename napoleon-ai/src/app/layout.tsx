import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
});

export const metadata: Metadata = {
  title: "Napoleon AI - Luxury Smart Inbox",
  description: "Transform communication chaos into strategic clarity with AI-powered Gmail management.",
  keywords: ["AI", "Gmail", "Email Management", "Productivity", "Smart Inbox"],
  authors: [{ name: "Napoleon AI" }],
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="scroll-smooth">
      <body
        className={`${inter.variable} font-body bg-primary-background text-warm-ivory antialiased min-h-screen`}
      >
        {children}
      </body>
    </html>
  );
}
