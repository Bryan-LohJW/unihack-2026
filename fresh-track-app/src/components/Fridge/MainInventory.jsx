import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import Shelf from "./Shelf";
import canned_png from "../../assets/static/canned.png";
import fresh_png from "../../assets/static/fresh.jpg"; // Re-add if used later
import InventoryGrid from "../Modals/InventoryGrid";
import { getInventoryOverview, getAllInventory } from "../../api/inventory";

const MainInventory = () => {
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
          { id: 1, title: "Pantry", total: pantryStats.total, expiry: pantryStats.expiry, display_img: canned_png },
          { id: 2, title: "Fridge", total: fridgeStats.total, expiry: fridgeStats.expiry, display_img: canned_png },
          { id: 3, title: "Freezer", total: freezerStats.total, expiry: freezerStats.expiry, display_img: canned_png },
        ]);
      } catch (error) {
        console.error("Failed to fetch inventory overview:", error);
        // Fallback to dummy data if API fails
        setInventoryData([
          { id: 1, title: "Pantry", total: 45, expiry: 2, display_img: canned_png },
          { id: 2, title: "Fridge", total: 18, expiry: 5, display_img: canned_png },
          { id: 3, title: "Freezer", total: 32, expiry: 0, display_img: canned_png },
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
      const itemsData = await getAllInventory({ section: category.title.toLowerCase() });

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
        <div className="relative w-full max-w-sm mt-4 px-4 flex flex-col items-center">
          {/* FRIDGE BODY */}
          <div className="relative w-full h-[620px] rounded-[3.5rem] bg-white border-2 border-slate-50 shadow-2xl flex flex-col justify-around py-16" onClick={() => !isOpen && setIsOpen(true)}>
            {/* Shelves */}
            {inventoryData.map((category, idx) => (
              <Shelf key={category.id} {...category} index={idx} isOpen={isOpen} onShelfClick={() => handleShelfClick(category)} />
            ))}

            {/* THE DOOR */}
            <motion.div
              animate={{
                rotateY: isOpen ? -115 : 0,
                opacity: isOpen ? 0.05 : 1,
              }}
              transition={{ duration: 1.1, ease: [0.22, 1, 0.36, 1] }}
              style={{ transformOrigin: "left center", perspective: "2000px" }}
              className="absolute inset-0 z-50 bg-gradient-to-br from-white to-slate-100 rounded-[3.5rem] shadow-xl border-l border-white flex flex-col items-end justify-center px-8 cursor-pointer pointer-events-none"
            >
              {!isOpen && (
                <motion.div animate={{ y: [0, -10, 0] }} transition={{ duration: 1.5, repeat: Infinity, ease: "easeInOut" }} className="absolute inset-0 flex flex-col items-center justify-center text-slate-400">
                  <span className="text-xl font-bold tracking-wide mb-2">Tap to Open</span>
                  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2.5} stroke="currentColor" className="w-8 h-8">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M19 12H5m0 0l7 7m-7-7 7-7" />
                  </svg>
                </motion.div>
              )}
              <div className="w-1.5 h-24 bg-slate-200/60 rounded-full mr-2 shadow-inner" />
            </motion.div>
          </div>

          {/* CLOSE BUTTON */}
          <div className="mt-8">
            <AnimatePresence>
              {isOpen && (
                <motion.button initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.9 }} onClick={() => setIsOpen(false)} className="px-12 py-3 bg-slate-900 text-white rounded-full font-bold shadow-xl active:scale-95 transition-transform">
                </motion.button>
              )}
            </AnimatePresence>
          </div>
        </div>

        {/* Render the Modal */}
        <InventoryGrid isOpen={selectedShelf !== null} onClose={() => setSelectedShelf(null)} categoryTitle={selectedShelf?.title} items={selectedShelf?.items || []} isLoading={isFetchingItems} />
      </main>
    </div>
  );
};

export default MainInventory;
