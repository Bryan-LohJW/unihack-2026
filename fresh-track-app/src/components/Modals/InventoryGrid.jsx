import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import InventoryItem from "../Fridge/InventoryItem"; // Adjust path as needed
import DetailedInventoryModal from "./DetailedInventoryModal"; // Adjust path as needed

const sortByHealth = (items) =>
  [...items].sort((a, b) => {
    const getExpiry = (item) => item.expiry_date ? new Date(item.expiry_date).getTime() : Infinity;
    return getExpiry(a) - getExpiry(b);
  });

const InventoryGrid = ({ isOpen, onClose, categoryTitle, items = [] }) => {
  // 1. State to track the specific item clicked for the detailed view
  const [selectedItem, setSelectedItem] = useState(null);
  const sortedItems = sortByHealth(items);

  // Helper to close the main grid ONLY if the detail modal isn't open
  const handleGridClose = () => {
    if (!selectedItem) {
      onClose();
    }
  };

  return (
    <>
      <AnimatePresence>
        {isOpen && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-sm" onClick={handleGridClose}>
            <motion.div initial={{ scale: 0.9, opacity: 0, y: 20 }} animate={{ scale: 1, opacity: 1, y: 0 }} exit={{ scale: 0.9, opacity: 0, y: 20 }} onClick={(e) => e.stopPropagation()} className="w-full max-w-md max-h-[85vh] flex flex-col bg-white/95 backdrop-blur-md p-6 rounded-[2rem] shadow-2xl border border-white overflow-hidden">
              {/* Modal Header */}
              <div className="shrink-0 flex justify-between items-center mb-6 px-2">
                <h2 className="text-lg font-black text-slate-700 tracking-widest uppercase">{categoryTitle}</h2>
                <button onClick={onClose} className="w-8 h-8 flex items-center justify-center bg-slate-100 text-slate-500 rounded-full hover:bg-slate-200 hover:text-slate-700 transition-colors">
                  ✕
                </button>
              </div>

              {/* Scrollable Container */}
              <div className="flex-1 overflow-y-auto pr-2 pb-4 -mr-2">
                {/* 3x3 Grid Layout */}
                <div className="grid grid-cols-3 gap-3">
                  {sortedItems.length > 0 ? (
                    sortedItems.map((item, index) => (
                      <InventoryItem
                        key={item.id || index}
                        item={item}
                        // 2. We pass the function down to the item!
                        onClick={(clickedItem) => setSelectedItem(clickedItem)}
                      />
                    ))
                  ) : (
                    <div className="col-span-3 text-center py-8 text-slate-400 text-sm font-medium">This shelf is empty.</div>
                  )}
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* 3. Render the Detailed Modal on top */}
      <DetailedInventoryModal
        isOpen={selectedItem !== null}
        onClose={() => setSelectedItem(null)}
        item={selectedItem}
        onSave={(updatedItem) => {
          console.log("Saving item:", updatedItem);
          // Here you would eventually update your main state/database
          setSelectedItem(null); // Close the detail modal after saving
        }}
      />
    </>
  );
};

export default InventoryGrid;
