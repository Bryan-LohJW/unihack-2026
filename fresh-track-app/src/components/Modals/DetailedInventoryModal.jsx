import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";

const DetailedInventoryModal = ({ isOpen, onClose, item, onSave, onDelete }) => {
  const [activeItem, setActiveItem] = useState(item);
  const [qty, setQty] = useState(1);
  const [expiryDate, setExpiryDate] = useState("");
  const [health, setHealth] = useState(50);
  const [section, setSection] = useState("pantry");
  const [showConfirm, setShowConfirm] = useState(false);

  useEffect(() => {
    if (item) {
      setActiveItem(item);
      setQty(item.qty !== undefined ? item.qty : 1);
      setSection(item.section || "pantry");

      // 1. Format the ISO expiry_date to YYYY-MM-DD for the HTML date input
      let formattedExpiryDate = "";
      let calculatedHealth = 50;

      if (item.expiry_date) {
        const expDate = new Date(item.expiry_date);
        formattedExpiryDate = expDate.toISOString().split("T")[0];

        // 2. Dynamically calculate freshness percentage based on added_at and expiry_date
        const now = new Date();
        if (item.added_at) {
          const addedDate = new Date(item.added_at);
          const totalLifespan = expDate.getTime() - addedDate.getTime();
          const timeRemaining = expDate.getTime() - now.getTime();

          if (totalLifespan > 0) {
            calculatedHealth = Math.max(0, Math.min(100, Math.round((timeRemaining / totalLifespan) * 100)));
          } else {
            calculatedHealth = timeRemaining > 0 ? 100 : 0;
          }
        }
      }

      setExpiryDate(formattedExpiryDate);
      setHealth(calculatedHealth);
      setShowConfirm(false);
    }
  }, [item]);

  const currentItem = item || activeItem;

  const handleSaveClick = () => {
    if (qty === 0) {
      setShowConfirm(true);
    } else {
      // Pass back the updated fields, ensuring expiryDate is converted back if needed by your API
      onSave({ ...currentItem, qty, expiry_date: new Date(expiryDate).toISOString(), section });
    }
  };

  if (!currentItem) return null;

  // Calculate if it's expiring soon (<= 3 days) based on the currently selected expiryDate
  const daysRemaining = Math.ceil((new Date(expiryDate) - new Date()) / (1000 * 60 * 60 * 24));
  const isExpiringSoon = daysRemaining <= 3;

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 z-[110] flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm" onClick={onClose}>
          <motion.div layoutId={`card-${currentItem._id}`} transition={{ type: "spring", bounce: 0.2, duration: 0.6 }} onClick={(e) => e.stopPropagation()} className="w-full max-w-sm bg-white p-6 rounded-[2.5rem] shadow-2xl border border-slate-100 flex flex-col overflow-hidden relative">
            <AnimatePresence mode="wait">
              {showConfirm ? (
                /* Delete Confirmation View */
                <motion.div key="confirm-view" initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.9 }} className="flex flex-col items-center text-center py-4">
                  <div className="w-16 h-16 bg-rose-100 text-rose-500 rounded-full flex items-center justify-center mb-4 text-3xl shadow-inner">🗑️</div>
                  <h3 className="text-xl font-black text-slate-700 mb-2">Delete {currentItem.name}?</h3>
                  <p className="text-sm text-slate-500 mb-8 px-2">Are you sure you want to remove this item? This action cannot be undone.</p>

                  <div className="flex w-full gap-3">
                    <button onClick={() => setShowConfirm(false)} className="flex-1 py-3 bg-slate-100 hover:bg-slate-200 text-slate-600 font-bold rounded-2xl transition-colors">
                      Cancel
                    </button>
                    <button
                      onClick={() => {
                        onDelete(currentItem);
                        onClose();
                      }}
                      className="flex-1 py-3 bg-rose-500 hover:bg-rose-600 text-white font-bold rounded-2xl shadow-md transition-colors active:scale-95"
                    >
                      Yes, Delete
                    </button>
                  </div>
                </motion.div>
              ) : (
                /* Edit Form View */
                <motion.div key="edit-view" className="flex flex-col">
                  {/* Header */}
                  <div className="flex flex-col items-center mb-6 relative">
                    <button onClick={onClose} className="absolute right-0 top-0 w-8 h-8 flex items-center justify-center bg-slate-50 text-slate-400 rounded-full hover:bg-slate-100 transition z-10">
                      ✕
                    </button>
                    <div className="w-60 h-60 mb-3 p-4 bg-slate-50 rounded-3xl flex items-center justify-center">
                      <motion.img layoutId={`image-${currentItem._id}`} src={`/icons/${currentItem.image_url}`} alt={currentItem.name} className="max-w-full max-h-full object-contain drop-shadow-md" />
                    </div>
                    <h2 className="text-xl font-black text-slate-800">{currentItem.name}</h2>
                    <span className={`mt-2 text-[10px] uppercase tracking-wider font-black px-3 py-1 rounded-full ${isExpiringSoon ? "bg-orange-100 text-orange-600" : "bg-emerald-100 text-emerald-600"}`}>
                      {isExpiringSoon ? (daysRemaining < 0 ? "Expired" : "Expiring Soon") : "Fresh Stock"}
                    </span>
                  </div>

                  {/* Added: Nutrition Quick View */}
                  {currentItem.nutrition && (
                    <div className="flex justify-between items-center px-4 py-3 mb-4 bg-slate-50 rounded-2xl border border-slate-100 text-center">
                      <div className="flex flex-col"><span className="text-[10px] font-bold text-slate-400 uppercase">Cal</span><span className="text-sm font-black text-slate-700">{currentItem.calories}</span></div>
                      <div className="flex flex-col"><span className="text-[10px] font-bold text-slate-400 uppercase">Carbs</span><span className="text-sm font-black text-slate-700">{currentItem.nutrition.carbs}g</span></div>
                      <div className="flex flex-col"><span className="text-[10px] font-bold text-slate-400 uppercase">Fat</span><span className="text-sm font-black text-slate-700">{currentItem.nutrition.fat}g</span></div>
                      <div className="flex flex-col"><span className="text-[10px] font-bold text-slate-400 uppercase">Prot</span><span className="text-sm font-black text-slate-700">{currentItem.nutrition.protein}g</span></div>
                    </div>
                  )}

                  <div className="space-y-3">
                    {/* UI-Matched Storage Dropdown */}
                    <div className="flex flex-col p-3 bg-slate-50 rounded-2xl border border-slate-100 relative group">
                      <label className="text-[11px] font-bold text-slate-400 uppercase ml-1 mb-1 text-left">Storage Location</label>
                      <div className="relative">
                        <select value={section} onChange={(e) => setSection(e.target.value)} className="w-full bg-transparent text-slate-700 font-bold focus:outline-none cursor-pointer appearance-none pr-8 relative z-10">
                          <option value="pantry">Pantry</option>
                          <option value="fridge">Fridge</option>
                          <option value="freezer">Freezer</option>
                        </select>
                        <div className="absolute right-0 top-1/2 -translate-y-1/2 pointer-events-none text-slate-400">
                          <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M19 9l-7 7-7-7" />
                          </svg>
                        </div>
                      </div>
                    </div>

                    {/* Non-Editable Health Bar */}
                    <div className="flex flex-col p-3 bg-slate-50 rounded-2xl border border-slate-100">
                      <div className="flex justify-between items-center mb-2">
                        <label className="text-[11px] font-bold text-slate-400 uppercase ml-1">Freshness Remaining</label>
                        <span className="text-xs font-black text-slate-600">{health}%</span>
                      </div>
                      <div className="h-2 w-full bg-slate-200 rounded-full overflow-hidden">
                        <div className="h-full bg-gradient-to-r from-rose-400 via-amber-400 to-emerald-400 transition-all duration-700" style={{ width: `${health}%` }} />
                      </div>
                    </div>

                    {/* Quantity Adjuster */}
                    <div className="flex items-center justify-between p-3 bg-slate-50 rounded-2xl border border-slate-100">
                      <span className="text-[11px] font-bold text-slate-400 uppercase ml-1">Quantity</span>
                      <div className="flex items-center gap-4">
                        <button onClick={() => setQty(Math.max(0, qty - 1))} className="w-8 h-8 rounded-xl bg-white shadow-sm text-slate-600 font-bold hover:bg-slate-100 active:scale-90 transition-all flex items-center justify-center">
                          —
                        </button>
                        <span className="text-lg font-black text-slate-700 min-w-[3rem] text-center">{qty} {currentItem.unit || "g"}</span>
                        <button onClick={() => setQty(qty + 1)} className="w-8 h-8 rounded-xl bg-white shadow-sm text-slate-600 font-bold hover:bg-slate-100 active:scale-90 transition-all flex items-center justify-center">
                          +
                        </button>
                      </div>
                    </div>

                    {/* Calendar Input */}
                    <div className="flex flex-col p-3 bg-slate-50 rounded-2xl border border-slate-100">
                      <label className="text-[11px] font-bold text-slate-400 uppercase ml-1 mb-1">Expiry Date</label>
                      <input type="date" value={expiryDate} onChange={(e) => setExpiryDate(e.target.value)} className="w-full bg-transparent text-slate-700 font-bold focus:outline-none cursor-pointer" />
                    </div>
                  </div>

                  {/* Action Buttons: Side-by-Side */}
                  <div className="flex gap-3 mt-6">
                    <button onClick={() => setShowConfirm(true)} className="flex items-center justify-center w-14 h-14 bg-rose-50 hover:bg-rose-100 text-rose-500 rounded-2xl transition-all active:scale-90" aria-label="Delete">
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                      </svg>
                    </button>

                    <button onClick={handleSaveClick} className="flex-1 h-14 bg-slate-900 hover:bg-slate-800 text-white font-black rounded-2xl shadow-lg transition-all active:scale-[0.98] uppercase tracking-wide text-sm">
                      Save Changes
                    </button>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default DetailedInventoryModal;