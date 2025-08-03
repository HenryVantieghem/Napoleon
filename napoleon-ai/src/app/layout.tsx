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
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link 
          href="https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700&display=swap" 
          rel="stylesheet" 
        />
      </head>
      <body
        className={`${inter.variable} font-body bg-primary-background text-warm-ivory antialiased min-h-screen`}
      >
        {children}
      </body>
    </html>
  );
}
