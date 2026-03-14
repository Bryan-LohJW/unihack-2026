import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import Shelf from "./Shelf";
import canned_png from "../../assets/static/canned.png";
import fresh_png from "../../assets/static/fresh.jpg";
import InventoryGrid from "../Modals/InventoryGrid";
import dummy_data from "../../../public/dummyData/dummy_data.json";

const MainInventory = () => {
  const [isOpen, setIsOpen] = useState(false);

  const inventoryData = [
    {
      id: 1,
      title: "Pantry",
      total: 45,
      expiry: 2,
      display_img: canned_png,
      items: [],
    },
    {
      id: 2,
      title: "Fridge",
      total: 18,
      expiry: 5,
      items: [],
      display_img: canned_png,
    },
    {
      id: 3,
      title: "Freezer",
      total: 32,
      expiry: 0,
      display_img: canned_png,
      items: [],
    },
  ];

  dummy_data.forEach((item) => {
    switch (item.section) {
      case "fridge":
        inventoryData[1].items.push(item);
        break;
      case "pantry":
        inventoryData[0].items.push(item);
        break;
      case "freezer":
        inventoryData[2].items.push(item);
        break;
      default:
        break;
    }
  });

  const [selectedShelf, setSelectedShelf] = useState(null);

  return (
    <div className="min-h-screen bg-[#F4F7F9] flex flex-col font-sans overflow-hidden">
      <main className="flex-1 pt-20 flex flex-col items-center">
        <div className="relative w-full max-w-sm mt-4 px-4 flex flex-col items-center">
          {/* FRIDGE BODY */}
          <div
            className="relative w-full h-[620px] rounded-[3.5rem] bg-white border-2 border-slate-50 shadow-2xl flex flex-col justify-around py-16"
            // Removed overflow-hidden to prevent the 3D shelf from being clipped
            onClick={() => !isOpen && setIsOpen(true)}
          >
            {/* Shelves */}
            {inventoryData.map((category, idx) => (
              <Shelf
                key={category.id}
                {...category} // Spreads title, total, expiry, items
                index={idx}
                isOpen={isOpen}
                foodItems={category.items}
                display_img={category.display_img}
                onShelfClick={(e) => {
                  if (isOpen) {
                    // Only allow opening the modal if the fridge door is already open
                    setSelectedShelf(category);
                  }
                }}
              />
            ))}

            {/* THE DOOR */}
            <motion.div
              animate={{
                rotateY: isOpen ? -115 : 0,
                opacity: isOpen ? 0.05 : 1, // Even lighter so stats are crystal clear
              }}
              transition={{ duration: 1.1, ease: [0.22, 1, 0.36, 1] }}
              style={{ transformOrigin: "left center", perspective: "2000px" }}
              className="absolute inset-0 z-50 bg-gradient-to-br from-white to-slate-100 rounded-[3.5rem] shadow-xl border-l border-white flex flex-col items-end justify-center px-8 cursor-pointer pointer-events-none"
            >
              <div className="w-1.5 h-24 bg-slate-200/60 rounded-full mr-2 shadow-inner" />
            </motion.div>
          </div>

          {/* CLOSE BUTTON */}
          <div className="mt-8">
            <AnimatePresence>{isOpen && <motion.button initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.9 }} onClick={() => setIsOpen(false)} className="px-12 py-3 bg-slate-900 text-white rounded-full font-bold shadow-xl active:scale-95 transition-transform"></motion.button>}</AnimatePresence>
          </div>
        </div>
        {/* 2. Render the Modal */}
        {/* We pass the selected shelf's data into the modal */}
        <InventoryGrid isOpen={selectedShelf !== null} onClose={() => setSelectedShelf(null)} categoryTitle={selectedShelf?.title} items={selectedShelf?.items || []} />
      </main>
    </div>
  );
};

export default MainInventory;
