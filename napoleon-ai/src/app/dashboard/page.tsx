"use client";

import { UserButton } from "@clerk/nextjs";
import { EmailList } from "@/components/dashboard/EmailList";
import { FaCrown } from "react-icons/fa";
import { motion } from "framer-motion";

export default function DashboardPage() {
  return (
    <div className="relative min-h-screen bg-luxury-black overflow-hidden">
      {/* Aurora gradient background */}
      <div className="
        absolute inset-0 
        bg-gradient-to-br from-luxury-indigo/5 via-transparent to-luxury-gold/5
        animate-pulse
      " />
      
      <div className="relative z-10 p-4 sm:p-6 lg:p-8">
      <motion.header
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, ease: "easeOut" }}
        className="flex justify-between items-center p-4 border-b border-glass-primary/20 mb-8"
      >
        <div className="flex items-center text-2xl font-bold text-white">
          <FaCrown className="mr-3 text-luxury-gold drop-shadow-lg" />
          <span className="bg-gradient-to-r from-white to-gray-300 bg-clip-text text-transparent">
            Napoleon AI
          </span>
        </div>
        <UserButton 
          afterSignOutUrl="/"
          appearance={{
            elements: {
              avatarBox: "w-10 h-10 border border-luxury-gold/30 shadow-lg",
              userButtonPopoverCard: "bg-luxury-black/90 backdrop-blur-md border border-gray-700/30 shadow-2xl",
              userButtonPopoverActionButton: "text-white hover:bg-white/5 transition-colors"
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