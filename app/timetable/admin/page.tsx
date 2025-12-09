'use client';

import { useState, useEffect } from 'react';

export default function AdminTimetable() {
  const [file, setFile] = useState<File | null>(null);
  const [timetable, setTimetable] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);

  // Fetch current timetable on load
  useEffect(() => {
    fetchTimetable();
  }, []);

  const fetchTimetable = async () => {
    try {
      const res = await fetch('/api/timetable/get'); // Ensure this API exists
      if (res.ok) setTimetable(await res.json());
    } catch (e) {
      console.error(e);
    }
  };

  const handleDelete = async (id: number) => {
    if (!confirm("Delete this class?")) return;
    try {
      const res = await fetch(`/api/timetable/update?id=${id}`, { method: 'DELETE' });
      if (res.ok) {
        setTimetable(prev => prev.filter(t => t.id !== id));
      } else {
        alert("Failed to delete");
      }
    } catch (e) {
      console.error(e);
    }
  };

  const handleUpload = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!file) return;
    setLoading(true);

    const formData = new FormData();
    formData.append('file', file);

    try {
      const res = await fetch('/api/timetable/upload', {
        method: 'POST',
        body: formData,
      });
      if (res.ok) {
        alert("Timetable Uploaded!");
        fetchTimetable();
      } else {
        alert("Upload failed.");
      }
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-8 max-w-5xl mx-auto">
      <h1 className="text-3xl font-bold mb-6">📅 Manage Timetable</h1>

      {/* Upload Section */}
      <div className="bg-white p-6 rounded-lg shadow mb-8">
        <h2 className="text-xl font-bold mb-4">Upload New Timetable (Excel/CSV)</h2>
        <form onSubmit={handleUpload} className="flex gap-4 items-center">
          <input 
            type="file" 
            accept=".csv, .xlsx" 
            onChange={(e) => setFile(e.target.files?.[0] || null)}
            className="border p-2 rounded"
          />
          <button 
            type="submit" 
            disabled={loading}
            className="bg-blue-600 text-white px-6 py-2 rounded hover:bg-blue-700 disabled:opacity-50"
          >
            {loading ? "Uploading..." : "Upload"}
          </button>
        </form>
      </div>

      {/* Delete/Manage Section */}
      <div className="bg-white p-6 rounded-lg shadow">
        <h2 className="text-xl font-bold mb-4">Current Classes (Click to Delete)</h2>
        {timetable.length === 0 ? <p>No classes found.</p> : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {timetable.map((t) => (
              <div key={t.id} className="border p-4 rounded flex justify-between items-center bg-gray-50">
                <div>
                  <p className="font-bold">{t.day} - Period {t.period}</p>
                  <p className="text-sm text-gray-600">{t.subject} ({t.room})</p>
                </div>
                <button 
                  onClick={() => handleDelete(t.id)}
                  className="bg-red-100 text-red-600 px-3 py-1 rounded text-sm hover:bg-red-200"
                >
                  Delete
                </button>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}