import React from "react";
import { List, Search, DollarSign, ChefHat, Plus } from "lucide-react";

const BottomNav = ({ onAddClick, onChange }) => {
  const navItems = [
    { id: "fridge", icon: <List size={20} />, label: "Items" },
    { id: "search", icon: <Search size={20} />, label: "Search" },
    { id: "waste", icon: <DollarSign size={20} />, label: "Savings" },
    { id: "recipes", icon: <ChefHat size={20} />, label: "Recipes" },
  ];

  return (
    <div className="fixed bottom-0 inset-x-0 z-50">
      {/* Centered Floating Action Button */}

      {/* Bottom Navigation Bar */}
      <div className="bg-[var(--color-white)] border-[var(--color-brown)]/20 shadow-lg">
        <div className="grid grid-cols-4 h-16">
          {navItems.map((item) => (
            <button key={item.id} onClick={() => onChange(item.id)} className="flex flex-col items-center justify-center gap-1 text-[var(--color-brown)] hover:text-[var(--color-black)] hover:bg-[var(--color-blue)]/10 transition-colors" style={{ border: "none" }}>
              {item.icon}
              <span className="text-xs font-medium">{item.label}</span>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
};

export default BottomNav;
