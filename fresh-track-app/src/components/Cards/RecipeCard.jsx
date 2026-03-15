import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Clock, Users, ChevronDown } from 'lucide-react';
import { apiAxios } from '../../api';

function parseAmountUsed(amount) {
  if (amount == null) return 1;
  const m = String(amount).match(/^(\d+(?:\.\d+)?)/);
  const num = m ? parseFloat(m[1]) : 1;
  return Math.max(1, Math.ceil(num));
}

export default function RecipeCard({ recipe, inventory = [], onStartCookingSuccess, onShowToast }) {
  const [isExpanded, setIsExpanded] = useState(false);

  return (
    <motion.div
      layout
      className="relative bg-white rounded-3xl border border-gray-100 shadow-sm overflow-hidden mb-6"
    >
      {recipe.ingredients?.some((i) => !i.inInventory) && (
        <div className="absolute top-4 right-0 z-10 bg-amber-400 px-3 py-1.5 rounded-l-full flex items-center gap-2 shadow">
          <img src="/shopping cart.png" alt="Items to buy" className="w-6 h-6 object-contain" />
          <span className="text-[11px] font-bold text-white">{recipe.ingredients.filter((i) => !i.inInventory).length} missing</span>
        </div>
      )}
      {/* ALWAYS VISIBLE: Image & Summary Header */}
      <div 
        onClick={() => setIsExpanded(!isExpanded)}
        className="cursor-pointer group"
      >
        {/* --- IMAGE SECTION --- */}
        <div className="relative h-48 w-full overflow-hidden bg-gray-100">
          <img 
            src={recipe.image} 
            alt={recipe.title} 
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500 ease-out"
          />
          <div className="absolute inset-0 bg-gradient-to-b from-black/10 to-transparent pointer-events-none" />
        </div>

        {/* --- TEXT SECTION --- */}
        {/* This wrapper gives an even padding of 24px (p-6) around all the text */}
        <div className="p-4 hover:bg-gray-50 transition-colors">
          
          {/* HEADER ROW: Relative container allows perfect centering while button floats right */}
          <div className="relative flex justify-center items-center mb-4 min-h-[32px]">
            <motion.h3 
              layout="position" 
              className="text-xl font-bold text-gray-900 text-center px-12 leading-tight"
            >
              {recipe.title}
            </motion.h3>
            
            <motion.button 
              layout
              animate={{ rotate: isExpanded ? 180 : 0 }}
              className="absolute right-0 top-0 p-1.5 bg-white border border-gray-600 text-gray-900 rounded-full shrink-0"
            >
              <ChevronDown size={20} strokeWidth={2} />
            </motion.button>
          </div>

          {/* DESCRIPTION: Centered */}
          <motion.p 
            layout="position" 
            className="text-[15px] text-gray-800 text-center mb-6 leading-relaxed"
          >
            {recipe.description}
          </motion.p>

          {/* INFO TAGS: Left aligned matching your image */}
          <motion.div 
            layout="position" 
            className="flex items-center gap-4 text-[13px] font-bold text-gray-500"
          >
            <div className="flex items-center gap-1.5">
              <Clock size={16} /> {recipe.time}
            </div>
            <div className="flex items-center gap-1.5">
              <Users size={16} /> {recipe.servings} servings
            </div>
            <div className="uppercase tracking-wider text-gray-500 ml-1">
              {recipe.difficulty}
            </div>
          </motion.div>
        </div>
      </div>

      {/* EXPANDABLE SECTION: Ingredients & Instructions */}
      <AnimatePresence>
        {isExpanded && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            // px-6 matches the p-6 of the top wrapper so the text aligns perfectly
            className="px-6 pb-6 border-t border-gray-100"
          >
            <div className="pt-5 text-left">
              <h4 className="font-bold text-gray-900 mb-1">Ingredients</h4>
              <ul className="mb-4" style={{textAlign: "left"}}>
                {recipe.ingredients.map((item, idx) => (
                  <li key={idx} className="text-sm flex items-start">
                    <span className="text-gray-700">
                      <strong>{item.amount}</strong> {item.name}
                      {item.inInventory && (
                        <span className="text-[#187A4F] ml-1 font-medium">(in inventory)</span>
                      )}
                    </span>
                  </li>
                ))}
              </ul>

              <h4 className="font-bold text-gray-900 mb-1">Instructions</h4>
              <ol className="" style={{textAlign: "left"}}>
                {recipe.instructions.map((step, idx) => (
                  <li key={idx} className="text-sm flex items-start gap-3">
                    <span className="text-gray-700 leading-relaxed">{idx + 1}. {step}</span>
                  </li>
                ))}
              </ol>

              <button
                type="button"
                onClick={async (e) => {
                  e.stopPropagation();
                  const inInventory = recipe.ingredients.filter((i) => i.inInventory);
                  if (!inInventory.length) {
                    onShowToast?.('No ingredients in inventory for this recipe.');
                    return;
                  }
                  const invList = inventory || [];
                  const invById = Object.fromEntries(
                    invList.filter((i) => i._id).map((i) => [String(i._id), i])
                  );
                  const invByName = Object.fromEntries(
                    invList.map((i) => [i.name?.toLowerCase()?.trim(), i])
                  );

                  const updates = [];
                  for (const ing of inInventory) {
                    const invItem =
                      ing.item_id ? invById[String(ing.item_id)] : invByName[ing.name?.toLowerCase()?.trim()];
                    if (!invItem?._id) continue;
                    const toConsume = parseAmountUsed(ing.amount);
                    updates.push({ item_id: invItem._id, qty: toConsume });
                  }
                  if (!updates.length) {
                    onShowToast?.('No matching items in your inventory. Add ingredients first.');
                    return;
                  }
                  try {
                    const res = await apiAxios.patch('/inventory/batch', { updates });
                    const karma = res?.karma_delta ?? 30;
                    onStartCookingSuccess?.(karma);
                  } catch (err) {
                    console.error('Batch update failed', err);
                    onShowToast?.('Failed to consume items. Please try again.');
                  }
                }}
                className="w-full mt-6 py-3 border-2 border-[#187A4F] text-[#187A4F] rounded-xl font-bold hover:bg-[#E8F3ED] transition"
                style={{ marginTop: '15px' }}
              >
                Start Cooking
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}