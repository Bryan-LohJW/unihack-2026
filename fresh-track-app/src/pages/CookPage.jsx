import React, { useState, useEffect } from "react";
import { SlidersHorizontal } from "lucide-react";
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

import RecipePrefsModal from "../components/Modals/RecipePrefsModal";

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

  const [isPrefsOpen, setIsPrefsOpen] = useState(false);
  const [prefs, setPrefs] = useState({
    familyMembers: 2,
    defaultServings: 1,
    cuisine: [],
    dietary: [],
  });

  const handlePrefsSave = (newPrefs) => {
    setPrefs(newPrefs);
    setGlobalServings(newPrefs.defaultServings);
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

      <RecipePrefsModal
        isOpen={isPrefsOpen}
        onClose={() => setIsPrefsOpen(false)}
        onSave={handlePrefsSave}
        initialPrefs={prefs}
        saveButtonText="Save & Update Recipes"
      />
    </div>
  );
}
