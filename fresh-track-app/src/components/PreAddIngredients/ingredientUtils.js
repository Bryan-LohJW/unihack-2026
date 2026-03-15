let _idCounter = 0;
export const makeId = () => `ing_${Date.now()}_${++_idCounter}`;

export const withId = (item) => ({ ...item, _id: makeId() });

export const SECTIONS = ['fridge', 'freezer', 'pantry'];

export const baseInputClasses =
  'w-full px-3 py-2 rounded-lg border border-gray-200 bg-white text-sm text-[var(--color-black)] font-medium focus:outline-none focus:ring-2 focus:ring-[var(--color-blue)] focus:border-blue-400 transition';

export const daysToDateString = (days) => {
  const d = new Date();
  d.setDate(d.getDate() + days);
  return d.toISOString().split('T')[0];
};

export const dateStringToDays = (dateStr) => {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const target = new Date(dateStr);
  const diff = Math.round((target - today) / (1000 * 60 * 60 * 24));
  return Math.max(1, diff);
};

export const NEW_INGREDIENT_TEMPLATE = {
  calories: 0,
  expiry_days: 7,
  image_url: 'unknown.png',
  name: '',
  qty: 1,
  unit: 'g',
  section: 'fridge',
};

export const INITIAL_INGREDIENTS = [
  { calories: 0, expiry_days: 7, image_url: 'tomato.png',   name: 'Tomato',           qty: 800, section: 'fridge' },
  { calories: 0, expiry_days: 7, image_url: 'eggs.png',     name: 'Barn Eggs',        qty: 700, section: 'fridge' },
  { calories: 0, expiry_days: 7, image_url: 'mushroom.png', name: 'Sliced Mushrooms', qty: 500, section: 'fridge' },
  { calories: 0, expiry_days: 7, image_url: 'rice.png',     name: 'Organic Quinoa',   qty: 500, section: 'fridge' },
  { calories: 0, expiry_days: 7, image_url: 'milk.png',     name: 'Full Cream Milk',  qty: 2,   section: 'fridge' },
  { calories: 0, expiry_days: 7, image_url: 'chicken.png',  name: 'Chicken Breast',   qty: 1,   section: 'fridge' },
  { calories: 0, expiry_days: 7, image_url: 'unknown.png',  name: 'Sweet Corn',       qty: 500, section: 'fridge' },
  { calories: 0, expiry_days: 7, image_url: 'unknown.png',  name: 'Peaches',          qty: 1,   section: 'fridge' },
].map(withId);

export const INITIAL_UNRECOGNISED = [
  { raw_text: 'WLTFLWR SEEDS 250G' },
  { raw_text: 'ORG CHKN STK 1KG' },
  { raw_text: 'MISC GROCERY ITEM' },
].map((u) => ({ ...u, _id: makeId(), included: false, draft: { ...NEW_INGREDIENT_TEMPLATE } }));
