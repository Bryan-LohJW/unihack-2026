import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import InventoryItem from "../Fridge/InventoryItem";
import DetailedInventoryModal from "./DetailedInventoryModal";
import { updateInventoryItem, deleteInventoryItem } from "../../api/inventory";

const sortByHealth = (items) =>
  [...items].sort((a, b) => {
    const getExpiry = (item) => item.expiry_date ? new Date(item.expiry_date).getTime() : Infinity;
    return getExpiry(a) - getExpiry(b);
  });

const InventoryGrid = ({ isOpen, onClose, categoryTitle, items = [], onShowToast, onKarmaChange }) => {
  const [localItems, setLocalItems] = useState(items);
  const [selectedItem, setSelectedItem] = useState(null);

  // Sync localItems when the parent passes new items (e.g. different shelf opened)
  useEffect(() => {
    setLocalItems(items);
  }, [items]);

  const sortedItems = sortByHealth(localItems);

  const handleGridClose = () => {
    if (!selectedItem) {
      onClose();
    }
  };

  const handleSave = async (updatedItem) => {
    try {
      const saved = await updateInventoryItem(updatedItem._id, {
        qty: updatedItem.qty,
        expiry_date: updatedItem.expiry_date,
        section: updatedItem.section,
      });
      const { karma_delta: _kd, ...item } = saved;
      setLocalItems((prev) =>
        prev.map((i) => (i._id === saved._id ? item : i))
      );
      const delta = saved?.karma_delta;
      if (delta != null) {
        onKarmaChange?.(delta);
      }
      const karmaMsg = delta != null && delta > 0 ? ` Kitchen karma: +${delta}.` : "";
      onShowToast?.(`Item updated.${karmaMsg}`);
    } catch (err) {
      console.error("Failed to save item:", err);
    } finally {
      setSelectedItem(null);
    }
  };

  const handleDelete = async (itemToDelete) => {
    try {
      const res = await deleteInventoryItem(itemToDelete._id);
      setLocalItems((prev) => prev.filter((i) => i._id !== itemToDelete._id));
      const delta = res?.karma_delta;
      if (delta != null) {
        onKarmaChange?.(delta);
      }
      const karmaMsg = delta != null ? ` Kitchen karma: ${delta >= 0 ? "+" : ""}${delta}.` : "";
      onShowToast?.(`Item removed from inventory.${karmaMsg}`);
    } catch (err) {
      console.error("Failed to delete item:", err);
    } finally {
      setSelectedItem(null);
    }
  };

  return (
    <>
      <AnimatePresence>
        {isOpen && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 z-100 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-sm" onClick={handleGridClose}>
            <motion.div initial={{ scale: 0.9, opacity: 0, y: 20 }} animate={{ scale: 1, opacity: 1, y: 0 }} exit={{ scale: 0.9, opacity: 0, y: 20 }} onClick={(e) => e.stopPropagation()} className="w-full max-w-md max-h-[85vh] flex flex-col bg-white/95 backdrop-blur-md p-6 rounded-4xl shadow-2xl border border-white overflow-hidden">
              {/* Modal Header */}
              <div className="shrink-0 flex justify-between items-center mb-6 px-2">
                <h2 className="text-lg font-black text-slate-700 tracking-widest uppercase">{categoryTitle}</h2>
                <button onClick={onClose} className="w-8 h-8 flex items-center justify-center bg-slate-100 text-slate-500 rounded-full hover:bg-slate-200 hover:text-slate-700 transition-colors">
                  ✕
                </button>
              </div>

              {/* Scrollable Container */}
              <div className="flex-1 overflow-y-auto pr-2 pb-4 -mr-2">
                <div className="grid grid-cols-3 gap-3">
                  {sortedItems.length > 0 ? (
                    sortedItems.map((item, index) => (
                      <InventoryItem
                        key={item._id || index}
                        item={item}
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

      <DetailedInventoryModal
        isOpen={selectedItem !== null}
        onClose={() => setSelectedItem(null)}
        item={selectedItem}
        onSave={handleSave}
        onDelete={handleDelete}
      />
    </>
  );
};

export default InventoryGrid;
