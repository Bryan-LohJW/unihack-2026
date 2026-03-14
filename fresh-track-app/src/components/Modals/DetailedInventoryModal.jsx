import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";

// Added onDelete prop
const DetailedInventoryModal = ({ isOpen, onClose, item, onSave, onDelete }) => {
  const [qty, setQty] = useState(1);
  const [expiryDate, setExpiryDate] = useState("");
  const [health, setHealth] = useState(50);

  // New state to toggle the confirmation view
  const [showConfirm, setShowConfirm] = useState(false);

  // Populate form and reset confirmation state when a new item opens
  useEffect(() => {
    if (item) {
      setQty(item.qty !== undefined ? item.qty : 1);
      setExpiryDate(item.expiryDate || "");
      setHealth(item.health !== undefined ? item.health : 50);
      setShowConfirm(false); // Always start on the edit form
    }
  }, [item]);

  const isExpiringSoon = item?.expiry_days <= 3;
  const healthPercentage = health;

  // Smart Save: Intercept saves if qty is 0
  const handleSaveClick = () => {
    if (qty === 0) {
      setShowConfirm(true); // Trigger delete confirmation instead
    } else {
      onSave({ ...item, qty, expiryDate, health });
    }
  };

  if (!item) return null;

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 z-[110] flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm" onClick={onClose}>
          <motion.div initial={{ scale: 0.95, opacity: 0, y: 10 }} animate={{ scale: 1, opacity: 1, y: 0 }} exit={{ scale: 0.95, opacity: 0, y: 10 }} onClick={(e) => e.stopPropagation()} className="w-full max-w-sm bg-white p-6 rounded-[2rem] shadow-2xl border border-slate-100 flex flex-col overflow-hidden relative">
            <AnimatePresence mode="wait">
              {/* --- VIEW 1: DELETE CONFIRMATION --- */}
              {showConfirm ? (
                <motion.div key="confirm-view" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} className="flex flex-col items-center text-center py-4">
                  <div className="w-16 h-16 bg-rose-100 text-rose-500 rounded-full flex items-center justify-center mb-4 text-3xl shadow-inner">🗑️</div>
                  <h3 className="text-xl font-black text-slate-700 mb-2">Delete {item.name}?</h3>
                  <p className="text-sm text-slate-500 mb-8 px-2">{qty === 0 ? "You set the quantity to 0. Do you want to remove this item from your inventory?" : "Are you sure you want to permanently remove this item? This cannot be undone."}</p>

                  <div className="flex w-full gap-3">
                    <button onClick={() => setShowConfirm(false)} className="flex-1 py-3 bg-slate-100 hover:bg-slate-200 text-slate-600 font-bold rounded-xl transition-colors">
                      Cancel
                    </button>
                    <button
                      onClick={() => {
                        onDelete(item);
                        onClose(); // Close modal after deleting
                      }}
                      className="flex-1 py-3 bg-rose-500 hover:bg-rose-600 text-white font-bold rounded-xl shadow-md transition-colors active:scale-[0.98]"
                    >
                      Yes, Delete
                    </button>
                  </div>
                </motion.div>
              ) : (
                /* --- VIEW 2: EDIT FORM (Original UI) --- */
                <motion.div key="edit-view" initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: 20 }} className="flex flex-col">
                  {/* Header & Image */}
                  <div className="flex flex-col items-center mb-6 relative">
                    <button onClick={onClose} className="absolute right-0 top-0 w-8 h-8 flex items-center justify-center bg-slate-50 text-slate-400 rounded-full hover:bg-slate-100 hover:text-slate-600 transition">
                      ✕
                    </button>
                    <div className="w-60 h-60 mb-3 p-4 bg-slate-50 rounded-2xl flex items-center justify-center">
                      <img src={`/icons/${item.image_url}`} alt={item.name} className="max-w-full max-h-full object-contain drop-shadow-md" />
                    </div>
                    <h2 className="text-xl font-black text-slate-700">{item.name}</h2>

                    <span className={`mt-2 text-xs font-bold px-3 py-1 rounded-full ${isExpiringSoon ? "bg-orange-100 text-orange-600" : "bg-emerald-100 text-emerald-600"}`}>{isExpiringSoon ? "Consume Soon" : "Fresh"}</span>
                  </div>

                  {/* Nutrition Section */}
                  {item.nutrition && (
                    <div className="grid grid-cols-4 gap-2 mb-6">
                      <div className="flex flex-col items-center p-2 bg-slate-50 rounded-xl">
                        <span className="text-[10px] font-bold text-slate-400 uppercase">Kcal</span>
                        <span className="text-sm font-black text-slate-700">{item.calories}</span>
                      </div>
                      <div className="flex flex-col items-center p-2 bg-emerald-50 rounded-xl">
                        <span className="text-[10px] font-bold text-emerald-500 uppercase">Pro</span>
                        <span className="text-sm font-black text-emerald-700">{item.nutrition.protein}g</span>
                      </div>
                      <div className="flex flex-col items-center p-2 bg-amber-50 rounded-xl">
                        <span className="text-[10px] font-bold text-amber-500 uppercase">Carb</span>
                        <span className="text-sm font-black text-amber-700">{item.nutrition.carbs}g</span>
                      </div>
                      <div className="flex flex-col items-center p-2 bg-rose-50 rounded-xl">
                        <span className="text-[10px] font-bold text-rose-400 uppercase">Fat</span>
                        <span className="text-sm font-black text-rose-600">{item.nutrition.fat}g</span>
                      </div>
                    </div>
                  )}

                  {/* Form Fields */}
                  <div className="space-y-4 mb-6">
                    {/* Health Bar Slider */}
                    <div className="flex flex-col p-3 bg-slate-50 rounded-xl border border-slate-100">
                      <div className="flex justify-between items-center mb-3">
                        <label className="text-sm font-bold text-slate-500 text-left">Health Score</label>
                        <span className="text-sm font-black text-slate-700">{health} / 100</span>
                      </div>
                      <div className="relative w-full flex items-center h-6 px-1">
                        <div className="absolute left-0 right-0 h-3 rounded-full bg-gradient-to-r from-red-500 via-amber-400 to-emerald-500 shadow-inner pointer-events-none mx-1" />
                        <input type="range" min="0" max="100" step="1" disabled value={health} onChange={(e) => setHealth(Number(e.target.value))} className="absolute w-full h-full opacity-0 cursor-pointer z-10" />
                        <div className="relative w-full h-full pointer-events-none">
                          <div className="absolute top-1/2 h-5 w-5 bg-white rounded-full shadow-[0_2px_4px_rgba(0,0,0,0.2)] border-2 border-slate-100 transition-all duration-75 ease-out" style={{ left: `${healthPercentage}%`, transform: "translate(-50%, -50%)" }} />
                        </div>
                      </div>
                    </div>

                    {/* Quantity Adjuster */}
                    <div className="flex items-center justify-between p-3 bg-slate-50 rounded-xl border border-slate-100">
                      <span className="text-sm font-bold text-slate-500">Quantity</span>
                      <div className="flex items-center gap-3">
                        <button onClick={() => setQty(Math.max(0, qty - 1))} className="w-8 h-8 rounded-full bg-white shadow-sm text-slate-600 font-bold hover:bg-slate-100 flex items-center justify-center pb-1">
                          -
                        </button>
                        <span className="w-6 text-center font-black text-slate-700">{qty}</span>
                        <button onClick={() => setQty(qty + 1)} className="w-8 h-8 rounded-full bg-white shadow-sm text-slate-600 font-bold hover:bg-slate-100 flex items-center justify-center pb-1">
                          +
                        </button>
                      </div>
                    </div>

                    {/* Expiry Date Picker */}
                    <div className="flex flex-col p-3 bg-slate-50 rounded-xl border border-slate-100">
                      <label className="text-sm font-bold text-slate-500 mb-1 text-left">Expiry Date</label>
                      <input type="date" value={expiryDate} onChange={(e) => setExpiryDate(e.target.value)} className="w-full text-left bg-transparent text-slate-700 font-semibold focus:outline-none" />
                    </div>
                  </div>

                  {/* Action Buttons */}
                  <div className="flex flex-col gap-2">
                    <button onClick={handleSaveClick} className="w-full py-3 bg-cyan-500 hover:bg-cyan-600 text-white font-bold rounded-xl shadow-md transition-colors active:scale-[0.98]">
                      Save Changes
                    </button>
                    {/* Explicit Delete Button */}
                    <button onClick={() => setShowConfirm(true)} className="w-full py-2 bg-transparent text-rose-400 hover:text-rose-500 hover:bg-rose-50 font-bold rounded-xl transition-colors">
                      Delete Item
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
