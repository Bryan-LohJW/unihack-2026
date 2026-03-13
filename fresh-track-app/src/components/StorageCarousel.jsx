import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ChevronLeft, ChevronRight } from "lucide-react";

const OPTIONS = [
  { id: "fridge", label: "Fridge", icon: "❄️" },
  { id: "freezer", label: "Freezer", icon: "🧊" },
  { id: "pantry", label: "Pantry", icon: "📦" },
  { id: "status", label: "My Status", icon: "📊" },
];

export const StorageCarousel = ({ onChange }) => {
  const [index, setIndex] = useState(0);
  const [direction, setDirection] = useState(1);

  const next = () => {
    setDirection(1);
    const newIdx = (index + 1) % OPTIONS.length;
    setIndex(newIdx);
    onChange?.(OPTIONS[newIdx].id);
  };

  const prev = () => {
    setDirection(-1);
    const newIdx = (index - 1 + OPTIONS.length) % OPTIONS.length;
    setIndex(newIdx);
    onChange?.(OPTIONS[newIdx].id);
  };

  const MotionDiv = motion.div;

  return (
    <div className="relative w-full h-32 flex items-center justify-center overflow-hidden py-4">
      {/* Navigation Arrows */}
      <button
        onClick={next}
        className="absolute left-4 z-20 p-2 rounded-full bg-white/5 backdrop-blur-md border border-white/10 text-white w-auto min-w-[40px] max-w-[40px] active:scale-90 transition-all"
      >
        <ChevronLeft size={24} />
      </button>

      <div className="flex items-center justify-center gap-8 w-full max-w-[300px]">
        <AnimatePresence mode="popLayout">
          {/* We render a slice of the array to show the "Center" item clearly */}
          <MotionDiv
            key={index}
            initial={{ opacity: 0, x: 50 * direction, scale: 0.8 }}
            animate={{ opacity: 1, x: 0, scale: 1.1 }}
            exit={{ opacity: 0, x: -50 * direction, scale: 0.8 }}
            transition={{ type: "spring", stiffness: 300, damping: 30 }}
            className="flex flex-col items-center justify-center"
          >
            {/* <div className="w-20 h-20 rounded-3xl bg-gradient-to-br from-purple-500/20 to-indigo-500/20 border border-purple-500/30 flex items-center justify-center text-4xl shadow-2xl shadow-purple-500/10 mb-2">{OPTIONS[index].icon}</div> */}
            <span className="text-white font-bold text-sm tracking-widest uppercase">{OPTIONS[index].label}</span>
          </MotionDiv>
        </AnimatePresence>
      </div>

      <button
        onClick={prev}
        className="absolute right-4 z-20 p-2 rounded-full bg-white/5 backdrop-blur-md border border-white/10 text-white w-auto min-w-[40px] max-w-[40px] active:scale-90 transition-all"
      >
        <ChevronRight size={24} />
      </button>

      {/* Subtle background glow for the active item */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-32 h-32 bg-purple-500/20 blur-[60px] pointer-events-none rounded-full" />
    </div>
  );
};


export default StorageCarousel;