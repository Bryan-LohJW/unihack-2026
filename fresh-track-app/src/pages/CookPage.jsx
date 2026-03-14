import React, { useState } from 'react';
import { Sparkles, Settings2, ChefHat, Plus, Minus, SlidersHorizontal, X, Check } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import RecipeCard from '../components/Cards/RecipeCard';

const mockRecipes = [
  {
    id: 1,
    title: "Savory Polenta with Pickled Vegetable Relish",
    description: "A simple yet satisfying dish featuring creamy polenta topped with a zesty and tangy relish made from pickled vegetables.",
    time: "20 min",
    servings: 2,
    difficulty: "easy",
    image: "https://plus.unsplash.com/premium_photo-1695240028448-9a8bf3e164f5?w=1000&auto=format&fit=crop&q=60&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxzZWFyY2h8MXx8cmlzb3R0b3xlbnwwfHwwfHx8MA%3D%3D", 
    ingredients: [
      { name: "Gluten Free Corn Grits, Polenta (Bob's Red Mill)", amount: "1/2 cup", inInventory: true },
      { name: "Water or Broth", amount: "2 cups", inInventory: false },
      { name: "Chopped Pickled vegetables", amount: "1/2 cup", inInventory: true },
      { name: "Thinly sliced Green Onions", amount: "1 stalk", inInventory: true },
      { name: "Butter (optional)", amount: "1 tbsp", inInventory: false },
    ],
    instructions: [
      "Boil water or broth in a medium saucepan.",
      "Slowly whisk in the polenta to prevent lumps.",
      "Reduce heat and simmer for 15 minutes until creamy.",
      "Top with pickled vegetables and green onions before serving."
    ]
  },
  {
    id: 2,
    title: "Spicy Tomato & Egg Skillet",
    description: "A quick, protein-packed breakfast or dinner using fresh tomatoes and your pantry spices.",
    time: "15 min",
    servings: 1,
    difficulty: "medium",
    image: "https://plus.unsplash.com/premium_photo-1726880564473-3c211b6a6b39?q=80&w=1137&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D", 
    ingredients: [
      { name: "Eggs", amount: "2", inInventory: true },
      { name: "Diced Tomatoes", amount: "1 cup", inInventory: true },
      { name: "Chili Flakes", amount: "1 tsp", inInventory: false },
    ],
    instructions: [
      "Heat a skillet and add diced tomatoes.",
      "Simmer until tomatoes break down into a sauce.",
      "Make small wells in the sauce and crack eggs into them.",
      "Cover and cook until egg whites are set."
    ]
  }
];

// Options for the chips
// Options for the chips
const CUISINES = ['Italian', 'Asian', 'Mexican', 'Indian', 'Mediterranean'];
const DIETS = ['Vegan', 'Vegetarian', 'High Protein', 'Gluten-Free', 'Keto', 'Dairy-Free'];

export default function CookPage() {
  const [recipes, setRecipes] = useState(mockRecipes);
  const [globalServings, setGlobalServings] = useState(1);
  
  // Modal State
  const [isPrefsOpen, setIsPrefsOpen] = useState(false);
  const [prefs, setPrefs] = useState({
    familyMembers: 2,
    defaultServings: 1,
    cuisine: [],
    dietary: [] // Array for multi-select
  });

  // --- NEW: States for custom chips ---
  const [extraCuisines, setExtraCuisines] = useState([]);
  const [extraDiets, setExtraDiets] = useState([]);
  
  const [addingCuisine, setAddingCuisine] = useState(false);
  const [addingDiet, setAddingDiet] = useState(false);
  const [customInput, setCustomInput] = useState('');

  // Combine defaults with user-added options
  const allCuisines = [...CUISINES, ...extraCuisines];
  const allDiets = [...DIETS, ...extraDiets];

  // --- NEW: Handlers for saving custom chips ---
  const handleAddCustomCuisine = (e) => {
    e.preventDefault();
    const val = customInput.trim();
    if (val) {
      if (!allCuisines.includes(val)) setExtraCuisines(prev => [...prev, val]);
      if (!prefs.cuisine.includes(val)) toggleCuisine(val);
    }
    setAddingCuisine(false);
    setCustomInput('');
  };

  const handleAddCustomDiet = (e) => {
    e.preventDefault();
    const val = customInput.trim();
    if (val) {
      if (!allDiets.includes(val)) setExtraDiets(prev => [...prev, val]);
      if (!prefs.dietary.includes(val)) toggleDiet(val);
    }
    setAddingDiet(false);
    setCustomInput('');
  };

  const handleDecrease = () => {
    if (globalServings > 1) setGlobalServings(prev => prev - 1);
  };

  const handleIncrease = () => {
    if (globalServings < 10) setGlobalServings(prev => prev + 1);
  };

  // Toggle for multi-select cuisine chips ---
  const toggleCuisine = (cuisine) => {
    setPrefs(prev => ({
      ...prev,
      cuisine: prev.cuisine.includes(cuisine)
        ? prev.cuisine.filter(c => c !== cuisine)
        : [...prev.cuisine, cuisine]
    }));
  };

  // Toggle for multi-select dietary chips
  const toggleDiet = (diet) => {
    setPrefs(prev => ({
      ...prev,
      dietary: prev.dietary.includes(diet)
        ? prev.dietary.filter(d => d !== diet)
        : [...prev.dietary, diet]
    }));
  };

  const savePreferences = () => {
    // In the future, this is where you'd trigger the AI API to fetch new recipes based on prefs
    setGlobalServings(prefs.defaultServings);
    setIsPrefsOpen(false);
  };
  
  return (
    <div className="min-h-full bg-[#FAFAFA] pb-32 relative">
      
      {/* --- FLOATING TOP BUTTON --- */}
      <button 
        onClick={() => setIsPrefsOpen(true)}
        className="absolute top-6 right-6 z-20 p-2.5 bg-white rounded-full shadow-md border border-gray-100 hover:bg-gray-50 active:scale-95 transition-all text-[#3A4D5C]"
      >
        <SlidersHorizontal size={22} strokeWidth={2.5} />
      </button>

      {/* Header Area */}
      <div className="px-6 pt-6 pb-4 bg-white shadow-sm sticky top-0 z-10">
        <div className="flex justify-between items-center mb-6 pr-12"> {/* Added pr-12 so text doesn't hit the floating button */}
          <h1 className="text-3xl font-black text-gray-800 flex items-center gap-2">
            Recipes just for you
          </h1>
        </div>

      
      </div>

      <div className="p-6">
        {/* Recipe List */}
        <div className="space-y-4">
          {recipes.map(recipe => (
            <RecipeCard key={recipe.id} recipe={recipe} currentServings={globalServings}/>
          ))}
        </div>
      </div>

      {/* --- PREFERENCES MODAL (BOTTOM SHEET) --- */}
      <AnimatePresence>
        {isPrefsOpen && (
          <div className="fixed inset-0 z-50 flex items-end justify-center sm:items-center sm:p-4">
            {/* Backdrop */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsPrefsOpen(false)}
              className="absolute inset-0 bg-black/40 backdrop-blur-sm"
            />

            {/* Modal Content */}
            <motion.div
              initial={{ y: "100%", opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              exit={{ y: "100%", opacity: 0 }}
              transition={{ type: "spring", damping: 25, stiffness: 200 }}
              className="relative w-full max-w-md bg-white rounded-t-3xl sm:rounded-3xl shadow-2xl overflow-hidden max-h-[90vh] flex flex-col"
            >
              <div className="flex justify-between items-center p-6 border-b border-gray-100 shrink-0">
                <h2 className="text-2xl font-black text-gray-900">Preferences</h2>
                <button 
                  onClick={() => setIsPrefsOpen(false)}
                  className="p-2 bg-gray-100 rounded-full text-gray-500 hover:bg-gray-200 transition-colors"
                >
                  <X size={20} strokeWidth={3} />
                </button>
              </div>

              <div className="p-6 overflow-y-auto space-y-8 custom-scrollbar">
                
                {/* 1. Family Members & Default Servings (Grid) */}
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-3">
                    <label className="text-sm font-bold text-gray-700">Family Size</label>
                    <div className="flex items-center justify-between bg-gray-50 p-1.5 rounded-xl border border-gray-200">
                      <button 
                        onClick={() => setPrefs(p => ({...p, familyMembers: Math.max(1, p.familyMembers - 1)}))}
                        className="w-8 h-8 flex items-center justify-center bg-white rounded-lg shadow-sm active:scale-95"
                      >
                        <Minus size={16} strokeWidth={3} />
                      </button>
                      <span className="font-bold text-lg">{prefs.familyMembers}</span>
                      <button 
                        onClick={() => setPrefs(p => ({...p, familyMembers: p.familyMembers + 1}))}
                        className="w-8 h-8 flex items-center justify-center bg-white rounded-lg shadow-sm active:scale-95"
                      >
                        <Plus size={16} strokeWidth={3} />
                      </button>
                    </div>
                  </div>

                  <div className="space-y-3">
                    <label className="text-sm font-bold text-gray-700">Default Servings</label>
                    <div className="flex items-center justify-between bg-[#E4F5FF]/50 p-1.5 rounded-xl border border-[#E4F5FF]">
                      <button 
                        onClick={() => setPrefs(p => ({...p, defaultServings: Math.max(1, p.defaultServings - 1)}))}
                        className="w-8 h-8 flex items-center justify-center bg-white rounded-lg shadow-sm active:scale-95"
                      >
                        <Minus size={16} strokeWidth={3} />
                      </button>
                      <span className="font-bold text-lg text-[#187A4F]">{prefs.defaultServings}</span>
                      <button 
                        onClick={() => setPrefs(p => ({...p, defaultServings: p.defaultServings + 1}))}
                        className="w-8 h-8 flex items-center justify-center bg-white rounded-lg shadow-sm active:scale-95"
                      >
                        <Plus size={16} strokeWidth={3} />
                      </button>
                    </div>
                  </div>
                </div>

                {/* 2. Cuisine (Multi Select Chips with Add Custom) */}
                <div>
                  <label className="text-sm font-bold text-gray-700 mb-3 block">Preferred Cuisine</label>
                  <div className="flex flex-wrap gap-2">
                    {allCuisines.map(cuisine => {
                      const isSelected = prefs.cuisine.includes(cuisine);
                      return (
                        <button
                          key={cuisine}
                          onClick={() => toggleCuisine(cuisine)}
                          className={`flex items-center gap-1.5 px-4 py-2 rounded-xl text-sm font-bold transition-all border ${
                            isSelected 
                              ? 'bg-[#187A4F] text-white border-[#187A4F] shadow-md shadow-[#187A4F]/20' 
                              : 'bg-white text-gray-600 border-gray-200 hover:bg-gray-50'
                          }`}
                        >
                          {isSelected && <Check size={14} strokeWidth={3} />}
                          {cuisine}
                        </button>
                      );
                    })}

                    {/* Add Custom Cuisine Input/Button */}
                    {addingCuisine ? (
                      <form onSubmit={handleAddCustomCuisine} className="flex">
                        <input 
                          autoFocus
                          value={customInput}
                          onChange={(e) => setCustomInput(e.target.value)}
                          onBlur={handleAddCustomCuisine} // Saves if they click away
                          placeholder="Type & Enter..."
                          className="px-4 py-2 rounded-xl text-sm font-bold border-2 border-[#187A4F] outline-none w-32 text-gray-700 bg-white"
                        />
                      </form>
                    ) : (
                      <button 
                        onClick={() => { setAddingCuisine(true); setCustomInput(''); }}
                        className="flex items-center gap-1 px-3 py-2 rounded-xl text-sm font-bold text-gray-500 border-2 border-dashed border-gray-300 hover:bg-gray-50 hover:text-gray-700 transition-all"
                      >
                        <Plus size={16} strokeWidth={3} /> Add
                      </button>
                    )}
                  </div>
                </div>

                {/* 3. Dietary Restrictions (Multi Select Chips with Add Custom) */}
                <div>
                  <label className="text-sm font-bold text-gray-700 mb-3 block">Dietary Restrictions</label>
                  <div className="flex flex-wrap gap-2">
                    {allDiets.map(diet => {
                      const isSelected = prefs.dietary.includes(diet);
                      return (
                        <button
                          key={diet}
                          onClick={() => toggleDiet(diet)}
                          className={`flex items-center gap-1.5 px-4 py-2 rounded-xl text-sm font-bold transition-all border ${
                            isSelected 
                              ? 'bg-[#3A4D5C] text-white border-[#3A4D5C] shadow-md' 
                              : 'bg-white text-gray-600 border-gray-200 hover:bg-gray-50'
                          }`}
                        >
                          {isSelected && <Check size={14} strokeWidth={3} />}
                          {diet}
                        </button>
                      );
                    })}

                    {/* Add Custom Diet Input/Button */}
                    {addingDiet ? (
                      <form onSubmit={handleAddCustomDiet} className="flex">
                        <input 
                          autoFocus
                          value={customInput}
                          onChange={(e) => setCustomInput(e.target.value)}
                          onBlur={handleAddCustomDiet}
                          placeholder="Type & Enter..."
                          className="px-4 py-2 rounded-xl text-sm font-bold border-2 border-[#3A4D5C] outline-none w-32 text-gray-700 bg-white"
                        />
                      </form>
                    ) : (
                      <button 
                        onClick={() => { setAddingDiet(true); setCustomInput(''); }}
                        className="flex items-center gap-1 px-3 py-2 rounded-xl text-sm font-bold text-gray-500 border-2 border-dashed border-gray-300 hover:bg-gray-50 hover:text-gray-700 transition-all"
                      >
                        <Plus size={16} strokeWidth={3} /> Add
                      </button>
                    )}
                  </div>
                </div>

              </div>

              {/* Save Button */}
              <div className="p-6 pt-2 bg-white border-t border-gray-50 shrink-0">
                <button
                  onClick={savePreferences}
                  className="w-full py-4 bg-[#187A4F] text-white rounded-xl font-black text-lg hover:shadow-lg hover:shadow-[#187A4F]/30 active:scale-[0.98] transition-all"
                >
                  Save & Update Recipes
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}