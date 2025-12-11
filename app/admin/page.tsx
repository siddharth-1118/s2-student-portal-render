"use client";
import React, { useState } from 'react';

export default function AdminDashboard() {
  // Mock data for display - replace with database fetch
  const [circulars, setCirculars] = useState([
    { id: 1, title: 'Semester Exam Guidelines', date: '2025-12-10' },
    { id: 2, title: 'Holiday List 2026', date: '2025-12-05' },
  ]);

  const [newTitle, setNewTitle] = useState('');

  const handlePublish = () => {
    if(!newTitle) return alert("Enter a title");
    
    // In a real app, send this data to your backend API here
    const newCircular = {
      id: Date.now(),
      title: newTitle,
      date: new Date().toISOString().split('T')[0]
    };

    setCirculars([newCircular, ...circulars]);
    setNewTitle('');
    alert("Circular Published Successfully!");
  };

  return (
    <div className="p-6 bg-gray-50 min-h-screen">
      <h1 className="text-3xl font-bold text-gray-800 mb-8">Admin Dashboard</h1>

      {/* SECTION 1: PUBLISH CIRCULAR */}
      <div className="bg-white p-6 rounded-lg shadow-md mb-8 border-l-4 border-blue-600">
        <h2 className="text-xl font-bold text-gray-800 mb-4">📢 Post New Circular</h2>
        <div className="flex gap-4">
          <input 
            type="text" 
            value={newTitle}
            onChange={(e) => setNewTitle(e.target.value)}
            placeholder="Enter Circular Title (e.g., Exam Schedule Revised)"
            className="flex-1 border p-3 rounded text-black"
          />
          <button 
            onClick={handlePublish}
            className="bg-blue-600 text-white px-6 py-3 rounded font-bold hover:bg-blue-700"
          >
            Publish
          </button>
        </div>
      </div>

      {/* SECTION 2: VIEW ACTIVE CIRCULARS */}
      <div className="bg-white p-6 rounded-lg shadow-md">
        <h2 className="text-xl font-bold text-gray-800 mb-4">📋 Active Circulars</h2>
        {circulars.length === 0 ? (
          <p className="text-gray-500">No active circulars.</p>
        ) : (
          <ul className="space-y-3">
            {circulars.map((c) => (
              <li key={c.id} className="flex justify-between items-center p-3 bg-gray-50 rounded border hover:bg-gray-100">
                <span className="font-semibold text-gray-700">{c.title}</span>
                <span className="text-sm text-gray-500">{c.date}</span>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}