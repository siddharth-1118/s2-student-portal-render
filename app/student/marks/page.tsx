'use client';

import { useSession } from 'next-auth/react';
import { useState, useEffect } from 'react';

interface Mark {
  id: number;
  subject: string;
  examType: string;
  scored: number;
  maxMarks: number;
}

export default function StudentMarks() {
  const { data: session } = useSession();
  const [marks, setMarks] = useState<Mark[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchMarks() {
      try {
        const res = await fetch('/api/student/marks');
        if (res.ok) {
          const data = await res.json();
          setMarks(data);
        }
      } catch (err) {
        console.error("Error fetching marks");
      } finally {
        setLoading(false);
      }
    }
    fetchMarks();
  }, []);

  if (loading) return <div className="p-6">Loading your marks...</div>;

  return (
    <div className="p-6 max-w-5xl mx-auto">
      <h1 className="text-3xl font-bold mb-6">📊 My Performance</h1>
      
      <div className="bg-white rounded-lg shadow overflow-hidden">
        <table className="w-full text-left">
          <thead className="bg-gray-100 border-b">
            <tr>
              <th className="p-4 font-semibold">Subject</th>
              <th className="p-4 font-semibold">Test Name</th>
              <th className="p-4 font-semibold">Scored</th>
              <th className="p-4 font-semibold">Max Marks</th>
              <th className="p-4 font-semibold">Percentage</th>
            </tr>
          </thead>
          <tbody>
            {marks.length === 0 ? (
              <tr><td colSpan={5} className="p-4 text-center">No marks found.</td></tr>
            ) : (
              marks.map((mark) => (
                <tr key={mark.id} className="border-b hover:bg-gray-50">
                  <td className="p-4">{mark.subject}</td>
                  <td className="p-4">{mark.examType}</td>
                  <td className="p-4 font-bold text-indigo-600">{mark.scored}</td>
                  <td className="p-4">{mark.maxMarks}</td>
                  <td className="p-4">
                    {((mark.scored / mark.maxMarks) * 100).toFixed(1)}%
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}