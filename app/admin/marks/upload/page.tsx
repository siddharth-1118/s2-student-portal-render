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
  scored: string; // Keep as string for input handling
}

export default function AdminGradebook() {
  const [students, setStudents] = useState<Student[]>([]);
  const [entries, setEntries] = useState<MarkEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);

  // Global Defaults (To fill the sheet quickly)
  const [globalSubject, setGlobalSubject] = useState('Mathematics');
  const [globalExam, setGlobalExam] = useState('Internal 1');
  const [globalMax, setGlobalMax] = useState(100);

  // 1. Fetch All Students on Load
  useEffect(() => {
    async function fetchStudents() {
      try {
        const res = await fetch('/api/admin/students');
        if (res.ok) {
          const data = await res.json();
          setStudents(data);
          
          // Initialize the "Spreadsheet" with student data
          const initialRows = data.map((s: Student) => ({
            studentId: s.id,
            registerNo: s.registerNo,
            name: s.name || "Unknown",
            subject: globalSubject,
            examType: globalExam,
            maxMarks: globalMax,
            scored: '' // Empty initially
          }));
          setEntries(initialRows);
        }
      } catch (err) {
        console.error("Failed to load students");
      } finally {
        setLoading(false);
      }
    }
    fetchStudents();
  }, []); // Run once on mount

  // 2. Handle "Fill Down" (Apply global settings to all rows)
  const applyDefaults = () => {
    setEntries(prev => prev.map(row => ({
      ...row,
      subject: globalSubject,
      examType: globalExam,
      maxMarks: globalMax
    })));
  };

  // 3. Handle Individual Cell Changes
  const handleChange = (index: number, field: keyof MarkEntry, value: any) => {
    const newEntries = [...entries];
    newEntries[index] = { ...newEntries[index], [field]: value };
    setEntries(newEntries);
  };

  // 4. Save to Database
  const handleUpload = async () => {
    // Filter out rows where "Scored" is empty
    const validEntries = entries.filter(e => e.scored !== '' && !isNaN(Number(e.scored)));

    if (validEntries.length === 0) {
      alert("⚠️ No marks entered. Please enter marks for at least one student.");
      return;
    }

    setUploading(true);
    try {
      const res = await fetch('/api/admin/marks/upload', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ marks: validEntries }),
      });

      if (res.ok) {
        alert(`✅ Successfully uploaded marks for ${validEntries.length} students!`);
        // Optional: Clear scores after upload
        // setEntries(prev => prev.map(e => ({ ...e, scored: '' })));
      } else {
        alert("❌ Failed to upload. Check console for details.");
      }
    } catch (error) {
      console.error(error);
      alert("Error uploading marks.");
    } finally {
      setUploading(false);
    }
  };

  if (loading) return <div className="p-8">Loading Student List...</div>;

  return (
    <div className="p-6 max-w-[1400px] mx-auto">
      <h1 className="text-3xl font-bold mb-6">📊 Teacher Gradebook</h1>

      {/* --- TOP CONTROL BAR --- */}
      <div className="bg-white p-4 rounded-lg shadow mb-6 border border-gray-200 flex flex-wrap gap-4 items-end">
        <div>
          <label className="block text-sm font-bold text-gray-700 mb-1">Subject</label>
          <input 
            type="text" 
            value={globalSubject} 
            onChange={e => setGlobalSubject(e.target.value)}
            className="border p-2 rounded w-40" 
          />
        </div>
        <div>
          <label className="block text-sm font-bold text-gray-700 mb-1">Exam Name</label>
          <input 
            type="text" 
            value={globalExam} 
            onChange={e => setGlobalExam(e.target.value)}
            className="border p-2 rounded w-40" 
          />
        </div>
        <div>
          <label className="block text-sm font-bold text-gray-700 mb-1">Max Marks</label>
          <input 
            type="number" 
            value={globalMax} 
            onChange={e => setGlobalMax(Number(e.target.value))}
            className="border p-2 rounded w-24" 
          />
        </div>
        <button 
          onClick={applyDefaults}
          className="bg-gray-800 text-white px-4 py-2 rounded hover:bg-black"
        >
          ⬇️ Apply to All Rows
        </button>
        <div className="flex-grow text-right">
           <button 
            onClick={handleUpload}
            disabled={uploading}
            className="bg-indigo-600 text-white px-8 py-2 rounded font-bold hover:bg-indigo-700 disabled:opacity-50 text-lg shadow-lg"
          >
            {uploading ? "Uploading..." : "💾 Save Marks & Notify Students"}
          </button>
        </div>
      </div>

      {/* --- SPREADSHEET TABLE --- */}
      <div className="bg-white rounded-lg shadow overflow-x-auto border border-gray-300">
        <table className="w-full text-left border-collapse">
          <thead className="bg-gray-100 text-gray-600 uppercase text-xs">
            <tr>
              <th className="p-3 border-r border-b w-10">#</th>
              <th className="p-3 border-r border-b w-32">Reg No</th>
              <th className="p-3 border-r border-b w-48">Name</th>
              <th className="p-3 border-r border-b">Subject</th>
              <th className="p-3 border-r border-b">Exam Type</th>
              <th className="p-3 border-r border-b w-24">Max</th>
              <th className="p-3 border-b w-32 bg-indigo-50 text-indigo-900 font-bold">Scored (Enter Here)</th>
            </tr>
          </thead>
          <tbody className="text-sm">
            {entries.map((entry, index) => (
              <tr key={entry.studentId} className="hover:bg-gray-50 group">
                <td className="p-2 border-r border-b text-center text-gray-400">{index + 1}</td>
                <td className="p-2 border-r border-b font-mono font-medium">{entry.registerNo}</td>
                <td className="p-2 border-r border-b text-gray-700">{entry.name}</td>
                
                {/* Editable Subject */}
                <td className="p-0 border-r border-b">
                  <input 
                    className="w-full h-full p-2 outline-none focus:bg-blue-50 bg-transparent"
                    value={entry.subject}
                    onChange={(e) => handleChange(index, 'subject', e.target.value)}
                  />
                </td>

                {/* Editable Exam Type */}
                <td className="p-0 border-r border-b">
                  <input 
                    className="w-full h-full p-2 outline-none focus:bg-blue-50 bg-transparent"
                    value={entry.examType}
                    onChange={(e) => handleChange(index, 'examType', e.target.value)}
                  />
                </td>

                {/* Editable Max Marks */}
                <td className="p-0 border-r border-b">
                  <input 
                    type="number"
                    className="w-full h-full p-2 outline-none focus:bg-blue-50 bg-transparent text-center"
                    value={entry.maxMarks}
                    onChange={(e) => handleChange(index, 'maxMarks', e.target.value)}
                  />
                </td>

                {/* --- SCORED INPUT (Highlighted) --- */}
                <td className="p-0 border-b relative">
                  <input 
                    type="number"
                    placeholder="-"
                    className="w-full h-full p-2 outline-none focus:bg-indigo-100 bg-indigo-50/30 font-bold text-center text-indigo-700"
                    value={entry.scored}
                    onChange={(e) => handleChange(index, 'scored', e.target.value)}
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