'use client';

import { useState, useEffect } from 'react';

interface Circular {
  id: number;
  title: string;
  content: string;
  createdAt: string;
}

export default function StudentCirculars() {
  const [circulars, setCirculars] = useState<Circular[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchCirculars() {
      try {
        const res = await fetch('/api/circulars'); // Fetches real DB data
        if (res.ok) {
          const data = await res.json();
          setCirculars(data);
        }
      } catch (error) {
        console.error("Failed to load circulars");
      } finally {
        setLoading(false);
      }
    }
    fetchCirculars();
  }, []);

  return (
    <div className="p-6 max-w-4xl mx-auto">
      <h1 className="text-3xl font-bold mb-6">📢 Announcements</h1>
      
      {loading ? (
        <p>Loading...</p>
      ) : circulars.length === 0 ? (
        <p className="text-gray-500">No announcements yet.</p>
      ) : (
        <div className="space-y-4">
          {circulars.map((c) => (
            <div key={c.id} className="bg-white p-6 rounded-lg shadow border-l-4 border-indigo-500">
              <div className="flex justify-between items-start mb-2">
                <h3 className="text-xl font-bold">{c.title}</h3>
                <span className="text-sm text-gray-500">
                  {new Date(c.createdAt).toLocaleDateString()}
                </span>
              </div>
              <p className="text-gray-700 whitespace-pre-wrap">{c.content}</p>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}