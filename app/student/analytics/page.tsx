'use client';

import { useState, useEffect } from 'react';

export default function StudentAnalytics() {
  const [stats, setStats] = useState({
    avg: 0,
    highest: 0,
    totalSubjects: 0,
    passPercentage: 0
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function calculateStats() {
      try {
        const res = await fetch('/api/student/marks');
        if (res.ok) {
          const marks = await res.json();
          if (Array.isArray(marks) && marks.length > 0) {
            
            // 1. Calculate Average
            const total = marks.reduce((sum: number, m: any) => sum + m.scored, 0);
            const maxTotal = marks.reduce((sum: number, m: any) => sum + m.maxMarks, 0);
            const avg = (total / maxTotal) * 100;

            // 2. Highest Score
            const highest = Math.max(...marks.map((m: any) => m.scored));

            // 3. Pass Percentage (Assuming 50% is pass)
            const passed = marks.filter((m: any) => (m.scored / m.maxMarks) >= 0.50).length;
            const passPerc = (passed / marks.length) * 100;

            setStats({
              avg: parseFloat(avg.toFixed(1)),
              highest,
              totalSubjects: marks.length,
              passPercentage: parseFloat(passPerc.toFixed(1))
            });
          }
        }
      } catch (e) {
        console.error(e);
      } finally {
        setLoading(false);
      }
    }
    calculateStats();
  }, []);

  if (loading) return <div className="p-8">Calculating analytics...</div>;

  return (
    <div className="p-8 max-w-5xl mx-auto bg-gray-50 min-h-screen">
      <h1 className="text-3xl font-bold mb-8">📈 My Performance Analytics</h1>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        {/* Card 1 */}
        <div className="bg-white p-6 rounded-xl shadow border-l-4 border-blue-500">
          <p className="text-gray-500 text-sm">Overall Percentage</p>
          <p className="text-4xl font-bold text-gray-800">{stats.avg}%</p>
        </div>
        {/* Card 2 */}
        <div className="bg-white p-6 rounded-xl shadow border-l-4 border-green-500">
          <p className="text-gray-500 text-sm">Highest Score</p>
          <p className="text-4xl font-bold text-gray-800">{stats.highest}</p>
        </div>
        {/* Card 3 */}
        <div className="bg-white p-6 rounded-xl shadow border-l-4 border-purple-500">
          <p className="text-gray-500 text-sm">Total Subjects</p>
          <p className="text-4xl font-bold text-gray-800">{stats.totalSubjects}</p>
        </div>
        {/* Card 4 */}
        <div className="bg-white p-6 rounded-xl shadow border-l-4 border-orange-500">
          <p className="text-gray-500 text-sm">Pass Rate</p>
          <p className="text-4xl font-bold text-gray-800">{stats.passPercentage}%</p>
        </div>
      </div>
    </div>
  );
}