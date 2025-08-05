"use client";

import { UserButton } from "@clerk/nextjs";
import { EmailList } from "@/components/email";
import { FaCrown } from "react-icons/fa";
import { motion } from "framer-motion";

export default function DashboardPage() {
  return (
    <div className="relative min-h-screen bg-imperial-dark overflow-hidden">
      {/* Imperial Aurora gradient background */}
      <div className="
        absolute inset-0 
        bg-gradient-to-br from-orbital-blue/5 via-transparent to-imperial-gold/5
        animate-pulse
      " />
      
      <div className="relative z-10 p-4 sm:p-6 lg:p-8">
      <motion.header
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, ease: "easeOut" }}
        className="flex justify-between items-center p-4 border-b border-glass-border/20 mb-8"
      >
        <div className="flex items-center text-2xl font-bold text-executive-white">
          <FaCrown className="mr-3 text-imperial-gold drop-shadow-lg" />
          <span className="bg-gradient-to-r from-executive-white to-text-secondary bg-clip-text text-transparent">
            Napoleon AI
          </span>
        </div>
        <UserButton 
          afterSignOutUrl="/"
          appearance={{
            elements: {
              avatarBox: "w-10 h-10 border border-imperial-gold/30 shadow-lg",
              userButtonPopoverCard: "bg-imperial-dark/90 backdrop-blur-md border border-glass-border/30 shadow-2xl",
              userButtonPopoverActionButton: "text-executive-white hover:bg-glass-1 transition-colors"
            }
          }}
        />
      </motion.header>

      <motion.main
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.5, delay: 0.2, ease: "easeOut" }}
      >
        <EmailList maxEmails={20} />
      </motion.main>
      </div>
    </div>
  );
}