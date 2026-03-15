import React, { useState, useEffect, useRef } from "react";
import { createPortal } from "react-dom";
import { motion, AnimatePresence } from "framer-motion";
import { getKitchenKarma } from "../../api/kitchen_karma";

const Navbar = ({ onLogoClick, karmaAnimationTrigger = 0, karmaDelta = 0 }) => {
  const [karmaScore, setKarmaScore] = useState(null);
  const [flyInTarget, setFlyInTarget] = useState(null);
  const [flyInDelta, setFlyInDelta] = useState(0);
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
      setFlyInDelta(karmaDelta);
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
  }, [karmaAnimationTrigger, karmaDelta]);

  const handleFlyInComplete = () => {
    setFlyInTarget(null);
    setTriggerZoom((z) => z + 1);
  };

  const centerX = typeof window !== "undefined" ? window.innerWidth / 2 : 0;
  const bottomY = typeof window !== "undefined" ? window.innerHeight + 60 : 0;

  return (
    <nav className="fixed top-0 inset-x-0 z-[100] flex justify-between items-center pl-2 pr-4 h-20 bg-white/80 backdrop-blur-md border-b border-[var(--color-brown)]/10 shadow-md shadow-black/5">
      {/* 1. Branding Left (Clickable) */}
      <div onClick={onLogoClick} className="flex items-center cursor-pointer group">
        <h2 className="text-xl leading-none tracking-tight group-hover:opacity-80 transition-opacity">
          <span className="font-medium text-[var(--color-text-secondary)]">Digital </span>
          <span className="font-black text-[var(--color-primary)]">Fridge</span>
        </h2>
      </div>

      {/* 2. Actions End (Karma) - Added -translate-y-[2px] here! */}
      <div ref={karmaRef} className="flex justify-end items-center -translate-y-[2px]">
        <div className="flex items-center gap-0.5 px-3 py-1.5 text-[var(--color-brown)] bg-[var(--color-blue)]/10 rounded-full pointer-events-none">
          <img src="/icons/kitchen_karma.png" alt="Kitchen Karma" className="w-6 h-6 object-contain" />
          <motion.span key={`${karmaScore ?? "init"}-${triggerZoom}`} initial={{ scale: triggerZoom > 0 ? 1.4 : 1 }} animate={{ scale: 1 }} transition={{ type: "spring", stiffness: 400, damping: 15 }} className="font-bold text-sm leading-none inline-block flex-shrink-0 pt-[2px]">
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
                y: bottomY,
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
              className="fixed z-[200] w-[72px] h-9 flex items-center justify-center gap-0.5 px-3 py-1.5 rounded-full bg-[var(--color-blue)]/20 shadow-xl pointer-events-none border border-[var(--color-brown)]/10"
              style={{ left: 0, top: 0 }}
            >
              <img src="/icons/kitchen_karma.png" alt="" className="w-6 h-6 object-contain" />
              <span className="font-bold text-sm leading-none pt-[2px] text-[var(--color-brown)]">{flyInDelta !== 0 ? (flyInDelta > 0 ? `+${flyInDelta}` : flyInDelta) : (karmaScore ?? "—")}</span>
            </motion.div>
          )}
        </AnimatePresence>,
        document.body,
      )}
    </nav>
  );
};

export default Navbar;
