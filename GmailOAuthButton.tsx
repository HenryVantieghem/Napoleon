"use client";

import { SignInButton } from "@clerk/nextjs";
import { FaCrown } from "react-icons/fa";

export function GmailOAuthButton() {
  return (
    <SignInButton mode="modal" forceRedirectUrl="/dashboard">
      <button className="group relative inline-flex items-center justify-center px-8 py-4 text-lg font-bold text-white transition-all duration-300 bg-luxury-indigo rounded-md focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-luxury-gold focus:ring-offset-luxury-black hover:bg-indigo-500">
        <span className="absolute w-0 h-0 transition-all duration-300 ease-out bg-white rounded-full group-hover:w-32 group-hover:h-32 opacity-10"></span>
        <span className="relative flex items-center">
          <FaCrown className="mr-3 text-luxury-gold" />
          Begin Executive Experience
        </span>
      </button>
    </SignInButton>
  );
}