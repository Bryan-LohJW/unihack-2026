import React from 'react';
import { SECTIONS, baseInputClasses, daysToDateString, dateStringToDays } from './ingredientUtils';

const IngredientForm = ({ values, onChange, namePlaceholder = '' }) => (
  <div className="grid grid-cols-2 gap-3">
    <div className="col-span-2">
      <label className="text-xs font-bold text-gray-500 mb-1 block">Name</label>
      <input
        type="text"
        placeholder={namePlaceholder}
        value={values.name}
        onChange={(e) => onChange('name', e.target.value)}
        className={baseInputClasses}
      />
    </div>

    <div>
      <label className="text-xs font-bold text-gray-500 mb-1 block">Quantity (g)</label>
      <input
        type="number"
        min="0"
        value={values.qty}
        onChange={(e) => onChange('qty', Number(e.target.value))}
        className={baseInputClasses}
      />
    </div>

    <div>
      <label className="text-xs font-bold text-gray-500 mb-1 block">Expiry Date</label>
      <input
        type="date"
        value={daysToDateString(values.expiry_days)}
        min={daysToDateString(1)}
        onChange={(e) => onChange('expiry_days', dateStringToDays(e.target.value))}
        className={baseInputClasses}
      />
    </div>

    <div>
      <label className="text-xs font-bold text-gray-500 mb-1 block">Calories</label>
      <input
        type="number"
        min="0"
        value={values.calories}
        onChange={(e) => onChange('calories', Number(e.target.value))}
        className={baseInputClasses}
      />
    </div>

    <div>
      <label className="text-xs font-bold text-gray-500 mb-1 block">Section</label>
      <select
        value={values.section}
        onChange={(e) => onChange('section', e.target.value)}
        className={baseInputClasses}
      >
        {SECTIONS.map((s) => (
          <option key={s} value={s}>{s.charAt(0).toUpperCase() + s.slice(1)}</option>
        ))}
      </select>
    </div>
  </div>
);

export default IngredientForm;
