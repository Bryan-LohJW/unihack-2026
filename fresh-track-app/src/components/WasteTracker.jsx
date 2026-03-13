import React, { useState, useEffect } from 'react';

const WasteTracker = () => {
  const [logs, setLogs] = useState(() => {
    const stored = localStorage.getItem('wasteLogs');
    return stored ? JSON.parse(stored) : [];
  });
  const [newLog, setNewLog] = useState('');

  useEffect(() => {
    localStorage.setItem('wasteLogs', JSON.stringify(logs));
  }, [logs]);

  const addLog = () => {
    if (newLog.trim()) {
      setLogs([...logs, { item: newLog, date: new Date().toLocaleDateString() }]);
      setNewLog('');
    }
  };

  return (
    <div className="waste-tracker bg-white shadow-sm rounded-2xl p-4">
      <h2 className="text-xl font-semibold text-slate-900 mb-3">Not Wasted Food</h2>
      <div className="flex gap-2 mb-4">
        <input
          className="flex-1 rounded-lg border border-slate-200 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-300"
          type="text"
          value={newLog}
          onChange={(e) => setNewLog(e.target.value)}
          placeholder="Log used item"
        />
        <button
          className="rounded-lg bg-indigo-600 px-4 py-2 text-white hover:bg-indigo-700"
          onClick={addLog}
        >
          Log
        </button>
      </div>
      <ul className="space-y-2">
        {logs.map((log, index) => (
          <li
            key={index}
            className="rounded-lg border border-slate-200 px-3 py-2 text-sm text-slate-700"
          >
            {log.item} • {log.date}
          </li>
        ))}
      </ul>
    </div>
  );
};

export default WasteTracker;