import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import Shelf from "./Shelf";
import canned_png from "../../assets/static/canned.png";
import fresh_png from "../../assets/static/fresh.jpg"; // Re-add if used later
import InventoryGrid from "../Modals/InventoryGrid";
import { getInventoryOverview, getAllInventory } from "../../api/inventory";

const MainInventory = ({ onShowToast, onKarmaChange }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [inventoryData, setInventoryData] = useState([]);
  const [selectedShelf, setSelectedShelf] = useState(null);
  const [isFetchingItems, setIsFetchingItems] = useState(false);

  // 1. Fetch ONLY the overview counts on component mount
  useEffect(() => {
    const fetchOverview = async () => {
      try {
        const overviewData = await getInventoryOverview();

        // THE FIX: overviewData is already the array!
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
          {
            id: 1,
            title: "Pantry",
            total: pantryStats.total,
            expiry: pantryStats.expiry,
            display_img: canned_png,
            bg_img: "/pantry_bg.png",
          },
          {
            id: 2,
            title: "Fridge",
            total: fridgeStats.total,
            expiry: fridgeStats.expiry,
            display_img: canned_png,
            bg_img: "/fridge_bg.png",
          },
          {
            id: 3,
            title: "Freezer",
            total: freezerStats.total,
            expiry: freezerStats.expiry,
            display_img: canned_png,
            bg_img: "/freezer_bg.png",
          },
        ]);
      } catch (error) {
        console.error("Failed to fetch inventory overview:", error);
        // Fallback to dummy data if API fails
        setInventoryData([
          {
            id: 1,
            title: "Pantry",
            total: 45,
            expiry: 2,
            display_img: canned_png,
            bg_img: "/pantry_bg.png",
          },
          {
            id: 2,
            title: "Fridge",
            total: 18,
            expiry: 5,
            display_img: canned_png,
            bg_img: "/fridge_bg.png",
          },
          {
            id: 3,
            title: "Freezer",
            total: 32,
            expiry: 0,
            display_img: canned_png,
            bg_img: "/freezer_bg.png",
          },
        ]);
      }
    };

    fetchOverview();
  }, []);

  // 2. Fetch specific shelf items ONLY when a shelf is clicked
  const handleShelfClick = async (category) => {
    if (!isOpen) return;

    setIsFetchingItems(true);
    try {
      // Fetch items for the specific section clicked
      const itemsData = await getAllInventory({
        section: category.title.toLowerCase(),
      });

      // Open the modal with the specific category data + fetched items
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
        <div className="relative w-full max-w-lg mt-4 px-4 flex flex-col items-center">
          {/* Dialog box — above fridge, centered, no overlap, tail points down to fridge */}
          <div
            className="absolute top-0 left-1/2 z-30 max-w-[180px] px-4 py-3 bg-white text-sm text-slate-800 font-medium leading-snug"
            style={{
              borderRadius: "50% 40% 50% 40% / 55% 45% 55% 45%",
              boxShadow: "3px 3px 0 0 rgba(30,41,59,0.2), 5px 5px 14px rgba(0,0,0,0.1)",
              border: "1px solid rgba(30,41,59,0.25)",
              transform: "translate(-50%, calc(-100% - 0.75rem)) rotate(-12deg)",
            }}
          >
            Hi, I am <span className="font-bold text-[var(--color-brown)]">Freddy</span> your digital fridge.
            <div className="absolute -bottom-2 left-1/2 -translate-x-1/2 w-2.5 h-2.5 bg-white border-l border-b border-slate-300 rotate-[-135deg]" aria-hidden />
          </div>

          {/* FRIDGE WRAPPER — image sets height, content overlaid inside */}
          <div className="relative w-full cursor-pointer overflow-hidden" onClick={() => !isOpen && setIsOpen(true)}>
            {/* Interior Container (Shelves + Light + Door) */}
            <div
              className="absolute flex flex-col gap-2"
              style={{
                left: "8%",
                right: "10%",
                top: "7%",
                bottom: "8%",
                zIndex: 5,
                overflow: "hidden", // This clips everything inside, including the door animation!
              }}
            >
              {/* 1. Shelves */}
              {inventoryData.map((category, idx) => (
                <Shelf key={category.id} {...category} index={idx} isOpen={isOpen} onShelfClick={() => handleShelfClick(category)} />
              ))}

              {/* 2. Light effect when open */}
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

              {/* 3. Closed state (THE FIX) */}
              <AnimatePresence>
                {!isOpen && (
                  <motion.div
                    initial={{ x: "-100%" }}
                    animate={{ x: 0 }}
                    exit={{ x: "-100%" }}
                    transition={{ duration: 0.5, ease: "easeInOut" }}
                    className="absolute inset-0 flex flex-col items-center justify-center" // Changed to inset-0
                    style={{
                      zIndex: 15, // Keeps it above the shelves
                      background: "rgba(15,23,42,0.55)",
                      borderRadius: "6px",
                    }}
                  >
                    <motion.div animate={{ y: [0, -16, 0] }} transition={{ duration: 1.5, repeat: Infinity, ease: "easeInOut" }} className="flex flex-col items-center text-slate-200">
                      <span className="text-base font-bold tracking-wide mb-2">Tap to Open</span>
                      <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2.5} stroke="currentColor" className="w-7 h-7">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M19 12H5m0 0l7 7m-7-7 7-7" />
                      </svg>
                    </motion.div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            {/* Fridge frame image */}
            <img src="/fridge_no_door.png" alt="fridge" className="relative w-full pointer-events-none select-none" style={{ zIndex: 20, display: "block" }} />
          </div>

          {/* CLOSE BUTTON */}
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

        {/* Render the Modal */}
        <InventoryGrid
          isOpen={selectedShelf !== null}
          onClose={() => setSelectedShelf(null)}
          categoryTitle={selectedShelf?.title}
          items={selectedShelf?.items || []}
          isLoading={isFetchingItems}
          onShowToast={onShowToast}
          onKarmaChange={onKarmaChange}
        />
      </main>
    </div>
  );
};

export default MainInventory;
