import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { ErrorBoundary } from "@/components/error-boundary";
import { ClerkProvider } from '@clerk/nextjs';

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
    <ClerkProvider>
      <html lang="en" className="scroll-smooth">
        <body
          className={`${inter.variable} font-sans bg-black text-white antialiased min-h-screen`}
        >
          <ErrorBoundary>
            {children}
          </ErrorBoundary>
        </body>
      </html>
    </ClerkProvider>
  );
}
