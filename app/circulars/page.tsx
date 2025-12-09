'use client';

import { useState, useEffect } from 'react';

interface Circular {
  id: number;
  title: string;
  content: string;
  createdAt: string;
}

export default function StudentAnnouncements() {
  const [circulars, setCirculars] = useState<Circular[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch('/api/circulars')
      .then(res => res.json())
      .then(data => {
        if (Array.isArray(data)) setCirculars(data);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, []);

  if (loading) return <div className="p-10 text-center text-gray-500">Loading announcements...</div>;

  return (
    <div className="min-h-screen bg-gray-50 p-6 md:p-12">
      <div className="max-w-3xl mx-auto">
        <h1 className="text-3xl font-bold mb-2 text-gray-900">📢 Announcements</h1>
        <p className="text-gray-500 mb-8">Latest updates and news from the administration.</p>
        
        {circulars.length === 0 ? (
          <div className="text-center py-12 bg-white rounded-xl shadow border border-gray-200">
            <p className="text-gray-500">No announcements yet.</p>
          </div>
        ) : (
          <div className="space-y-6">
            {circulars.map((c) => (
              <div key={c.id} className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden hover:shadow-md transition duration-200">
                {/* Colored Top Border */}
                <div className="h-1 w-full bg-gradient-to-r from-blue-500 to-indigo-600"></div>
                
                <div className="p-6">
                  <div className="flex justify-between items-start mb-3">
                    <h2 className="text-xl font-bold text-gray-900">{c.title}</h2>
                    <span className="text-xs font-semibold text-blue-600 bg-blue-50 px-3 py-1 rounded-full whitespace-nowrap">
                      {new Date(c.createdAt).toLocaleDateString()}
                    </span>
                  </div>
                  <p className="text-gray-600 whitespace-pre-wrap leading-relaxed">
                    {c.content}
                  </p>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}