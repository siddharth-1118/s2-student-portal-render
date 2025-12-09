'use client';

import { useState, useEffect } from 'react';

export default function AdminTimetable() {
  const [timetable, setTimetable] = useState<any[]>([]);
  
  // Form State
  const [day, setDay] = useState('Monday');
  const [period, setPeriod] = useState(1);
  const [subject, setSubject] = useState('');
  const [room, setRoom] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    fetchTimetable();
  }, []);

  const fetchTimetable = async () => {
    const res = await fetch('/api/timetable/get');
    if (res.ok) setTimetable(await res.json());
  };

  const handleAdd = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    const res = await fetch('/api/timetable/create', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ day, period, subject, room })
    });

    if (res.ok) {
      alert("✅ Class Added!");
      setSubject('');
      setRoom('');
      fetchTimetable(); // Refresh list
    } else {
      alert("Failed to add class.");
    }
    setLoading(false);
  };

  const handleDelete = async (id: number) => {
    if (!confirm("Are you sure?")) return;
    await fetch(`/api/timetable/update?id=${id}`, { method: 'DELETE' });
    fetchTimetable();
  };

  return (
    <div className="p-8 max-w-5xl mx-auto">
      <h1 className="text-3xl font-bold mb-6">📅 Manage Timetable</h1>

      {/* Manual Entry Form */}
      <div className="bg-white p-6 rounded-lg shadow mb-8 border border-gray-200">
        <h2 className="text-xl font-bold mb-4 text-indigo-700">Add New Class</h2>
        <form onSubmit={handleAdd} className="flex flex-wrap gap-4 items-end">
          <div>
            <label className="block text-sm font-bold mb-1">Day</label>
            <select className="border p-2 rounded w-40" value={day} onChange={e => setDay(e.target.value)}>
              {['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday'].map(d => (
                <option key={d} value={d}>{d}</option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-sm font-bold mb-1">Period</label>
            <select className="border p-2 rounded w-24" value={period} onChange={e => setPeriod(Number(e.target.value))}>
              {[1,2,3,4,5,6,7,8].map(p => <option key={p} value={p}>{p}</option>)}
            </select>
          </div>
          <div>
            <label className="block text-sm font-bold mb-1">Subject</label>
            <input className="border p-2 rounded w-48" placeholder="e.g. Maths" value={subject} onChange={e => setSubject(e.target.value)} required />
          </div>
          <div>
            <label className="block text-sm font-bold mb-1">Room</label>
            <input className="border p-2 rounded w-24" placeholder="e.g. 401" value={room} onChange={e => setRoom(e.target.value)} />
          </div>
          <button type="submit" disabled={loading} className="bg-indigo-600 text-white px-6 py-2 rounded font-bold hover:bg-indigo-700 disabled:opacity-50">
            {loading ? "Adding..." : "+ Add Class"}
          </button>
        </form>
      </div>

      {/* Class List with Delete */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {timetable.map((t) => (
          <div key={t.id} className="bg-white border p-4 rounded shadow-sm flex justify-between items-center">
            <div>
              <p className="font-bold text-gray-800">{t.day} - Period {t.period}</p>
              <p className="text-indigo-600 font-medium">{t.subject}</p>
              <p className="text-xs text-gray-500">Room: {t.room || "N/A"}</p>
            </div>
            <button 
              onClick={() => handleDelete(t.id)}
              className="bg-red-50 text-red-600 px-3 py-1 rounded text-sm hover:bg-red-100 font-bold"
            >
              Delete
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}