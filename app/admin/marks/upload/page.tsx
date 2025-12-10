'use client';

import { useState, useEffect } from 'react';
import NotificationButton from '@/components/NotificationButton';

// Types
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

export default function MarksUploadPage() {
  const [activeTab, setActiveTab] = useState<'csv' | 'table'>('csv');
  const [loading, setLoading] = useState(false);
  const [uploading, setUploading] = useState(false);
  
  // --- TABLE MODE STATE ---
  const [entries, setEntries] = useState<MarkEntry[]>([]);
  const [tableSubject, setTableSubject] = useState('Mathematics');
  const [tableExam, setTableExam] = useState('Internal');
  const [tableMax, setTableMax] = useState(100);

  // --- CSV MODE STATE ---
  const [previewData, setPreviewData] = useState<any[]>([]);
    const [csvSubject, setCsvSubject] = useState('Mathematics');
  const [csvExam, setCsvExam] = useState('Internal');
  const [csvMax, setCsvMax] = useState(100);
  const [fileName, setFileName] = useState('');

  // 1. Fetch Students (For Table Mode)
  useEffect(() => {
    async function loadStudents() {
      try {
        const res = await fetch('/api/admin/students');
        if (res.ok) {
          const students: Student[] = await res.json();
          const rows = students.map(s => ({
            studentId: s.id,
            registerNo: s.registerNo,
            name: s.name || "Unknown",
            subject: tableSubject,
            examType: tableExam,
            maxMarks: tableMax,
            scored: '' 
          }));
          setEntries(rows);
        }
      } catch (e) {
        console.error("Failed to load students");
      }
    }
    loadStudents();
  }, []);

  // 2. Handle File Upload (CSV Mode)
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setFileName(file.name);
    const reader = new FileReader();
    reader.onload = (evt) => {
      const bstr = evt.target?.result;
      if (!bstr) return;
      
      // Parse CSV using simple parsing
      const text = typeof bstr === 'string' ? bstr : new TextDecoder().decode(bstr);      const lines = text.split('\n').filter(line => line.trim());
      if (lines.length < 2) {
        alert('CSV file is empty or invalid');
        return;
      }

      // Parse header
      const headers = lines[0].split(',').map(h => h.trim().toLowerCase());
      
      // Find column indices
      const regNoIdx = headers.findIndex(h => h.includes('register') || h.includes('regno') || h.includes('reg'));
      const nameIdx = headers.findIndex(h => h.includes('name') || h.includes('student'));
      const subjectIdx = headers.findIndex(h => h.includes('subject'));
      const marksIdx = headers.findIndex(h => h.includes('mark') || h.includes('score'));

      if (regNoIdx === -1 || marksIdx === -1) {
        alert('CSV must have Register Number and Marks columns');
        return;
      }

      // Parse data rows
      const mapped = [];
      for (let i = 1; i < lines.length; i++) {
        const values = lines[i].split(',').map(v => v.trim());
        if (values.length > regNoIdx && values[regNoIdx]) {
          mapped.push({
            registerNo: values[regNoIdx],
            subject: subjectIdx !== -1 ? values[subjectIdx] : csvSubject,
            scored: marksIdx !== -1 ? values[marksIdx] : '',
            maxMarks: csvMax,
            examType: csvExam
          });
        }
      }
      
      setPreviewData(mapped);
    };
    reader.readAsBinaryString(file);
  };

  // 3. Update Table Global Settings
  const applyTableSettings = () => {
    setEntries(prev => prev.map(row => ({
      ...row,
      subject: tableSubject,
      examType: tableExam,
      maxMarks: tableMax
    })));
  };

  // 4. Handle Cell Typing
  const handleScoreChange = (index: number, val: string) => {
    const updated = [...entries];
    updated[index].scored = val;
    setEntries(updated);
  };

  // 5. Unified Upload Function
  const handleUpload = async () => {
    // If CSV mode, re-apply the latest Exam Type/Max Marks just in case user changed them after selecting file
    let dataToUpload = [];

    if (activeTab === 'csv') {
      dataToUpload = previewData.map(d => ({ ...d, examType: csvExam, maxMarks: csvMax }));
    } else {
      dataToUpload = entries.filter(r => r.scored !== '');
    }

    if (dataToUpload.length === 0) return alert("No marks to upload.");

    setUploading(true);
    try {
      const res = await fetch('/api/marks/upload', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ marks: dataToUpload })
      });

      if (res.ok) {
        alert("✅ Marks Uploaded Successfully!");
        setPreviewData([]);
        setFileName('');
        setEntries(prev => prev.map(r => ({ ...r, scored: '' })));
      } else {
        alert("Failed to upload.");
      }
    } catch (error) {
      alert("Error uploading marks.");
    } finally {
      setUploading(false);
    }
  };

  return (
    <div className="p-8 max-w-6xl mx-auto min-h-screen bg-gray-50">
      <h1 className="text-3xl font-bold text-indigo-700 mb-2">📤 Upload Marks</h1>
      <p className="text-gray-500 mb-6">Upload student marks via CSV file or table entry</p>

      {/* --- TABS --- */}
      <div className="flex gap-4 mb-8 border-b border-gray-300 pb-1">
        <button 
          onClick={() => setActiveTab('csv')}
          className={`px-6 py-2 rounded-t-lg font-bold transition ${activeTab === 'csv' ? 'bg-indigo-600 text-white shadow-md' : 'bg-gray-200 text-gray-600 hover:bg-gray-300'}`}
        >
          CSV Upload
        </button>
        <button 
          onClick={() => setActiveTab('table')}
          className={`px-6 py-2 rounded-t-lg font-bold transition ${activeTab === 'table' ? 'bg-indigo-600 text-white shadow-md' : 'bg-gray-200 text-gray-600 hover:bg-gray-300'}`}
        >
          Table Entry
        </button>
      </div>

      {/* --- NOTIFICATION TOGGLE --- */}
      <div className="mb-8 p-4 bg-white border border-gray-300 rounded-lg flex justify-between items-center shadow-sm">
        <p className="text-gray-700">Enable notifications to get updates when your marks are changed.</p>
        <NotificationButton />
      </div>

      {/* ================= CSV MODE ================= */}
      {activeTab === 'csv' && (
        <div className="animate-fade-in space-y-6">
          
          {/* File Drop Zone */}
          <div className="bg-white p-10 rounded-xl shadow-sm border-2 border-dashed border-indigo-300 text-center hover:bg-indigo-50 transition relative">
            <input 
              type="file" 
              accept=".csv"
              onChange={handleFileChange}
              className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
            />
            <div className="text-6xl mb-4">📁</div>
            <p className="text-lg font-bold text-gray-700">{fileName || "Click to select a CSV file"}</p>
            <p className="text-sm text-gray-400 mt-2">CSV should contain Register Number and subject columns</p>
          </div>

          {/* Inputs for CSV */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
             <div>
                <label className="block text-sm font-bold text-gray-700 mb-2">🏷️ Exam type</label>
                <input 
                  className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none" 
                  value={csvExam} 
                  onChange={e => setCsvExam(e.target.value)} 
                />
             </div>
             <div>
                <label className="block text-sm font-bold text-gray-700 mb-2">🎯 Max marks</label>
                <input 
                  type="number" 
                  className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none" 
                  value={csvMax} 
                  onChange={e => setCsvMax(Number(e.target.value))} 
                />
             </div>
          </div>

          {/* Preview */}
          {previewData.length > 0 && (
            <div className="bg-white rounded-lg shadow overflow-hidden border border-gray-200">
              <div className="p-4 bg-gray-50 border-b font-bold text-gray-700">Preview ({previewData.length} rows)</div>
              <table className="w-full text-left">
                <thead className="bg-white border-b">
                  <tr>
                    <th className="p-3 text-sm text-gray-500">Register No</th>
                    <th className="p-3 text-sm text-gray-500">Subject</th>
                    <th className="p-3 text-sm text-gray-500">Scored</th>
                  </tr>
                </thead>
                <tbody>
                  {previewData.slice(0, 5).map((row, i) => (
                    <tr key={i} className="border-b hover:bg-gray-50">
                      <td className="p-3 font-mono text-indigo-600">{row.registerNo}</td>
                      <td className="p-3">{row.subject}</td>
                      <td className="p-3 font-bold">{row.scored}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}

      {/* ================= TABLE MODE ================= */}
      {activeTab === 'table' && (
        <div className="animate-fade-in space-y-6">
          <h2 className="text-2xl font-bold flex items-center gap-2">✏️ Enter Marks Manually</h2>

          {/* Controls */}
          <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200 grid grid-cols-1 md:grid-cols-3 gap-6 items-end">
            <div>
              <label className="block text-sm font-bold text-gray-700 mb-2">🏷️ Exam type</label>
              <input className="w-full border p-2 rounded outline-none focus:ring-2 focus:ring-indigo-500" value={tableExam} onChange={e => setTableExam(e.target.value)} />
            </div>
            <div>
              <label className="block text-sm font-bold text-gray-700 mb-2">🎯 Max marks</label>
              <input type="number" className="w-full border p-2 rounded outline-none focus:ring-2 focus:ring-indigo-500" value={tableMax} onChange={e => setTableMax(Number(e.target.value))} />
            </div>
            
            <div className="flex flex-col">
               <label className="block text-sm font-bold text-gray-700 mb-2">Subject Name</label>
               <div className="flex gap-2">
                 <input className="w-full border p-2 rounded outline-none focus:ring-2 focus:ring-indigo-500" value={tableSubject} onChange={e => setTableSubject(e.target.value)} />
                 <button onClick={applyTableSettings} className="bg-green-600 text-white px-4 rounded font-bold hover:bg-green-700">+ Set</button>
               </div>
            </div>
          </div>

          {/* Table */}
          <div className="bg-white shadow rounded-lg overflow-x-auto border border-gray-200">
            <table className="w-full text-left border-collapse">
              <thead className="bg-gray-100 text-gray-700">
                <tr>
                  <th className="p-4 border-b w-40">Reg No</th>
                  <th className="p-4 border-b">Name</th>
                  <th className="p-4 border-b w-48 bg-indigo-50 text-indigo-900 border-l-4 border-indigo-500">{tableSubject}</th>
                </tr>
              </thead>
              <tbody>
                {entries.map((row, i) => (
                  <tr key={row.studentId} className="hover:bg-gray-50 border-b">
                    <td className="p-4 font-mono font-bold text-gray-600">{row.registerNo}</td>
                    <td className="p-4">{row.name}</td>
                    <td className="p-0 relative h-14 bg-indigo-50/20">
                      <input 
                        type="number" 
                        placeholder="-" 
                        className="w-full h-full text-center font-bold text-indigo-700 bg-transparent focus:bg-indigo-100 outline-none text-xl" 
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
      )}

      {/* --- SAVE BUTTON (Shared) --- */}
      <div className="mt-8 sticky bottom-6">
        <button 
          onClick={handleUpload} 
          disabled={uploading}
          className="w-full bg-indigo-600 text-white py-4 rounded-xl font-bold text-xl shadow-lg hover:bg-indigo-700 disabled:opacity-50 transition transform active:scale-95"
        >
          {uploading ? "📤 Uploading..." : "📤 Upload Marks"}
        </button>
      </div>
    </div>
  );
}
