import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import Shelf from "./Shelf";
import canned_png from "../../assets/static/canned.png";
// import fresh_png from "../../assets/static/fresh.jpg"; // (Unused in snippet, but kept if you need it)
import InventoryGrid from "../Modals/InventoryGrid";
import { getInventoryOverview, getAllInventory } from "../../api/inventory";

// 🧲 EDIT YOUR MAGNETS HERE
// You can change the 'src' to any other image link later.
const FRIDGE_MAGNETS = [
  { id: 1, src: "/fridge_logo.png", top: "15%", left: "20%", rotate: "-8deg", width: "70px" },
  { id: 2, src: "icons/apple.png", top: "15%", left: "75%", rotate: "12deg", width: "70px" },
  { id: 3, src: "icons/banana.png", top: "15%", left: "50%", rotate: "-4deg", width: "70px" },
];

const MainInventory = ({ onShowToast, onKarmaChange }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [inventoryData, setInventoryData] = useState([]);
  const [allInventoryItems, setAllInventoryItems] = useState([]);
  const [selectedShelf, setSelectedShelf] = useState(null);
  const [isFetchingItems, setIsFetchingItems] = useState(false);

  const fetchOverview = async () => {
    try {
      const overviewData = await getInventoryOverview();
      const fetchedSections = Array.isArray(overviewData) ? overviewData : [];

      const getCounts = (targetSection) => {
        return fetchedSections
          .filter((s) => {
            const secName = Array.isArray(s.section) ? s.section[0] : s.section;
            return secName?.toLowerCase() === targetSection.toLowerCase();
          })
          .reduce(
            (acc, curr) => ({
              total: acc.total + (curr.total_count || 0),
              expiry: acc.expiry + (curr.soon_to_expire_count || 0),
            }),
            { total: 0, expiry: 0 },
          );
      };

      const pantryStats = getCounts("pantry");
      const fridgeStats = getCounts("fridge");
      const freezerStats = getCounts("freezer");

      setInventoryData([
        { id: 1, title: "Pantry", total: pantryStats.total, expiry: pantryStats.expiry, display_img: canned_png, bg_img: "/pantry_bg.png" },
        { id: 2, title: "Fridge", total: fridgeStats.total, expiry: fridgeStats.expiry, display_img: canned_png, bg_img: "/fridge_bg.png" },
        { id: 3, title: "Freezer", total: freezerStats.total, expiry: freezerStats.expiry, display_img: canned_png, bg_img: "/freezer_bg.png" },
      ]);
    } catch (error) {
      console.error("Failed to fetch inventory overview:", error);
      setInventoryData([
        { id: 1, title: "Pantry", total: 45, expiry: 2, display_img: canned_png, bg_img: "/pantry_bg.png" },
        { id: 2, title: "Fridge", total: 18, expiry: 5, display_img: canned_png, bg_img: "/fridge_bg.png" },
        { id: 3, title: "Freezer", total: 32, expiry: 0, display_img: canned_png, bg_img: "/freezer_bg.png" },
      ]);
    }
  };

  useEffect(() => {
    fetchOverview();
  }, []);

  const handleShelfClick = async (category) => {
    if (!isOpen) return;
    setIsFetchingItems(true);
    try {
      const itemsData = await getAllInventory({ section: category.title.toLowerCase() });
      setSelectedShelf({ ...category, items: itemsData || [] });
    } catch (error) {
      console.error(`Failed to fetch items for ${category.title}:`, error);
      setSelectedShelf({ ...category, items: [] });
    } finally {
      setIsFetchingItems(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#F4F7F9] flex flex-col font-sans overflow-hidden">
      <main className="flex-1 pt-20 flex flex-col items-center">
        <div className="relative w-full max-w-lg mt-12 px-4 flex flex-col items-center">
          {/* Freddy Dialog Box */}
          <motion.div
            className="absolute left-1/2 z-50 max-w-[180px] px-4 py-3 bg-white text-sm text-slate-800 font-medium leading-snug"
            initial={{ x: "-55%", y: "-135%", rotate: -12 }}
            animate={{ y: ["-135%", "-145%", "-135%"] }}
            transition={{ duration: 1.5, repeat: Infinity, ease: "easeInOut" }}
            style={{
              borderRadius: "50% 40% 50% 40% / 55% 45% 55% 45%",
              boxShadow: "3px 3px 0 0 rgba(30,41,59,0.2), 5px 5px 14px rgba(0,0,0,0.1)",
              border: "1px solid rgba(30,41,59,0.25)",
            }}
          >
            Hi, I am <span className="font-bold text-[var(--color-primary)]">Freddy</span> your digital fridge.
            {/* The Tail */}
            <div
              className="absolute w-0 h-0"
              style={{
                bottom: "-11px",
                left: "60%",
                transform: "translateX(-50%)",
                borderLeft: "9px solid transparent",
                borderRight: "9px solid transparent",
                borderTop: "12px solid white",
                filter: "drop-shadow(0px 1px 0px rgba(30,41,59,0.25)) drop-shadow(3px 3px 0px rgba(30,41,59,0.2))",
                zIndex: 10,
              }}
              aria-hidden
            />
            {/* White Patch to hide border line */}
            <div
              className="absolute bg-white"
              style={{
                bottom: "-0.5px",
                left: "60%",
                transform: "translateX(-50%)",
                width: "14px",
                height: "3px",
                zIndex: 9,
              }}
            />
          </motion.div>

          {/* Fridge Image and Interaction Wrapper */}
          <div className="relative w-full cursor-pointer overflow-hidden" onClick={() => !isOpen && setIsOpen(true)}>
            <div
              className="absolute flex flex-col gap-2"
              style={{
                left: "8%",
                right: "10%",
                top: "7%",
                bottom: "8%",
                zIndex: 5,
                overflow: "hidden",
              }}
            >
              {inventoryData.map((category, idx) => (
                <Shelf key={category.id} {...category} index={idx} isOpen={isOpen} onShelfClick={() => handleShelfClick(category)} />
              ))}

              {/* Inside Fridge Lighting Effect */}
              <AnimatePresence>
                {isOpen && (
                  <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={{ duration: 0.3 }} className="absolute inset-0 pointer-events-none overflow-hidden" style={{ zIndex: 40 }}>
                    <motion.div
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      transition={{ duration: 1, delay: 0.3, ease: "easeOut" }}
                      className="absolute inset-0"
                      style={{
                        background: `linear-gradient(to bottom, rgba(255,248,220,0.35) 0%, rgba(255,245,200,0.1) 30%, transparent 60%)`,
                      }}
                    />
                  </motion.div>
                )}
              </AnimatePresence>

              {/* Fridge Door (Overlay) */}
              <AnimatePresence>
                {!isOpen && (
                  <motion.div
                    // 🌟 UPDATED: Now fades (opacity) along with sliding (x)
                    initial={{ x: "100%", opacity: 0 }}
                    animate={{ x: 0, opacity: 1 }}
                    exit={{ x: "100%", opacity: 0 }}
                    // 🌟 UPDATED: Changed from easeInOut to a spring transition for the bounce effect
                    transition={{
                      type: "spring",
                      stiffness: 260, // How sudden the snap is
                      damping: 15,    // Lower damping = more bouncing back and forth
                    }}
                    className="absolute inset-0 flex flex-col items-center justify-center overflow-hidden"
                    style={{
                      zIndex: 15,
                      borderRadius: "6px",
                      backgroundImage: "url('/fridge_logo.png')",
                      // 🌟 INCREASE THIS TO ZOOM PAST THE INVISIBLE BORDERS!
                      // Try 250%, 300%, or 350% until the fridge touches the edges.
                      backgroundSize: "223% 134%",
                      translateX: "3%",
                      backgroundPosition: "center",
                      backgroundRepeat: "no-repeat",
                      imageRendering: "pixelated",
                      backgroundColor: "transparent",
                    }}
                  >
                    {/* Render Fridge Magnets */}
                    {/* {FRIDGE_MAGNETS.map((magnet) => (
                      <img
                        key={magnet.id}
                        src={magnet.src}
                        alt={`magnet-${magnet.id}`}
                        // UPDATED: Kept drop-shadow for some lift, but removed white border/bg
                        className="absolute drop-shadow-md pointer-events-none h-auto"
                        style={{
                          top: magnet.top,
                          left: magnet.left,
                          width: magnet.width,
                          transform: `rotate(${magnet.rotate})`,
                        }}
                      />
                    ))} */}

                    {/* <motion.div
                      animate={{ y: [0, -16, 0] }}
                      transition={{ duration: 1.5, repeat: Infinity, ease: "easeInOut" }}
                      // 🌟 Changed bg-black to bg-black/70
                      className="z-10 flex flex-col items-center text-black bg-white/50 px-6 py-3 rounded-2xl shadow-lg backdrop-blur-[4px]"
                    >
                      <span className="text-base font-bold tracking-wide mb-2">Tap to Open</span>
                      <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2.5} stroke="currentColor" className="w-7 h-7">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M19 12H5m0 0l7 7m-7-7 7-7" />
                      </svg>
                    </motion.div> */}
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            <img src="/fridge_no_door.png" alt="fridge" className="relative w-full pointer-events-none select-none" style={{ zIndex: 20, display: "block" }} />
          </div>

          {/* Close Button */}
          <div className="mt-4">
            <AnimatePresence>
              {isOpen && (
                <motion.button initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.9 }} onClick={() => setIsOpen(false)} className="px-12 py-3 bg-slate-900 text-white rounded-full font-bold shadow-xl active:scale-95 transition-transform">
                  Close
                </motion.button>
              )}
            </AnimatePresence>
          </div>
        </div>

        <InventoryGrid isOpen={selectedShelf !== null} onClose={() => setSelectedShelf(null)} categoryTitle={selectedShelf?.title} items={selectedShelf?.items || []} isLoading={isFetchingItems} onShowToast={onShowToast} onKarmaChange={onKarmaChange} onInventoryChange={() => fetchOverview()} />
      </main>
    </div>
  );
};

export default MainInventory;