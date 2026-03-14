import React, { useState, useEffect } from "react";
import {
  Sparkles,
  Settings2,
  ChefHat,
  Plus,
  Minus,
  SlidersHorizontal,
  X,
  Check,
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import RecipeCard from "../components/Cards/RecipeCard";
import { apiAxios } from "../api";

const DEFAULT_IMAGE =
  "https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=800&auto=format&fit=crop&q=60";

function mapApiRecipeToCard(apiRecipe) {
  const ingredients = (apiRecipe.ingredients || []).map((i) => ({
    name: i.name || "",
    amount: i.qty ?? i.amount ?? "",
    inInventory: true,
  }));
  const toBuy = (apiRecipe.ingredients_to_buy || []).map((i) => ({
    name: i.name || "",
    amount: i.qty ?? i.amount ?? "",
    inInventory: false,
  }));
  const allIngredients = [...ingredients, ...toBuy];

  return {
    id: apiRecipe.id,
    title: apiRecipe.menu || "Recipe",
    description: apiRecipe.cuisine_type?.trim()
      ? `A ${apiRecipe.cuisine_type} dish based on your inventory.`
      : "AI-generated recipe based on your inventory.",
    time: "—",
    servings: apiRecipe.headcount ?? 1,
    difficulty: "medium",
    image: DEFAULT_IMAGE,
    ingredients: allIngredients,
    instructions: ["Follow the recipe using the listed ingredients."],
  };
}

// Options for the chips
// Options for the chips
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

export default function CookPage({ onNavigateHome, onShowToast, onKarmaChange }) {
  const [recipes, setRecipes] = useState([]);
  const [inventory, setInventory] = useState([]);
  const [globalServings, setGlobalServings] = useState(1);
  const [isLoading, setIsLoading] = useState(true);
  const [loadError, setLoadError] = useState(null);

  const refreshInventory = () => {
    apiAxios.get("/inventory").then((res) => setInventory(Array.isArray(res) ? res : [])).catch(() => setInventory([]));
  };

  useEffect(() => {
    const suggestionId = new URL(window.location.href).searchParams.get(
      "suggestion_id",
    );

    const fetchRecipes = async (sid) => {
      if (!sid) {
        setRecipes([]);
        setIsLoading(false);
        return;
      }
      try {
        setIsLoading(true);
        setLoadError(null);
        const json = await apiAxios.get(`/recipe-suggestions/${sid}`);
        const suggestion = json?.suggestion;
        if (!suggestion?.recipes?.length) {
          setRecipes([]);
        } else {
          setRecipes(suggestion.recipes.map(mapApiRecipeToCard));
          refreshInventory();
        }
      } catch (err) {
        setLoadError(err?.message ?? "Failed to load recipes");
        setRecipes([]);
      } finally {
        setIsLoading(false);
      }
    };

    if (!suggestionId) {
      return;
    }

    fetchRecipes(suggestionId);
  }, []);

  // Modal State
  const [isPrefsOpen, setIsPrefsOpen] = useState(false);
  const [prefs, setPrefs] = useState({
    familyMembers: 2,
    defaultServings: 1,
    cuisine: [],
    dietary: [], // Array for multi-select
  });

  // --- NEW: States for custom chips ---
  const [extraCuisines, setExtraCuisines] = useState([]);
  const [extraDiets, setExtraDiets] = useState([]);

  const [addingCuisine, setAddingCuisine] = useState(false);
  const [addingDiet, setAddingDiet] = useState(false);
  const [customInput, setCustomInput] = useState("");

  // Combine defaults with user-added options
  const allCuisines = [...CUISINES, ...extraCuisines];
  const allDiets = [...DIETS, ...extraDiets];

  // --- NEW: Handlers for saving custom chips ---
  const handleAddCustomCuisine = (e) => {
    e.preventDefault();
    const val = customInput.trim();
    if (val) {
      if (!allCuisines.includes(val))
        setExtraCuisines((prev) => [...prev, val]);
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
    if (globalServings > 1) setGlobalServings((prev) => prev - 1);
  };

  const handleIncrease = () => {
    if (globalServings < 10) setGlobalServings((prev) => prev + 1);
  };

  // Toggle for multi-select cuisine chips ---
  const toggleCuisine = (cuisine) => {
    setPrefs((prev) => ({
      ...prev,
      cuisine: prev.cuisine.includes(cuisine)
        ? prev.cuisine.filter((c) => c !== cuisine)
        : [...prev.cuisine, cuisine],
    }));
  };

  // Toggle for multi-select dietary chips
  const toggleDiet = (diet) => {
    setPrefs((prev) => ({
      ...prev,
      dietary: prev.dietary.includes(diet)
        ? prev.dietary.filter((d) => d !== diet)
        : [...prev.dietary, diet],
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
      <div className="px-6 pt-6 pb-1 bg-white shadow-sm top-0 z-10">
        <div className="flex justify-between items-center mb-1 pr-12">
          {" "}
          {/* Added pr-12 so text doesn't hit the floating button */}
          <h1 className="text-3xl font-black text-gray-800 flex items-center gap-2">
            Recipes just for you
          </h1>
        </div>
      </div>

      <div className="p-6">
        {/* Recipe List */}
        {isLoading && (
          <div className="py-12 text-center text-gray-500">
            Loading recipes…
          </div>
        )}
        {!isLoading && loadError && (
          <div className="py-12 text-center text-red-600">{loadError}</div>
        )}
        {!isLoading && !loadError && recipes.length === 0 && (
          <div className="py-12 text-center text-gray-500">
            No recipes yet. Add items to your pantry and check back after our
            next suggestion run.
          </div>
        )}
        {!isLoading && recipes.length > 0 && (
          <div className="space-y-4">
            {recipes.map((recipe) => (
              <RecipeCard
                key={recipe.id}
                recipe={recipe}
                inventory={inventory}
                currentServings={globalServings}
                onShowToast={onShowToast}
                onStartCookingSuccess={(karma = 0) => {
                  onShowToast?.(`Items consumed. +${karma} kitchen karma.`);
                  onKarmaChange?.();
                  onNavigateHome?.();
                }}
              />
            ))}
          </div>
        )}
      </div>

      {/* --- PREFERENCES MODAL (BOTTOM SHEET) --- */}
      {/* --- PREFERENCES MODAL (CENTERED DIALOG) --- */}
      <AnimatePresence>
        {isPrefsOpen && (
          // 1. Changed items-end to items-center and added global p-4
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
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
              // 2. Changed animation from a bottom-slide to a subtle scale/fade-in
              initial={{ scale: 0.95, opacity: 0, y: 10 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.95, opacity: 0, y: 10 }}
              transition={{ type: "spring", damping: 25, stiffness: 300 }}
              // 3. Changed rounded-t-3xl to rounded-3xl for all corners
              className="relative w-full max-w-md bg-white rounded-3xl shadow-2xl overflow-hidden max-h-[85vh] flex flex-col"
            >
              <div className="flex justify-between items-center p-6 border-b border-gray-100 shrink-0">
                <h2 className="text-2xl font-black text-gray-900">
                  Preferences
                </h2>
                <button
                  onClick={() => setIsPrefsOpen(false)}
                  className="p-2 bg-gray-100 rounded-full text-gray-500 hover:bg-gray-200 transition-colors"
                >
                  <X size={20} strokeWidth={3} />
                </button>
              </div>

              <div className="p-6 overflow-y-auto space-y-8 custom-scrollbar">
                {/* 1. Default Servings */}
                <div>
                  <div className="space-y-3">
                    <label className="text-sm font-bold text-gray-700">
                      Default Servings
                    </label>
                    <div className="flex items-center justify-between bg-[#E4F5FF]/50 p-1.5 rounded-xl border border-[#E4F5FF]">
                      <button
                        onClick={() =>
                          setPrefs((p) => ({
                            ...p,
                            defaultServings: Math.max(1, p.defaultServings - 1),
                          }))
                        }
                        className="w-8 h-8 flex items-center justify-center bg-white rounded-lg shadow-sm active:scale-95"
                      >
                        <Minus size={16} strokeWidth={3} />
                      </button>
                      <span className="font-bold text-lg text-[#187A4F]">
                        {prefs.defaultServings}
                      </span>
                      <button
                        onClick={() =>
                          setPrefs((p) => ({
                            ...p,
                            defaultServings: p.defaultServings + 1,
                          }))
                        }
                        className="w-8 h-8 flex items-center justify-center bg-white rounded-lg shadow-sm active:scale-95"
                      >
                        <Plus size={16} strokeWidth={3} />
                      </button>
                    </div>
                  </div>
                </div>

                {/* 2. Cuisine (Multi Select Chips with Add Custom) */}
                <div>
                  <label className="text-sm font-bold text-gray-700 mb-3 block">
                    Preferred Cuisine
                  </label>
                  <div className="flex flex-wrap gap-2">
                    {allCuisines.map((cuisine) => {
                      const isSelected = prefs.cuisine.includes(cuisine);
                      return (
                        <button
                          key={cuisine}
                          onClick={() => toggleCuisine(cuisine)}
                          className={`flex items-center gap-1.5 px-4 py-2 rounded-xl text-sm font-bold transition-all border ${
                            isSelected
                              ? "bg-[#187A4F] text-white border-[#187A4F] shadow-md shadow-[#187A4F]/20"
                              : "bg-white text-gray-600 border-gray-200 hover:bg-gray-50"
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
                          onBlur={handleAddCustomCuisine}
                          placeholder="Type & Enter..."
                          className="px-4 py-2 rounded-xl text-sm font-bold border-2 border-[#187A4F] outline-none w-32 text-gray-700 bg-white"
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

                {/* 3. Dietary Restrictions (Multi Select Chips with Add Custom) */}
                <div>
                  <label className="text-sm font-bold text-gray-700 mb-3 block">
                    Dietary Restrictions
                  </label>
                  <div className="flex flex-wrap gap-2">
                    {allDiets.map((diet) => {
                      const isSelected = prefs.dietary.includes(diet);
                      return (
                        <button
                          key={diet}
                          onClick={() => toggleDiet(diet)}
                          className={`flex items-center gap-1.5 px-4 py-2 rounded-xl text-sm font-bold transition-all border ${
                            isSelected
                              ? "bg-[#3A4D5C] text-white border-[#3A4D5C] shadow-md"
                              : "bg-white text-gray-600 border-gray-200 hover:bg-gray-50"
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
