"use client";

import { motion } from "framer-motion";

const shimmerVariants = {
  initial: { backgroundPosition: "-1000px 0" },
  animate: {
    backgroundPosition: "1000px 0",
    transition: {
      duration: 2,
      repeat: Infinity,
      ease: "linear" as const,
    },
  },
};

const Shimmer = () => (
  <motion.div
    variants={shimmerVariants}
    initial="initial"
    animate="animate"
    className="absolute inset-0"
    style={{
      background: `linear-gradient(to right, transparent 0%, rgba(255, 255, 255, 0.08) 50%, transparent 100%)`,
    }}
  />
);

const SkeletonRow = () => (
  <div className="relative h-20 w-full rounded-lg overflow-hidden bg-glass-primary p-4 flex items-center space-x-4">
    <div className="h-10 w-10 rounded-full bg-white/10 shrink-0"></div>
    <div className="flex-grow space-y-2">
      <div className="h-4 w-1/4 rounded bg-white/10"></div>
      <div className="h-4 w-3/4 rounded bg-white/10"></div>
    </div>
    <div className="h-8 w-20 rounded-md bg-white/10 shrink-0"></div>
    <Shimmer />
  </div>
);

export const LoadingSkeleton = () => {
  return (
    <div className="space-y-4">
      {Array.from({ length: 5 }).map((_, i) => <SkeletonRow key={i} />)}
    </div>
  );
};