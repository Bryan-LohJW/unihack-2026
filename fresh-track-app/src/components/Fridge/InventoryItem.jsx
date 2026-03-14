import { motion } from "framer-motion";

const InventoryItem = ({ item, onClick }) => {
  return (
    <motion.div
      // --- 1. Added layoutId to the main card wrapper ---
      layoutId={`card-${item._id}`}
      whileHover={{ scale: 1.05 }}
      whileTap={{ scale: 0.95 }}
      onClick={() => onClick(item)}
      className="flex flex-col items-center p-3 bg-white/80 rounded-2xl shadow-sm border border-slate-100 cursor-pointer"
    >
      <div className="w-20 h-20 mb-2 flex items-center justify-center">
        {/* --- 2. Changed to motion.img and added layoutId --- */}
        <motion.img layoutId={`image-${item._id}`} src={`/icons/${item.image_url}`} alt={item.name} className="max-w-full max-h-full object-contain drop-shadow-sm" />
      </div>

      <span className="text-[11px] font-bold text-slate-700 text-center leading-tight mb-1">{item.name}</span>

      {item.expiry_days !== undefined && <span className={`text-[10px] font-bold px-2 py-0.5 rounded-md ${item.expiry_days <= 3 ? "bg-orange-100 text-orange-600" : "bg-emerald-100 text-emerald-600"}`}>{item.expiry_days <= 3 ? `${item.expiry_days}d left` : "Fresh"}</span>}
    </motion.div>
  );
};

export default InventoryItem;
