import React, { useState, useEffect } from "react";
import { Plus, Minus, X } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

const CUISINES = [
  "Italian",
  "Mexican",
  "Indian",
  "Mediterranean",
  "Chinese",
  "Japanese",
  "Korean",
  "Thai",
  "Indonesian",
];
const DIETS = [
  "Vegan",
  "Vegetarian",
  "High Protein",
  "Gluten-Free",
  "Keto",
  "Dairy-Free",
];

const DEFAULT_PREFS = {
  familyMembers: 2,
  defaultServings: 1,
  cuisine: [],
  dietary: [],
};

export default function RecipePrefsModal({ isOpen, onClose, onSave, saveButtonText = "Save & Update Recipes", initialPrefs }) {
  const [prefs, setPrefs] = useState(initialPrefs ?? DEFAULT_PREFS);
  const [extraCuisines, setExtraCuisines] = useState([]);
  const [extraDiets, setExtraDiets] = useState([]);
  const [addingCuisine, setAddingCuisine] = useState(false);
  const [addingDiet, setAddingDiet] = useState(false);
  const [customInput, setCustomInput] = useState("");

  const allCuisines = [...CUISINES, ...extraCuisines];
  const allDiets = [...DIETS, ...extraDiets];

  useEffect(() => {
    if (isOpen) {
      setPrefs(initialPrefs ?? DEFAULT_PREFS);
    }
  }, [isOpen, initialPrefs]);

  const handleAddCustomCuisine = (e) => {
    e.preventDefault();
    const val = customInput.trim();
    if (val) {
      if (!allCuisines.includes(val)) setExtraCuisines((prev) => [...prev, val]);
      if (!prefs.cuisine.includes(val)) toggleCuisine(val);
    }
    setAddingCuisine(false);
    setCustomInput("");
  };

  const handleAddCustomDiet = (e) => {
    e.preventDefault();
    const val = customInput.trim();
    if (val) {
      if (!allDiets.includes(val)) setExtraDiets((prev) => [...prev, val]);
      if (!prefs.dietary.includes(val)) toggleDiet(val);
    }
    setAddingDiet(false);
    setCustomInput("");
  };

  const handleDecrease = () => {
    setPrefs((p) => ({
      ...p,
      defaultServings: Math.max(1, p.defaultServings - 1),
    }));
  };

  const handleIncrease = () => {
    setPrefs((p) => ({
      ...p,
      defaultServings: Math.min(10, p.defaultServings + 1),
    }));
  };

  const toggleCuisine = (cuisine) => {
    setPrefs((prev) => ({
      ...prev,
      cuisine: prev.cuisine.includes(cuisine)
        ? prev.cuisine.filter((c) => c !== cuisine)
        : [...prev.cuisine, cuisine],
    }));
  };

  const toggleDiet = (diet) => {
    setPrefs((prev) => ({
      ...prev,
      dietary: prev.dietary.includes(diet)
        ? prev.dietary.filter((d) => d !== diet)
        : [...prev.dietary, diet],
    }));
  };

  const handleSave = () => {
    onSave?.(prefs);
    onClose?.();
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="absolute inset-0 bg-black/40 backdrop-blur-sm"
          />

          <motion.div
            initial={{ scale: 0.95, opacity: 0, y: 10 }}
            animate={{ scale: 1, opacity: 1, y: 0 }}
            exit={{ scale: 0.95, opacity: 0, y: 10 }}
            transition={{ type: "spring", damping: 25, stiffness: 300 }}
            onClick={(e) => e.stopPropagation()}
            className="relative w-full max-w-md bg-white rounded-3xl shadow-2xl overflow-hidden max-h-[85vh] flex flex-col"
          >
            <div className="flex justify-between items-center p-6 border-b border-gray-100 shrink-0">
              <h2 className="text-2xl font-black text-gray-900">Preferences</h2>
              <button
                onClick={onClose}
                className="p-2 bg-gray-100 rounded-full text-gray-500 hover:bg-gray-200 transition-colors"
              >
                <X size={20} strokeWidth={3} />
              </button>
            </div>

            <div className="p-6 overflow-y-auto space-y-8 custom-scrollbar">
              <div>
                <div className="space-y-3">
                  <label className="text-sm font-bold text-gray-700">Default Servings</label>
                  <div className="flex items-center justify-between bg-[#E4F5FF]/50 p-1.5 rounded-xl border border-[#E4F5FF]">
                    <button
                      onClick={handleDecrease}
                      className="w-8 h-8 flex items-center justify-center bg-white rounded-lg shadow-sm active:scale-95"
                    >
                      <Minus size={16} strokeWidth={3} />
                    </button>
                    <span className="font-bold text-lg text-[var(--color-primary)]">{prefs.defaultServings}</span>
                    <button
                      onClick={handleIncrease}
                      className="w-8 h-8 flex items-center justify-center bg-white rounded-lg shadow-sm active:scale-95"
                    >
                      <Plus size={16} strokeWidth={3} />
                    </button>
                  </div>
                </div>
              </div>

              <div>
                <div className="mb-3">
                  <label className="text-sm font-bold text-gray-700 block">Preferred Cuisine</label>
                  <span className="text-xs text-gray-400">Select all that apply</span>
                </div>
                <div className="flex flex-wrap gap-2">
                  {allCuisines.map((cuisine) => {
                    const isSelected = prefs.cuisine.includes(cuisine);
                    return (
                      <button
                        key={cuisine}
                        onClick={() => toggleCuisine(cuisine)}
                        className={`flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-bold transition-colors border-2 focus:outline-none focus-visible:outline-none ${
                          isSelected
                            ? "bg-[var(--color-primary)] text-white border-[var(--color-primary)] shadow-md shadow-[var(--color-primary)]/30"
                            : "bg-white text-gray-500 border-gray-200"
                        }`}
                      >
                        <span className={`w-3 h-3 rounded-full border-2 shrink-0 transition-all ${isSelected ? "bg-white border-white" : "border-gray-300"}`} />
                        {cuisine}
                      </button>
                    );
                  })}
                  {addingCuisine ? (
                    <form onSubmit={handleAddCustomCuisine} className="flex">
                      <input
                        autoFocus
                        value={customInput}
                        onChange={(e) => setCustomInput(e.target.value)}
                        onBlur={handleAddCustomCuisine}
                        placeholder="Type & Enter..."
                        className="px-4 py-2 rounded-xl text-sm font-bold border-2 border-[var(--color-primary)] outline-none w-32 text-gray-700 bg-white"
                      />
                    </form>
                  ) : (
                    <button
                      onClick={() => {
                        setAddingCuisine(true);
                        setCustomInput("");
                      }}
                      className="flex items-center gap-1 px-3 py-2 rounded-xl text-sm font-bold text-gray-500 border-2 border-dashed border-gray-300 hover:bg-gray-50 hover:text-gray-700 transition-all"
                    >
                      <Plus size={16} strokeWidth={3} /> Add
                    </button>
                  )}
                </div>
              </div>

              <div>
                <div className="mb-3">
                  <label className="text-sm font-bold text-gray-700 block">Dietary Restrictions</label>
                  <span className="text-xs text-gray-400">Select all that apply</span>
                </div>
                <div className="flex flex-wrap gap-2">
                  {allDiets.map((diet) => {
                    const isSelected = prefs.dietary.includes(diet);
                    return (
                      <button
                        key={diet}
                        onClick={() => toggleDiet(diet)}
                        className={`flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-bold transition-colors border-2 focus:outline-none focus-visible:outline-none ${
                          isSelected
                            ? "bg-[var(--color-primary)] text-white border-[var(--color-primary)] shadow-md shadow-[var(--color-primary)]/30"
                            : "bg-white text-gray-500 border-gray-200"
                        }`}
                      >
                        <span className={`w-3 h-3 rounded-full border-2 shrink-0 transition-all ${isSelected ? "bg-white border-white" : "border-gray-300"}`} />
                        {diet}
                      </button>
                    );
                  })}
                  {addingDiet ? (
                    <form onSubmit={handleAddCustomDiet} className="flex">
                      <input
                        autoFocus
                        value={customInput}
                        onChange={(e) => setCustomInput(e.target.value)}
                        onBlur={handleAddCustomDiet}
                        placeholder="Type & Enter..."
                        className="px-4 py-2 rounded-xl text-sm font-bold border-2 border-[var(--color-primary)] outline-none w-32 text-gray-700 bg-white"
                      />
                    </form>
                  ) : (
                    <button
                      onClick={() => {
                        setAddingDiet(true);
                        setCustomInput("");
                      }}
                      className="flex items-center gap-1 px-3 py-2 rounded-xl text-sm font-bold text-gray-500 border-2 border-dashed border-gray-300 hover:bg-gray-50 hover:text-gray-700 transition-all"
                    >
                      <Plus size={16} strokeWidth={3} /> Add
                    </button>
                  )}
                </div>
              </div>
            </div>

            <div className="p-6 pt-2 bg-white border-t border-gray-50 shrink-0">
              <button
                onClick={handleSave}
                className="w-full py-4 bg-[var(--color-primary)] text-white rounded-xl font-black text-lg hover:shadow-lg hover:shadow-[var(--color-primary)]/30 active:scale-[0.98] transition-all"
              >
                {saveButtonText}
              </button>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
