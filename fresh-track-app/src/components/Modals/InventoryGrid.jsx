import { motion, AnimatePresence } from "framer-motion";
import InventoryItem from "../Fridge/InventoryItem"; // Adjust path as needed

const InventoryGrid = ({ isOpen, onClose, categoryTitle, items = [] }) => {
  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          // Dark blurred overlay
          className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-sm"
          onClick={onClose} // Clicking outside the modal closes it
        >
          <motion.div
            initial={{ scale: 0.9, opacity: 0, y: 20 }}
            animate={{ scale: 1, opacity: 1, y: 0 }}
            exit={{ scale: 0.9, opacity: 0, y: 20 }}
            onClick={(e) => e.stopPropagation()} // Prevent closing when clicking inside
            // ADDED: max-h-[85vh], flex, flex-col, and overflow-hidden
            className="w-full max-w-md max-h-[85vh] flex flex-col bg-white/95 backdrop-blur-md p-6 rounded-[2rem] shadow-2xl border border-white overflow-hidden"
          >
            {/* Modal Header */}
            {/* ADDED: shrink-0 so the header never squishes when the grid gets full */}
            <div className="shrink-0 flex justify-between items-center mb-6 px-2">
              <h2 className="text-lg font-black text-slate-700 tracking-widest uppercase">{categoryTitle}</h2>
              <button onClick={onClose} className="w-8 h-8 flex items-center justify-center bg-slate-100 text-slate-500 rounded-full hover:bg-slate-200 hover:text-slate-700 transition-colors">
                ✕
              </button>
            </div>

            {/* Scrollable Container */}
            {/* ADDED: flex-1 and overflow-y-auto to handle the scrolling */}
            <div className="flex-1 overflow-y-auto pr-2 pb-4 -mr-2">
              {/* 3x3 Grid Layout */}
              <div className="grid grid-cols-3 gap-3">{items.length > 0 ? items.map((item, index) => <InventoryItem key={item.id || index} item={item} />) : <div className="col-span-3 text-center py-8 text-slate-400 text-sm font-medium">This shelf is empty.</div>}</div>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default InventoryGrid;
