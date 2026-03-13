import React, { useState } from 'react';

const AddItemModal = ({ isOpen, onClose, onAddItem }) => {
  const [mode, setMode] = useState('manual');
  const [formData, setFormData] = useState({
    name: '',
    quantity: 1,
    expiry: '',
    category: 'fridge'
  });
  const [receiptFile, setReceiptFile] = useState(null);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (mode === 'manual') {
      onAddItem(formData);
    } else {
      // Handle receipt scanning - for now, just placeholder
      alert('Receipt scanning feature coming soon!');
    }
    onClose();
    setFormData({ name: '', quantity: 1, expiry: '', category: 'fridge' });
    setReceiptFile(null);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
      <div className="bg-[var(--color-white)] rounded-2xl p-6 w-full max-w-md mx-4">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-bold text-[var(--color-black)]">Add Item to Inventory</h2>
          <button onClick={onClose} className="text-[var(--color-brown)] text-2xl">&times;</button>
        </div>

        <div className="flex gap-2 mb-4">
          <button
            onClick={() => setMode('manual')}
            className={`flex-1 py-2 px-4 rounded-lg font-medium transition-all ${
              mode === 'manual'
                ? 'bg-[var(--color-blue)] text-[var(--color-black)]'
                : 'bg-[var(--color-white)] text-[var(--color-brown)] border border-[var(--color-brown)]'
            }`}
          >
            Manual Entry
          </button>
          <button
            onClick={() => setMode('scan')}
            className={`flex-1 py-2 px-4 rounded-lg font-medium transition-all ${
              mode === 'scan'
                ? 'bg-[var(--color-blue)] text-[var(--color-black)]'
                : 'bg-[var(--color-white)] text-[var(--color-brown)] border border-[var(--color-brown)]'
            }`}
          >
            Scan Receipt
          </button>
        </div>

        <form onSubmit={handleSubmit}>
          {mode === 'manual' ? (
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-[var(--color-black)] mb-1">Item Name</label>
                <input
                  type="text"
                  name="name"
                  value={formData.name}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 border border-[var(--color-brown)] rounded-lg focus:outline-none focus:ring-2 focus:ring-[var(--color-blue)]"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-[var(--color-black)] mb-1">Quantity</label>
                <input
                  type="number"
                  name="quantity"
                  value={formData.quantity}
                  onChange={handleInputChange}
                  min="1"
                  className="w-full px-3 py-2 border border-[var(--color-brown)] rounded-lg focus:outline-none focus:ring-2 focus:ring-[var(--color-blue)]"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-[var(--color-black)] mb-1">Expiry Date</label>
                <input
                  type="date"
                  name="expiry"
                  value={formData.expiry}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 border border-[var(--color-brown)] rounded-lg focus:outline-none focus:ring-2 focus:ring-[var(--color-blue)]"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-[var(--color-black)] mb-1">Category</label>
                <select
                  name="category"
                  value={formData.category}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 border border-[var(--color-brown)] rounded-lg focus:outline-none focus:ring-2 focus:ring-[var(--color-blue)]"
                >
                  <option value="fridge">Fridge</option>
                  <option value="pantry">Pantry</option>
                </select>
              </div>
            </div>
          ) : (
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-[var(--color-black)] mb-1">Upload Receipt</label>
                <input
                  type="file"
                  accept="image/*"
                  onChange={(e) => setReceiptFile(e.target.files[0])}
                  className="w-full px-3 py-2 border border-[var(--color-brown)] rounded-lg focus:outline-none focus:ring-2 focus:ring-[var(--color-blue)]"
                />
              </div>
              <p className="text-sm text-[var(--color-brown)]">Receipt scanning will automatically extract item information.</p>
            </div>
          )}

          <div className="flex gap-3 mt-6">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 py-2 px-4 bg-[var(--color-white)] border border-[var(--color-brown)] text-[var(--color-brown)] rounded-lg hover:bg-[var(--color-blue)]/10 transition-all"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="flex-1 py-2 px-4 bg-gradient-to-br from-[var(--color-blue)] to-[var(--color-white)] border border-[var(--color-brown)] text-[var(--color-black)] rounded-lg hover:shadow-md transition-all"
            >
              Add Item
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default AddItemModal;