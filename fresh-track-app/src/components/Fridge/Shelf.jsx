import { motion } from "framer-motion";

const Shelf = ({
  title,
  index,
  isOpen,
  bg_img,
  total,
  expiry,
  onShelfClick,
}) => {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={isOpen ? { opacity: 1, y: 0 } : { opacity: 0, y: 20 }}
      transition={{
        delay: 0.1 * index,
        duration: 0.3,
      }}
      whileHover={{ scale: 1.02 }}
      whileTap={{ scale: 0.98, transition: { duration: 0.15 } }}
      style={{
        transformOrigin: "center",
        backgroundImage: bg_img ? `url(${bg_img})` : undefined,
        backgroundSize: "cover",
        backgroundPosition: "center",
        borderRadius: "12px",
      }}
      onTap={() => setTimeout(onShelfClick, 180)}
      className="w-full flex-1 flex flex-col relative cursor-pointer overflow-hidden border-2 border-white/40"
    >
      {/* Subtle dark overlay for readability */}
      <div className="absolute inset-0 bg-black/20 z-0" />

      {/* SHELF TITLE */}
      <div className="relative z-10 pt-2 text-center">
        <span className="text-[10px] text-white font-bold tracking-[0.2em] uppercase drop-shadow">
          {title}
        </span>
      </div>

      {/* SHELF BODY — fills remaining space */}
      <div className="relative flex-1" />

      {/* STAT BOXES — pinned to bottom */}
      <div className="relative z-10 flex justify-between px-3 pb-2">
        <div className="flex flex-col items-center bg-white/90 backdrop-blur-md px-3 py-1.5 rounded-xl shadow-md border-2 border-slate-200 min-w-[46px]">
          <span className="text-[10px] font-bold text-slate-400 uppercase leading-none mb-0.5">
            Total
          </span>
          <span className="text-[15px] font-black text-slate-700 leading-none">
            {total}
          </span>
        </div>

        <div className="flex flex-col items-center bg-white/90 backdrop-blur-md px-3 py-1.5 rounded-xl shadow-md border-2 border-slate-200 min-w-[46px]">
          <span className="text-[10px] font-bold text-slate-400 uppercase leading-none mb-0.5">
            Expiring
          </span>
          <span
            className={`text-[15px] font-black leading-none ${expiry > 0 ? "text-orange-500" : "text-slate-700"}`}
          >
            {expiry}
          </span>
        </div>
      </div>
    </motion.div>
  );
};

export default Shelf;
