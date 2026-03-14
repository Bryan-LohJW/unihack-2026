import React, { useState, useEffect } from 'react';
import { AlertTriangle, ChevronRight, Loader2 } from 'lucide-react';

import IngredientCard from '../components/PreAddIngredients/IngredientCard';
import UnrecognisedCard from '../components/PreAddIngredients/UnrecognisedCard';
import AddIngredientCard from '../components/PreAddIngredients/AddIngredientCard';
import {
  INITIAL_INGREDIENTS,
  INITIAL_UNRECOGNISED,
  NEW_INGREDIENT_TEMPLATE,
  withId,
} from '../components/PreAddIngredients/ingredientUtils';

const USE_STATIC_DATA = true;

const PreAddIngredients = ({ onNavigate, data }) => {
  const [ingredients, setIngredients] = useState(USE_STATIC_DATA ? INITIAL_INGREDIENTS : []);
  const [unrecognised, setUnrecognised] = useState(USE_STATIC_DATA ? INITIAL_UNRECOGNISED : []);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (USE_STATIC_DATA || !data?.file) return;
    const fetchIngredients = async () => {
      setLoading(true); setError(null);
      try {
        const formData = new FormData();
        formData.append('file', data.file);
        const res = await fetch('http://localhost:5001/llm/receipt', { method: 'POST', body: formData });
        if (!res.ok) { const err = await res.json(); throw new Error(err.error || 'Failed to scan receipt'); }
        const json = await res.json();
        setIngredients((json.recognised ?? json).map(withId));
        setUnrecognised((json.unrecognised ?? []).map((u) => ({ ...u, _id: makeId(), included: false, draft: { ...NEW_INGREDIENT_TEMPLATE } })));
      } catch (e) { setError(e.message); }
      finally { setLoading(false); }
    };
    fetchIngredients();
  }, [data]);

  const handleUpdate = (index, updated) => {
    setIngredients((prev) => prev.map((item, i) => (i === index ? updated : item)));
  };

  const handleDelete = (id) => {
    setIngredients((prev) => prev.filter((item) => item._id !== id));
  };

  const handleAddNew = () => {
    setIngredients((prev) => [...prev, withId({ ...NEW_INGREDIENT_TEMPLATE })]);
  };

  const handleToggleUnrecognised = (id) => {
    setUnrecognised((prev) => prev.map((u) => u._id === id ? { ...u, included: !u.included } : u));
  };

  const handleDraftChange = (id, field, value) => {
    setUnrecognised((prev) => prev.map((u) => u._id === id ? { ...u, draft: { ...u.draft, [field]: value } } : u));
  };

  const handleSubmit = async () => {
    setSubmitting(true);
    const includedFromUnrecognised = unrecognised
      .filter((u) => u.included)
      .map(({ draft }) => ({ ...draft, image_url: 'unknown.png' }));
    const payload = [...ingredients, ...includedFromUnrecognised].map(({ _id, ...rest }) => rest);
    try {
      await fetch('http://localhost:5001/inventory/batch', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });
    } catch {
      // Filler — navigate home regardless
    } finally {
      setSubmitting(false);
      onNavigate('home');
    }
  };

  return (
    <div className="px-4 pt-24 pb-32 md:pb-12">
      <h1 className="text-3xl font-semibold text-[var(--color-black)] mb-1">Add Ingredients</h1>
      <p className="text-sm text-gray-500 mb-6">Review items scanned from your receipt</p>

      {loading && (
        <div className="flex flex-col items-center justify-center gap-3 py-16 text-gray-400">
          <Loader2 size={32} className="animate-spin" />
          <p className="text-sm font-medium">Scanning your receipt...</p>
        </div>
      )}

      {error && (
        <div className="p-4 bg-red-50 border border-red-200 rounded-xl text-sm text-red-600 font-medium mb-4">
          {error}
        </div>
      )}

      {!loading && (
        <div className="flex flex-col gap-4">
          {ingredients.map((item, index) => (
            <IngredientCard key={item._id} item={item} index={index} onUpdate={handleUpdate} onDelete={handleDelete} />
          ))}

          <AddIngredientCard onAdd={handleAddNew} />

          {unrecognised.length > 0 && (
            <>
              <div className="flex items-center gap-2 mt-2">
                <AlertTriangle size={14} className="text-amber-500" />
                <p className="text-xs font-bold text-amber-600 uppercase tracking-wide">
                  Could not recognise ({unrecognised.length})
                </p>
              </div>
              {unrecognised.map((u) => (
                <UnrecognisedCard key={u._id} item={u} onToggle={handleToggleUnrecognised} onDraftChange={handleDraftChange} />
              ))}
            </>
          )}
        </div>
      )}

      <button
        type="button"
        onClick={handleSubmit}
        disabled={submitting}
        className="mt-8 w-full flex items-center justify-center gap-2 py-4 bg-[var(--color-blue)] text-[var(--color-black)] rounded-xl font-black text-lg hover:shadow-lg hover:shadow-[var(--color-blue)]/30 active:scale-[0.98] transition-all disabled:opacity-60"
      >
        {submitting ? <Loader2 size={20} className="animate-spin" /> : <ChevronRight size={20} />}
        {submitting ? 'Saving...' : 'Add to Inventory'}
      </button>
    </div>
  );
};

export default PreAddIngredients;
