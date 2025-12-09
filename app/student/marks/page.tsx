'use client';

import { useState, useEffect } from 'react';

interface Mark {
  id: number;
  subject: string;
  examType: string;
  scored: number;
  maxMarks: number;
}

export default function StudentMarksPage() {
  // Initialize as empty array to prevent "map of null" crashes
  const [marks, setMarks] = useState<Mark[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    async function fetchMarks() {
      try {
        const res = await fetch('/api/student/marks');
        
        // Handle non-JSON responses (like 404 or 500 HTML pages)
        if (!res.ok) throw new Error(`Server Error: ${res.status}`);
        
        const data = await res.json();
        
        // Safety check: Ensure data is actually an array
        if (Array.isArray(data)) {
          setMarks(data);
        } else {
          setMarks([]); // Fallback
        }
      } catch (err) {
        console.error("Error loading marks:", err);
        setError("Failed to load marks.");
      } finally {
        setLoading(false);
      }
    }
    fetchMarks();
  }, []);

  if (loading) return <div className="p-8 text-center text-gray-500">Loading your marks...</div>;
  if (error) return <div className="p-8 text-center text-red-500">{error}</div>;

  return (
    <div className="p-6 max-w-4xl mx-auto min-h-screen bg-gray-50">
      <h1 className="text-3xl font-bold mb-6 text-gray-800">📝 My Marks</h1>
      
      {marks.length === 0 ? (
        <div className="bg-white p-8 rounded-lg shadow text-center text-gray-500">
          No marks found yet.
        </div>
      ) : (
        <div className="bg-white rounded-lg shadow overflow-hidden">
          <table className="w-full text-left">
            <thead className="bg-gray-100 border-b">
              <tr>
                <th className="p-4 font-semibold text-gray-600">Subject</th>
                <th className="p-4 font-semibold text-gray-600">Exam</th>
                <th className="p-4 font-semibold text-gray-600">Score</th>
                <th className="p-4 font-semibold text-gray-600">Percentage</th>
              </tr>
            </thead>
            <tbody>
              {marks.map((m) => (
                <tr key={m.id} className="border-b hover:bg-gray-50">
                  <td className="p-4">{m.subject}</td>
                  <td className="p-4 text-gray-500 text-sm">{m.examType}</td>
                  <td className="p-4 font-bold text-indigo-600">
                    {m.scored} <span className="text-gray-400 font-normal text-xs">/ {m.maxMarks}</span>
                  </td>
                  <td className="p-4 text-sm font-medium text-gray-700">
                    {((m.scored / m.maxMarks) * 100).toFixed(1)}%
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}