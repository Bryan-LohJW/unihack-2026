import React, { useState, useEffect, useRef } from "react";
import { createPortal } from "react-dom";
import { motion, AnimatePresence } from "framer-motion";
import { getKitchenKarma } from "../../api/kitchen_karma";

const Navbar = ({ onLogoClick, karmaAnimationTrigger = 0 }) => {
  const [karmaScore, setKarmaScore] = useState(null);
  const [flyInTarget, setFlyInTarget] = useState(null);
  const [triggerZoom, setTriggerZoom] = useState(0);
  const karmaRef = useRef(null);

  const fetchKarma = async () => {
    try {
      const data = await getKitchenKarma();
      return data?.score ?? 0;
    } catch {
      return 0;
    }
  };

  useEffect(() => {
    let cancelled = false;
    const load = async () => {
      const score = await fetchKarma();
      if (!cancelled) setKarmaScore(score);
    };
    queueMicrotask(() => load());
    return () => {
      cancelled = true;
    };
  }, []);

  useEffect(() => {
    if (karmaAnimationTrigger <= 0) return;
    let cancelled = false;
    const runFlyIn = async () => {
      const score = await fetchKarma();
      if (cancelled) return;
      setKarmaScore(score);
      requestAnimationFrame(() => {
        requestAnimationFrame(() => {
          if (cancelled) return;
          const rect = karmaRef.current?.getBoundingClientRect();
          if (!rect) {
            setTriggerZoom((z) => z + 1);
            return;
          }
          setFlyInTarget({
            x: rect.left + rect.width / 2,
            y: rect.top + rect.height / 2,
          });
        });
      });
    };
    queueMicrotask(() => runFlyIn());
    return () => {
      cancelled = true;
    };
  }, [karmaAnimationTrigger]);

  const handleFlyInComplete = () => {
    setFlyInTarget(null);
    setTriggerZoom((z) => z + 1);
  };

  const centerX = typeof window !== "undefined" ? window.innerWidth / 2 : 0;
  const centerY = typeof window !== "undefined" ? window.innerHeight / 2 : 0;

  return (
    <nav className="fixed top-0 inset-x-0 z-[100] grid grid-cols-3 items-center px-6 h-20 bg-white/80 backdrop-blur-md border-b border-[var(--color-brown)]/10 shadow-md shadow-black/5">
      {/* 1. Logo Section */}
      <div
        onClick={onLogoClick}
        className="flex justify-start items-center group cursor-pointer"
      >
        <div className="relative">
          <img src="/fridge_logo.png" alt="FreshTrack" className="h-12 w-auto object-contain" />
        </div>
      </div>

      {/* 2. Branding Center */}
      <div className="flex items-center justify-center pointer-events-none">
        <h2 className="text-xl leading-none tracking-tight">
          <span className="font-medium text-[var(--color-text-secondary)]">Digital </span><span className="font-black text-[var(--color-primary)]">Fridge</span>
        </h2>
      </div>

      {/* 3. Actions End */}
      <div ref={karmaRef} className="flex justify-end items-center gap-2">
        <div className="flex items-center gap-2 px-3 py-1.5 text-[var(--color-brown)] bg-[var(--color-blue)]/10 rounded-full pointer-events-none">
          <img
            src="/icons/kitchen_karma.png"
            alt="Kitchen Karma"
            className="w-6 h-6 object-contain"
          />
          <motion.span
            key={`${karmaScore ?? "init"}-${triggerZoom}`}
            initial={{ scale: triggerZoom > 0 ? 1.4 : 1 }}
            animate={{ scale: 1 }}
            transition={{ type: "spring", stiffness: 400, damping: 15 }}
            className="font-bold text-sm inline-block"
          >
            {karmaScore ?? "—"}
          </motion.span>
        </div>
      </div>

      {/* Fly-in overlay */}
      {createPortal(
        <AnimatePresence>
          {flyInTarget && (
            <motion.div
              initial={{
                x: centerX - 36,
                y: centerY - 18,
                scale: 1.2,
                opacity: 1,
              }}
              animate={{
                x: flyInTarget.x - 36,
                y: flyInTarget.y - 18,
                scale: 1,
                opacity: 1,
              }}
              exit={{ opacity: 0, scale: 0 }}
              transition={{
                type: "spring",
                stiffness: 300,
                damping: 25,
              }}
              onAnimationComplete={handleFlyInComplete}
              className="fixed z-[200] w-[72px] h-9 flex items-center justify-center gap-2 px-3 py-1.5 rounded-full bg-[var(--color-blue)]/20 shadow-xl pointer-events-none border border-[var(--color-brown)]/10"
              style={{ left: 0, top: 0 }}
            >
              <img
                src="/icons/kitchen_karma.png"
                alt=""
                className="w-6 h-6 object-contain"
              />
              <span className="font-bold text-sm text-[var(--color-brown)]">
                {karmaScore ?? "—"}
              </span>
            </motion.div>
          )}
        </AnimatePresence>,
        document.body,
      )}
    </nav>
  );
};

export default Navbar;
