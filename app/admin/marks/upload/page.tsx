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

export default function AdminMarksSpreadsheet() {
  const [entries, setEntries] = useState<MarkEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);

  // Default Values
  const [subject, setSubject] = useState('Mathematics');
  const [exam, setExam] = useState('Internal 1');
  const [max, setMax] = useState(100);

  // 1. Load Students into Table
  useEffect(() => {
    async function loadData() {
      try {
        const res = await fetch('/api/admin/students');
        if (res.ok) {
          const students: Student[] = await res.json();
          
          // Create a blank row for every student
          const rows = students.map(s => ({
            studentId: s.id,
            registerNo: s.registerNo,
            name: s.name || "Unknown",
            subject: subject,
            examType: exam,
            maxMarks: max,
            scored: '' // Start empty
          }));
          setEntries(rows);
        }
      } catch (e) {
        console.error("Failed to load students");
      } finally {
        setLoading(false);
      }
    }
    loadData();
  }, []);

  // 2. Update Header Values (Fill Down)
  const applyGlobalSettings = () => {
    setEntries(prev => prev.map(row => ({
      ...row,
      subject,
      examType: exam,
      maxMarks: max
    })));
  };

  // 3. Handle Typing in Cells
  const handleCellChange = (index: number, val: string) => {
    const updated = [...entries];
    updated[index].scored = val;
    setEntries(updated);
  };

  // 4. Upload Marks
  const handleUpload = async () => {
    // Only send rows where marks were actually entered
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
        // Optional: Clear the scores after saving
        // setEntries(prev => prev.map(r => ({ ...r, scored: '' }))); 
      } else {
        alert("Failed to upload.");
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
      <h1 className="text-3xl font-bold mb-6 text-gray-800">📊 Enter Student Marks</h1>
      
      {/* Top Controls */}
      <div className="bg-white p-4 rounded-lg shadow mb-6 flex gap-4 items-end flex-wrap border border-gray-200">
        <div>
          <label className="block text-sm font-bold text-gray-700">Subject</label>
          <input className="border p-2 rounded w-40" value={subject} onChange={e => setSubject(e.target.value)} />
        </div>
        <div>
          <label className="block text-sm font-bold text-gray-700">Exam Name</label>
          <input className="border p-2 rounded w-40" value={exam} onChange={e => setExam(e.target.value)} />
        </div>
        <div>
          <label className="block text-sm font-bold text-gray-700">Max Marks</label>
          <input className="border p-2 rounded w-24" type="number" value={max} onChange={e => setMax(Number(e.target.value))} />
        </div>
        <button onClick={applyGlobalSettings} className="bg-gray-700 text-white px-4 py-2 rounded hover:bg-gray-800">
          ⬇️ Set for All
        </button>
        <button 
          onClick={handleUpload} 
          disabled={uploading}
          className="ml-auto bg-green-600 text-white px-6 py-2 rounded font-bold hover:bg-green-700 disabled:opacity-50"
        >
          {uploading ? "Saving..." : "💾 Save Marks"}
        </button>
      </div>

      {/* The Spreadsheet Table */}
      <div className="bg-white shadow rounded-lg overflow-x-auto border border-gray-300">
        <table className="w-full text-left border-collapse">
          <thead className="bg-gray-100 text-gray-600 uppercase text-xs">
            <tr>
              <th className="p-3 border-b border-r w-10">#</th>
              <th className="p-3 border-b border-r w-32">Reg No</th>
              <th className="p-3 border-b border-r">Name</th>
              <th className="p-3 border-b border-r w-32">Subject</th>
              <th className="p-3 border-b border-r w-32">Exam</th>
              <th className="p-3 border-b border-r w-20">Max</th>
              <th className="p-3 border-b w-32 bg-indigo-50 text-indigo-800 font-bold">Scored</th>
            </tr>
          </thead>
          <tbody>
            {entries.map((row, i) => (
              <tr key={row.studentId} className="hover:bg-gray-50 border-b">
                <td className="p-2 border-r text-center text-gray-400">{i + 1}</td>
                <td className="p-2 border-r font-mono text-sm font-bold">{row.registerNo}</td>
                <td className="p-2 border-r text-sm">{row.name}</td>
                <td className="p-2 border-r text-sm text-gray-500">{row.subject}</td>
                <td className="p-2 border-r text-sm text-gray-500">{row.examType}</td>
                <td className="p-2 border-r text-sm text-gray-500">{row.maxMarks}</td>
                <td className="p-0 relative h-10">
                  <input 
                    type="number" 
                    placeholder="-" 
                    className="w-full h-full text-center font-bold text-indigo-700 bg-indigo-50/30 focus:bg-indigo-100 outline-none" 
                    value={row.scored} 
                    onChange={e => handleCellChange(i, e.target.value)} 
                  />
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}