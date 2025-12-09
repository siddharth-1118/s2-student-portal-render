'use client';

import { useState, useEffect } from 'react';

interface Student {
  id: string;
  registerNo: string;
  name: string;
}

interface MarkEntry {
  studentId: string;
  registerNo: string;
  name: string;
  subject: string;
  examType: string;
  maxMarks: number;
  scored: string;
}

export default function AdminMarksUpload() {
  const [entries, setEntries] = useState<MarkEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);

  // Global Settings
  const [subject, setSubject] = useState('Mathematics');
  const [exam, setExam] = useState('Internal 1');
  const [max, setMax] = useState(100);

  // 1. Fetch Students & Build Table
  useEffect(() => {
    async function loadStudents() {
      try {
        const res = await fetch('/api/admin/students'); // This calls the NEW file we just made
        if (res.ok) {
          const students: Student[] = await res.json();
          
          const rows = students.map(s => ({
            studentId: s.id,
            registerNo: s.registerNo,
            name: s.name || "Unknown",
            subject: subject,
            examType: exam,
            maxMarks: max,
            scored: '' 
          }));
          setEntries(rows);
        }
      } catch (e) {
        console.error("Failed to load students");
      } finally {
        setLoading(false);
      }
    }
    loadStudents();
  }, []);

  // 2. Apply Header Changes (Fill Down)
  const applyGlobalSettings = () => {
    setEntries(prev => prev.map(row => ({
      ...row,
      subject,
      examType: exam,
      maxMarks: max
    })));
  };

  // 3. Handle Typing in cells
  const handleScoreChange = (index: number, val: string) => {
    const updated = [...entries];
    updated[index].scored = val;
    setEntries(updated);
  };

  // 4. Upload Marks
  const handleUpload = async () => {
    const filledRows = entries.filter(r => r.scored !== '');
    
    if (filledRows.length === 0) return alert("Please enter marks for at least one student.");

    setUploading(true);
    try {
      const res = await fetch('/api/admin/marks/upload', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ marks: filledRows })
      });
      
      if (res.ok) {
        alert("✅ Marks Uploaded & Notifications Sent!");
        setEntries(prev => prev.map(r => ({ ...r, scored: '' }))); // Clear scores
      } else {
        alert("Failed to upload marks.");
      }
    } catch (err) {
      console.error(err);
      alert("Error uploading.");
    } finally {
      setUploading(false);
    }
  };

  if (loading) return <div className="p-10 text-center">Loading Student List...</div>;

  return (
    <div className="p-6 max-w-[1400px] mx-auto bg-gray-50 min-h-screen">
      <h1 className="text-3xl font-bold mb-6 text-gray-800">📊 Upload Marks</h1>
      
      {/* Controls */}
      <div className="bg-white p-6 rounded-xl shadow-sm mb-6 border border-gray-200">
        <div className="flex flex-wrap gap-6 items-end">
          <div>
            <label className="block text-sm font-bold text-gray-700 mb-1">Subject</label>
            <input className="border p-2 rounded w-48" value={subject} onChange={e => setSubject(e.target.value)} />
          </div>
          <div>
            <label className="block text-sm font-bold text-gray-700 mb-1">Exam Type</label>
            <input className="border p-2 rounded w-48" value={exam} onChange={e => setExam(e.target.value)} />
          </div>
          <div>
            <label className="block text-sm font-bold text-gray-700 mb-1">Max Marks</label>
            <input className="border p-2 rounded w-24" type="number" value={max} onChange={e => setMax(Number(e.target.value))} />
          </div>
          <button onClick={applyGlobalSettings} className="bg-gray-800 text-white px-4 py-2 rounded hover:bg-black">
            ⬇️ Apply to Table
          </button>
          <div className="flex-grow text-right">
            <button onClick={handleUpload} disabled={uploading} className="bg-indigo-600 text-white px-8 py-2 rounded-lg font-bold hover:bg-indigo-700 disabled:opacity-50 shadow-lg">
              {uploading ? "Saving..." : "💾 Save All Marks"}
            </button>
          </div>
        </div>
      </div>

      {/* Table */}
      <div className="bg-white shadow-md rounded-xl overflow-hidden border border-gray-200">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-gray-100 text-gray-600 uppercase text-xs">
                <th className="p-4 border-b border-r w-16 text-center">#</th>
                <th className="p-4 border-b border-r w-40">Reg No</th>
                <th className="p-4 border-b border-r">Student Name</th>
                <th className="p-4 border-b w-40 bg-indigo-50 text-indigo-900 font-bold border-l-4 border-l-indigo-500">Scored</th>
              </tr>
            </thead>
            <tbody>
              {entries.map((row, i) => (
                <tr key={row.studentId} className="hover:bg-gray-50 transition">
                  <td className="p-3 border-r text-center text-gray-400 font-mono text-xs">{i + 1}</td>
                  <td className="p-3 border-r font-mono text-sm font-bold text-gray-700">{row.registerNo}</td>
                  <td className="p-3 border-r text-sm font-medium text-gray-800">{row.name}</td>
                  <td className="p-0 relative h-12 bg-indigo-50/30">
                    <input 
                      type="number" 
                      placeholder="-" 
                      className="w-full h-full text-center font-bold text-indigo-700 bg-transparent focus:bg-indigo-100 outline-none text-lg" 
                      value={row.scored} 
                      onChange={e => handleScoreChange(i, e.target.value)} 
                    />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}