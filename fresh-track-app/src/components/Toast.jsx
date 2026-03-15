import React, { useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";

const TOAST_DURATION_MS = 5000;

export default function Toast({ message, onDismiss }) {
  useEffect(() => {
    if (!message) return;
    const id = setTimeout(() => onDismiss(), TOAST_DURATION_MS);
    return () => clearTimeout(id);
  }, [message, onDismiss]);

  return (
    <AnimatePresence>
      {message && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: 20 }}
          className="fixed bottom-24 left-2 right-2 z-[500] mx-auto max-w-md rounded-xl bg-[#187A4F] px-4 py-3 text-center text-sm font-medium text-white shadow-lg"
        >
          {message}
        </motion.div>
      )}
    </AnimatePresence>
  );
}
