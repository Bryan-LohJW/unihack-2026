import React from "react";
import { Calendar, Package, Activity, Trash2 } from "lucide-react";

const InventoryItem = ({ item, onRemove }) => {
  const { name, health, expiryDate, quantity } = item;

  // Logic for health bar color
  const getHealthColor = (h) => {
    if (h > 70) return "bg-green-500";
    if (h > 30) return "bg-yellow-500";
    return "bg-red-500";
  };

  // Logic for expiry urgency
  const isExpired = new Date(expiryDate) < new Date();

  return (
    <div className="group flex items-center justify-between p-4 mb-3 bg-white border border-gray-100 rounded-2xl shadow-sm hover:shadow-md transition-all">
      <div className="flex items-center gap-4">
        {/* Placeholder for Item Image or Icon */}
        <div className="w-12 h-12 flex items-center justify-center rounded-xl bg-blue-50 text-blue-600 font-bold">
          {name.charAt(0).toUpperCase()}
        </div>

        <div className="flex flex-col">
          <h3 className="text-lg font-semibold text-gray-800">{name}</h3>
          <div className="flex items-center gap-3 mt-1">
            {/* Quantity Badge */}
            <span className="flex items-center gap-1 text-xs font-medium text-gray-500">
              <Package size={14} /> x{quantity}
            </span>
            {/* Expiry Date */}
            <span className={`flex items-center gap-1 text-xs font-medium ${isExpired ? 'text-red-500' : 'text-gray-500'}`}>
              <Calendar size={14} /> {expiryDate}
            </span>
          </div>
        </div>
      </div>

      <div className="flex items-center gap-6">
        {/* Health/Freshness Indicator */}
        <div className="hidden md:flex flex-col items-end gap-1">
          <span className="text-[10px] uppercase tracking-wider font-bold text-gray-400 flex items-center gap-1">
            <Activity size={12} /> Health
          </span>
          <div className="w-24 h-2 bg-gray-100 rounded-full overflow-hidden">
            <div 
              className={`h-full ${getHealthColor(health)} transition-all duration-500`} 
              style={{ width: `${health}%` }}
            />
          </div>
        </div>

        {/* Actions */}
        <button 
          onClick={onRemove}
          className="p-2 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors"
        >
          <Trash2 size={18} />
        </button>
      </div>
    </div>
  );
};

export default InventoryItem;