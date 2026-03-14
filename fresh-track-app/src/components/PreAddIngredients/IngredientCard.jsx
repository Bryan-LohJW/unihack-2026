import React, { useState, useRef } from 'react';
import { Package, Calendar, ChevronDown, ChevronUp, Trash2 } from 'lucide-react';
import IngredientForm from './IngredientForm';
import { daysToDateString } from './ingredientUtils';

const IngredientCard = ({ item, index, onUpdate, onDelete }) => {
  const [expanded, setExpanded] = useState(false);
  const [confirmDelete, setConfirmDelete] = useState(false);
  const confirmTimer = useRef(null);
  const iconSrc = `/icons/${item.image_url}`;

  const handleChange = (field, value) => {
    onUpdate(index, { ...item, [field]: value });
  };

  const handleDeleteClick = () => {
    if (confirmDelete) {
      clearTimeout(confirmTimer.current);
      onDelete(item._id);
    } else {
      setConfirmDelete(true);
      confirmTimer.current = setTimeout(() => setConfirmDelete(false), 3000);
    }
  };

  return (
    <div className="bg-[var(--color-white)] border border-gray-100 rounded-2xl shadow-lg overflow-hidden">
      <div className="flex items-center gap-4 p-4 cursor-pointer" onClick={() => setExpanded((prev) => !prev)}>
        <div className="w-14 h-14 flex items-center justify-center rounded-xl bg-[var(--color-blue)] shrink-0">
          <img
            src={iconSrc}
            alt={item.name}
            className="w-9 h-9 object-contain"
            onError={(e) => { e.currentTarget.src = '/icons/unknown.png'; }}
          />
        </div>

        <div className="flex-1 min-w-0">
          <p className="font-semibold text-[var(--color-black)] truncate">{item.name || 'New Ingredient'}</p>
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

        <div className="flex items-center gap-2 shrink-0">
          <button
            type="button"
            onClick={(e) => { e.stopPropagation(); handleDeleteClick(); }}
            className={`px-2.5 py-1.5 rounded-lg text-xs font-bold transition-all duration-200 ${
              confirmDelete
                ? 'bg-red-500 text-white scale-105'
                : 'bg-red-100 text-red-400 hover:bg-red-200 hover:text-red-500'
            }`}
          >
            {confirmDelete ? 'Sure?' : <Trash2 size={14} />}
          </button>
          <div className="text-gray-400">
            {expanded ? <ChevronUp size={18} /> : <ChevronDown size={18} />}
          </div>
        </div>
      </div>

      <div className={`grid transition-all duration-300 ease-in-out ${expanded ? 'grid-rows-[1fr]' : 'grid-rows-[0fr]'}`}>
        <div className="overflow-hidden">
          <div className="px-4 pb-4 border-t border-gray-100 pt-3">
            <IngredientForm values={item} onChange={handleChange} />
          </div>
        </div>
      </div>
    </div>
  );
};

export default IngredientCard;
