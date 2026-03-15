import { motion } from "framer-motion";

// Parse a UTC-based date string into a local-midnight Date to avoid timezone off-by-one
const toLocalDate = (dateStr) => {
  const d = new Date(dateStr);
  return new Date(d.getUTCFullYear(), d.getUTCMonth(), d.getUTCDate());
};

const calcHealth = (item) => {
  if (!item.expiry_date) return 50;
  const expDate = toLocalDate(item.expiry_date);
  const now = new Date();
  if (item.added_at) {
    const addedDate = toLocalDate(item.added_at);
    const totalLifespan = expDate.getTime() - addedDate.getTime();
    const timeRemaining = expDate.getTime() - now.getTime();
    if (totalLifespan > 0) {
      return Math.max(0, Math.min(100, Math.round((timeRemaining / totalLifespan) * 100)));
    }
    return timeRemaining > 0 ? 100 : 0;
  }
  return 50;
};

const getDaysRemaining = (item) => {
  if (!item.expiry_date) return null;
  const now = new Date();
  now.setHours(0, 0, 0, 0);
  const expDate = toLocalDate(item.expiry_date);
  return Math.ceil((expDate - now) / (1000 * 60 * 60 * 24));
};

const InventoryItem = ({ item, onClick }) => {
  const health = calcHealth(item);
  const daysRemaining = getDaysRemaining(item);
  const isExpired = daysRemaining !== null && daysRemaining < 0;
  const isExpiringSoon = daysRemaining !== null && daysRemaining >= 0 && daysRemaining <= 3;

  return (
    <motion.div
      layoutId={`card-${item._id}`}
      whileHover={{ scale: 1.05 }}
      whileTap={{ scale: 0.95 }}
      onClick={() => onClick(item)}
      className={`relative flex flex-col items-center p-3 bg-white/80 rounded-2xl shadow-sm border cursor-pointer ${isExpired ? "border-slate-100" : isExpiringSoon ? "border-red-400 border-2" : "border-slate-100"}`}
    >
      {isExpired && (
        <>
          <div className="absolute inset-0 bg-slate-500/40 rounded-2xl z-10 pointer-events-none" />
          <div className="absolute bottom-2 left-1/2 -translate-x-1/2 z-20 px-2 py-0.5 bg-red-600 rounded-full border border-red-400 whitespace-nowrap">
            <span className="text-[9px] font-bold text-white uppercase tracking-wide">Expired</span>
          </div>
        </>
      )}
      <span className="text-[11px] font-bold text-slate-700 text-center leading-tight mb-2 h-8 flex items-start justify-center line-clamp-2 overflow-hidden">{item.name}</span>

      <div className="w-20 h-20 mb-3 flex items-center justify-center">
        <motion.img layoutId={`image-${item._id}`} src={`/icons/${item.image_url}`} alt={item.name} className="max-w-full max-h-full object-contain drop-shadow-sm" />
      </div>

      <span className="text-[10px] text-slate-500 font-medium mb-2">{item.qty} {item.unit}</span>

      <div className="relative w-full h-2 bg-slate-200 rounded-full overflow-visible">
        <div
          className="h-full bg-linear-to-r from-rose-400 via-amber-400 to-emerald-400 transition-all duration-700 rounded-full"
          style={{ width: `${health}%` }}
        />
        {isExpiringSoon && (
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="px-1.5 py-px bg-amber-400 border border-amber-500 rounded-full shadow-sm">
              <span className="text-[7px] font-bold text-white uppercase tracking-wide whitespace-nowrap">Expiring</span>
            </div>
          </div>
        )}
      </div>
    </motion.div>
  );
};

export default InventoryItem;
