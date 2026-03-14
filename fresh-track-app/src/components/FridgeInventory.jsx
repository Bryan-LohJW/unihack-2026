import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import InventoryItem from "./Fridge/InventoryItem";

const FridgeInventory = () => {
  const [isOpen, setIsOpen] = useState(true);

  // Mock data based on your image
  const items = [
    { name: "Cheese", icon: "🧀", health: 80, quantity: 1 },
    { name: "Burger", icon: "🍔", health: 95, quantity: 1 },
    { name: "Wrench", icon: "🔧", health: 100, quantity: 1 },
    { name: "Medkit", icon: "🎒", health: 100, quantity: 5 },
    { name: "Empty", icon: "", health: 0, quantity: 0 }, // Blacked out slot
    { name: "Glasses", icon: "👓", health: 100, quantity: 1 },
    { name: "Ghost", icon: "👻", health: 40, quantity: 1 },
    { name: "Potion", icon: "🧪", health: 100, quantity: 2 },
    { name: "Beer", icon: "🍺", health: 100, quantity: 1 },
  ];

  return (
    <div className="relative w-full aspect-[3/5] shadow-2xl cursor-pointer">
      {/* INNER CONTENT: 3-Column Grid */}
      <div className="inset-0 p-4 pt-12 custom-scrollbar">
        <div className="grid grid-cols-3 gap-2">
          {items.map((item, index) => (
            <InventoryItem key={index} item={item} />
          ))}
          {/* Adding extra empty slots to show scrollability */}
          {[...Array(12)].map((_, i) => (
            <div key={i} className="aspect-square bg-[#151515] border-2 border-[#222] rounded-sm" />
          ))}
        </div>
      </div>

      {/* FRIDGE DOORS */}
      <div className="absolute inset-0 flex pointer-events-none" style={{ perspective: "1000px" }}>
        {/* Left Door */}
        <motion.div initial={false} animate={{ rotateY: isOpen ? -110 : 0 }} transition={{ duration: 0.6, ease: "easeInOut" }} className="w-1/2 h-full bg-[#d1d5db] border-r-2 border-gray-400 origin-left shadow-xl flex flex-col justify-center items-end pr-4 pointer-events-auto">
          <div className="w-1 h-24 bg-gray-400 rounded-full" /> {/* Handle Shadow */}
        </motion.div>

        {/* Right Door */}
        <motion.div initial={false} animate={{ rotateY: isOpen ? 110 : 0 }} transition={{ duration: 0.6, ease: "easeInOut" }} className="w-1/2 h-full bg-[#e5e7eb] border-l-2 border-gray-300 origin-right shadow-xl flex flex-col justify-center items-start pl-4 pointer-events-auto">
          <div className="w-2 h-24 bg-gray-300 rounded-full" /> {/* Handle */}
        </motion.div>
      </div>
    </div>
  );
};

export default FridgeInventory;
