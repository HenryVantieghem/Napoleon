import type { Metadata } from "next";
import { Inter, Space_Grotesk } from "next/font/google";
import { ClerkProvider } from "@clerk/nextjs";
import "./globals.css";

const inter = Inter({ subsets: ["latin"], variable: "--font-inter" });
const spaceGrotesk = Space_Grotesk({ subsets: ["latin"], variable: "--font-space-grotesk" });

export const metadata: Metadata = {
  title: "Napoleon AI - Executive Intelligence Platform",
  description: "Transform email chaos into strategic clarity with military-grade AI intelligence. Designed exclusively for Fortune 500 executives.",
  keywords: "executive email, AI intelligence, Gmail analytics, priority scoring, luxury email client",
  authors: [{ name: "Napoleon AI" }],
  openGraph: {
    title: "Napoleon AI - Executive Intelligence Platform",
    description: "Military-grade AI transforms email chaos into executive clarity",
    type: "website",
    images: ["/og-image.png"],
  },
  twitter: {
    card: "summary_large_image",
    title: "Napoleon AI - Executive Intelligence",
    description: "Transform executive communications with AI intelligence",
  },
  viewport: "width=device-width, initial-scale=1",
  themeColor: "#000000",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <ClerkProvider
      appearance={{
        baseTheme: undefined,
        variables: {
          colorPrimary: "#6366f1",
          colorBackground: "#000000",
          colorText: "#ffffff",
          colorInputBackground: "rgba(255, 255, 255, 0.05)",
          colorInputText: "#ffffff",
        },
        elements: {
          formButtonPrimary: "bg-luxury-indigo hover:bg-luxury-indigo/80 text-white",
          socialButtonsBlockButton: "border-glass-primary text-white hover:bg-glass-primary",
          card: "bg-luxury-black border border-glass-primary shadow-glass-xl",
          headerTitle: "text-white",
          headerSubtitle: "text-text-elegant",
          formFieldInput: "bg-glass-primary border-glass-primary text-white",
          footerActionLink: "text-luxury-gold hover:text-luxury-gold/80",
          dividerLine: "bg-glass-primary",
          dividerText: "text-text-subtle",
        },
      }}
    >
      <html lang="en">
        <body className={`${inter.variable} ${spaceGrotesk.variable} font-sans bg-luxury-black text-text-luxury antialiased`}>
          {children}
        </body>
      </html>
    </ClerkProvider>
  );
}