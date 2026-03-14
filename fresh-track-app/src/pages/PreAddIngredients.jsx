import React, { useState } from 'react';
import { Package, Calendar, ChevronDown, ChevronUp, ChevronRight } from 'lucide-react';

const INITIAL_INGREDIENTS = [
  { calories: 0, expiry_days: 7, image_url: "tomato.png",   name: "Tomato",           qty: 800, section: "fridge" },
  { calories: 0, expiry_days: 7, image_url: "eggs.png",     name: "Barn Eggs",        qty: 700, section: "fridge" },
  { calories: 0, expiry_days: 7, image_url: "mushroom.png", name: "Sliced Mushrooms", qty: 500, section: "fridge" },
  { calories: 0, expiry_days: 7, image_url: "rice.png",     name: "Organic Quinoa",   qty: 500, section: "fridge" },
  { calories: 0, expiry_days: 7, image_url: "milk.png",     name: "Full Cream Milk",  qty: 2,   section: "fridge" },
  { calories: 0, expiry_days: 7, image_url: "chicken.png",  name: "Chicken Breast",   qty: 1,   section: "fridge" },
  { calories: 0, expiry_days: 7, image_url: "unknown.png",  name: "Sweet Corn",       qty: 500, section: "fridge" },
  { calories: 0, expiry_days: 7, image_url: "unknown.png",  name: "Peaches",          qty: 1,   section: "fridge" },
];

const SECTIONS = ['fridge', 'freezer', 'pantry'];

const baseInputClasses = "w-full px-3 py-2 rounded-lg border border-gray-200 bg-white text-sm text-[var(--color-black)] font-medium focus:outline-none focus:ring-2 focus:ring-[var(--color-blue)] focus:border-blue-400 transition";

// Convert expiry_days offset from today to a yyyy-mm-dd string
const daysToDateString = (days) => {
  const d = new Date();
  d.setDate(d.getDate() + days);
  return d.toISOString().split('T')[0];
};

// Convert a yyyy-mm-dd string back to days from today (minimum 1)
const dateStringToDays = (dateStr) => {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const target = new Date(dateStr);
  const diff = Math.round((target - today) / (1000 * 60 * 60 * 24));
  return Math.max(1, diff);
};

const IngredientCard = ({ item, index, onUpdate }) => {
  const [expanded, setExpanded] = useState(false);
  const iconSrc = `/icons/${item.image_url}`;

  const handleChange = (field, value) => {
    onUpdate(index, { ...item, [field]: value });
  };

  return (
    <div className="bg-[var(--color-white)] border border-gray-100 rounded-2xl shadow-lg overflow-hidden">
      {/* Collapsed row — always visible */}
      <button
        type="button"
        onClick={() => setExpanded((prev) => !prev)}
        className="w-full flex items-center gap-4 p-4 text-left"
      >
        <div className="w-14 h-14 flex items-center justify-center rounded-xl bg-[var(--color-blue)] shrink-0">
          <img
            src={iconSrc}
            alt={item.name}
            className="w-9 h-9 object-contain"
            onError={(e) => { e.currentTarget.src = '/icons/unknown.png'; }}
          />
        </div>

        <div className="flex-1 min-w-0">
          <p className="font-semibold text-[var(--color-black)] truncate">{item.name}</p>
          <div className="flex items-center gap-3 mt-1">
            <span className="flex items-center gap-1 text-xs text-gray-500">
              <Package size={12} /> {item.qty}g
            </span>
            <span className="flex items-center gap-1 text-xs text-gray-500">
              <Calendar size={12} /> {daysToDateString(item.expiry_days)}
            </span>
            <span className="text-xs text-gray-400 capitalize">{item.section}</span>
          </div>
        </div>

        <div className="text-gray-400 shrink-0">
          {expanded ? <ChevronUp size={18} /> : <ChevronDown size={18} />}
        </div>
      </button>

      {/* Animated expand using CSS grid trick */}
      <div className={`grid transition-all duration-300 ease-in-out ${expanded ? 'grid-rows-[1fr]' : 'grid-rows-[0fr]'}`}>
        <div className="overflow-hidden">
          <div className="px-4 pb-4 border-t border-gray-100 pt-3 grid grid-cols-2 gap-3">
            <div className="col-span-2">
              <label className="text-xs font-bold text-gray-500 mb-1 block">Name</label>
              <input
                type="text"
                value={item.name}
                onChange={(e) => handleChange('name', e.target.value)}
                className={baseInputClasses}
              />
            </div>

            <div>
              <label className="text-xs font-bold text-gray-500 mb-1 block">Quantity (g)</label>
              <input
                type="number"
                min="0"
                value={item.qty}
                onChange={(e) => handleChange('qty', Number(e.target.value))}
                className={baseInputClasses}
              />
            </div>

            <div>
              <label className="text-xs font-bold text-gray-500 mb-1 block">Expiry Date</label>
              <input
                type="date"
                value={daysToDateString(item.expiry_days)}
                min={daysToDateString(1)}
                onChange={(e) => handleChange('expiry_days', dateStringToDays(e.target.value))}
                className={baseInputClasses}
              />
            </div>

            <div>
              <label className="text-xs font-bold text-gray-500 mb-1 block">Calories</label>
              <input
                type="number"
                min="0"
                value={item.calories}
                onChange={(e) => handleChange('calories', Number(e.target.value))}
                className={baseInputClasses}
              />
            </div>

            <div>
              <label className="text-xs font-bold text-gray-500 mb-1 block">Section</label>
              <select
                value={item.section}
                onChange={(e) => handleChange('section', e.target.value)}
                className={baseInputClasses}
              >
                {SECTIONS.map((s) => (
                  <option key={s} value={s}>{s.charAt(0).toUpperCase() + s.slice(1)}</option>
                ))}
              </select>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

const PreAddIngredients = ({ onNavigate }) => {
  const [ingredients, setIngredients] = useState(INITIAL_INGREDIENTS);

  const handleUpdate = (index, updated) => {
    setIngredients((prev) => prev.map((item, i) => (i === index ? updated : item)));
  };

  const handleSubmit = async () => {
    // TODO: POST ingredients to backend
    // await fetch('/api/inventory/batch', {
    //   method: 'POST',
    //   headers: { 'Content-Type': 'application/json' },
    //   body: JSON.stringify(ingredients),
    // });
    onNavigate('home');
  };

  return (
    <div className="px-4 pt-24 pb-32 md:pb-12">
      <h1 className="text-3xl font-semibold text-[var(--color-black)] mb-1">Add Ingredients</h1>
      <p className="text-sm text-gray-500 mb-6">Review items scanned from your receipt</p>

      <div className="flex flex-col gap-4">
        {ingredients.map((item, index) => (
          <IngredientCard key={index} item={item} index={index} onUpdate={handleUpdate} />
        ))}
      </div>

      <button
        type="button"
        onClick={handleSubmit}
        className="mt-8 w-full flex items-center justify-center gap-2 py-4 bg-[var(--color-blue)] text-[var(--color-black)] rounded-xl font-black text-lg hover:shadow-lg hover:shadow-[var(--color-blue)]/30 active:scale-[0.98] transition-all"
      >
        Add to Inventory
        <ChevronRight size={20} />
      </button>
    </div>
  );
};

export default PreAddIngredients;
