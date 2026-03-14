import { motion } from "framer-motion";

const InventoryItem = ({ item, onClick }) => {
  // <-- Added onClick here
  return (
    <motion.div
      whileHover={{ scale: 1.05 }}
      whileTap={{ scale: 0.95 }}
      onClick={() => onClick(item)} // <-- Trigger it here with the specific item
      className="flex flex-col items-center p-3 bg-white/80 rounded-2xl shadow-sm border border-slate-100 cursor-pointer"
    >
      {/* Item Image */}
      <div className="w-16 h-16 mb-2 flex items-center justify-center">
        <img src={`/icons/${item.image_url}`} alt={item.name} className="max-w-full max-h-full object-contain drop-shadow-sm" />
      </div>

      {/* Item Name */}
      <span className="text-[12px] font-bold text-slate-700 text-center leading-tight mb-1">{item.name}</span>

      {/* Expiry Badge */}
      {item.daysUntilExpiry !== undefined && <span className={`text-[10px] font-bold px-2 py-0.5 rounded-md ${item.daysUntilExpiry <= 3 ? "bg-orange-100 text-orange-600" : "bg-emerald-100 text-emerald-600"}`}>{item.daysUntilExpiry <= 3 ? `${item.daysUntilExpiry}d left` : "Fresh"}</span>}
    </motion.div>
  );
};

export default InventoryItem;
