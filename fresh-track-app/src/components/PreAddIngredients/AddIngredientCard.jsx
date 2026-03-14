import React from 'react';
import { Plus } from 'lucide-react';

const AddIngredientCard = ({ onAdd }) => (
  <button
    type="button"
    onClick={onAdd}
    className="w-full flex items-center gap-4 p-4 bg-gray-50 border-2 border-dashed border-gray-200 rounded-2xl text-gray-400 hover:border-gray-300 hover:text-gray-500 hover:bg-gray-100 transition-all duration-200"
  >
    <div className="w-14 h-14 flex items-center justify-center rounded-xl bg-gray-100 shrink-0">
      <Plus size={24} />
    </div>
    <span className="font-semibold text-sm">Add ingredient manually</span>
  </button>
);

export default AddIngredientCard;
