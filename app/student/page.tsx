"use client";
import React, { useState } from 'react';

export default function StudentDashboard() {
  // This data should normally come from your database
  const [circulars] = useState([
    { id: 1, title: 'Semester Exam Guidelines', date: '2025-12-10' },
    { id: 2, title: 'Holiday List 2026', date: '2025-12-05' },
    { id: 3, title: 'Fee Submission Deadline', date: '2025-11-20' },
  ]);

  return (
    <div className="p-6 bg-gray-50 min-h-screen">
      <h1 className="text-3xl font-bold text-gray-800 mb-8">Student Dashboard</h1>

      <div className="grid md:grid-cols-2 gap-6">
        
        {/* CIRCULARS WIDGET */}
        <div className="bg-white p-6 rounded-lg shadow-md border-t-4 border-indigo-600">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-xl font-bold text-gray-800">📢 Latest Circulars</h2>
            <span className="text-xs bg-indigo-100 text-indigo-800 px-2 py-1 rounded">Updated Today</span>
          </div>

          <div className="space-y-4">
            {circulars.map((c) => (
              <div key={c.id} className="p-3 bg-gray-50 rounded hover:bg-gray-100 transition cursor-pointer border-l-2 border-transparent hover:border-indigo-500">
                <h3 className="font-bold text-gray-800">{c.title}</h3>
                <p className="text-sm text-gray-500">Posted on: {c.date}</p>
              </div>
            ))}
          </div>
          
          <button className="w-full mt-4 text-indigo-600 text-sm font-semibold hover:underline">
            View All Circulars →
          </button>
        </div>

        {/* OTHER WIDGETS (Placeholder) */}
        <div className="space-y-6">
           {/* You can add your Calculator Link here */}
           <div className="bg-white p-6 rounded-lg shadow-md">
              <h2 className="text-xl font-bold text-gray-800 mb-2">⚡ Quick Links</h2>
              <div className="grid grid-cols-2 gap-4">
                <a href="/student/calculator" className="p-4 bg-blue-50 text-blue-700 rounded text-center font-bold hover:bg-blue-100">
                  GPA Calculator
                </a>
                <a href="/student/timetable" className="p-4 bg-green-50 text-green-700 rounded text-center font-bold hover:bg-green-100">
                  Timetable
                </a>
              </div>
           </div>
        </div>

      </div>
    </div>
  );
}