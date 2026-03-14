import React from 'react';
import { AlertTriangle } from 'lucide-react';
import IngredientForm from './IngredientForm';

const UnrecognisedCard = ({ item, onToggle, onDraftChange }) => {
  const handleChange = (field, value) => {
    onDraftChange(item._id, field, value);
  };

  return (
    <div className={`border-2 rounded-2xl overflow-hidden transition-all duration-300 ${
      item.included ? 'border-amber-300 bg-amber-50' : 'border-dashed border-amber-200 bg-amber-50/40'
    }`}>
      <div className="flex items-center gap-4 p-4">
        <div className="w-14 h-14 flex items-center justify-center rounded-xl bg-amber-100 shrink-0">
          <AlertTriangle size={22} className="text-amber-500" />
        </div>

        <div className="flex-1 min-w-0">
          <p className="text-xs font-bold text-amber-600 uppercase tracking-wide mb-0.5">Unrecognised</p>
          <p className="font-mono text-sm text-gray-700 truncate">{item.raw_text}</p>
        </div>

        <button
          type="button"
          onClick={() => onToggle(item._id)}
          className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all duration-200 shrink-0 ${
            item.included
              ? 'bg-amber-400 text-white'
              : 'bg-white border border-amber-300 text-amber-600 hover:bg-amber-100'
          }`}
        >
          {item.included ? 'Included' : 'Include'}
        </button>
      </div>

      <div className={`grid transition-all duration-300 ease-in-out ${item.included ? 'grid-rows-[1fr]' : 'grid-rows-[0fr]'}`}>
        <div className="overflow-hidden">
          <div className="px-4 pb-4 border-t border-amber-200 pt-3">
            <IngredientForm
              values={item.draft}
              onChange={handleChange}
              namePlaceholder="e.g. Sunflower Seeds"
            />
          </div>
        </div>
      </div>
    </div>
  );
};

export default UnrecognisedCard;
