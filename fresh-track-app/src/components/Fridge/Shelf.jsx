import { motion } from "framer-motion";

const Shelf = ({ title, index, isOpen }) => {
  return (
    <motion.div 
      initial={{ opacity: 0, scale: 0.9 }}
      animate={isOpen ? { opacity: 1, scale: 1 } : { opacity: 0, scale: 0.9 }}
      transition={{ delay: 0.4 + (index * 0.1) }}
      className="w-full px-4 flex flex-col items-center"
    >
      <span className="text-[8px] text-slate-400 uppercase font-bold mb-1">{title}</span>
      
      <div className="relative w-full h-12">
        {/* Blue Transparent Glass Layer */}
        <div 
          className="absolute inset-0 bg-cyan-400/20 backdrop-blur-sm border-b-2 border-cyan-300/50 rounded-b-lg shadow-[0_4px_12px_rgba(0,180,255,0.15)]"
          style={{
            transform: "perspective(400px) rotateX(40deg)",
            transformOrigin: "top"
          }}
        />
        {/* Glass Reflection */}
        <div 
          className="absolute inset-0 bg-gradient-to-t from-white/20 to-transparent rounded-b-lg pointer-events-none"
          style={{ transform: "perspective(400px) rotateX(40deg)", transformOrigin: "top" }}
        />
      </div>
    </motion.div>
  );
};

export default Shelf;