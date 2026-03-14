import { motion } from "framer-motion";

const Shelf = ({ title, index, isOpen, display_img, total, expiry, onShelfClick }) => {
  return (
    <motion.div 
      initial={{ opacity: 0, y: 20 }} 
      animate={isOpen ? { opacity: 1, y: 0 } : { opacity: 0, y: 20 }} 
      transition={{ delay: 0.1 * index, duration: 0.5 }} 
      onClick={onShelfClick} 
      className="w-full px-6 flex flex-col items-center relative mb-12 cursor-pointer"
    >
      {/* --- STAT BOXES --- */}
      <div className="absolute top-0 w-full flex justify-between px-8 z-30 -translate-y-4">
        <div className="flex flex-col items-center bg-white/90 backdrop-blur-md px-3 py-2 rounded-xl shadow-sm border border-slate-100 min-w-[46px]">
          <span className="text-[11px] font-bold text-slate-400 uppercase leading-none mb-1">Total</span>
          <span className="text-[17px] font-black text-slate-700 leading-none">{total}</span>
        </div>

        <div className="flex flex-col items-center bg-white/90 backdrop-blur-md px-3 py-2 rounded-xl shadow-sm border border-slate-100 min-w-[46px]">
          <span className="text-[11px] font-bold text-slate-400 uppercase leading-none mb-1">Soon</span>
          <span className={`text-[17px] font-black leading-none ${expiry > 0 ? "text-orange-500" : "text-slate-700"}`}>{expiry}</span>
        </div>
      </div>

      {/* SHELF TITLE */}
      <div className="absolute -top-21 w-full text-center z-50">
        <span className="text-[10px] text-slate-400 font-bold tracking-[0.2em] uppercase">{title}</span>
      </div>

      {/* SHELF BODY */}
      <div className="relative w-full h-12 flex items-end justify-center">
        <div className="absolute bottom-0 flex gap-2 z-20 translate-y-2">
          <motion.img
            src={display_img}
            initial={{ scale: 0 }}
            animate={isOpen ? { scale: 1.1 } : { scale: 0 }}
            className="w-40 h-50 object-contain object-bottom drop-shadow-md"
          />
        </div>

        <div
          className="absolute inset-x-0 bottom-0 h-14 bg-cyan-100/25 backdrop-blur-sm border-b-2 border-cyan-200/40 rounded-b-xl shadow-md z-10"
          style={{
            transform: "perspective(400px) rotateX(40deg)",
            transformOrigin: "top",
          }}
        />
      </div>
    </motion.div>
  );
};

export default Shelf;