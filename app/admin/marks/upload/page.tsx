'use client';

import React, { useState, useEffect } from "react";
import Papa from "papaparse";
import NotificationButton from "@/components/NotificationButton"; // Ensure this path is correct

type Row = Record<string, any>;

type Student = {
  id: number;
  name: string;
  registerNo: string;
};

type MarkEntry = {
  studentId: number;
  registerNo: string;
  name: string;
  subject: string;
  scored: number | null | string;
  maxMarks: number;
  examType: string;
};

export default function MarksUploadPage() {
  const [file, setFile] = useState<File | null>(null);
  const [examType, setExamType] = useState("Internal");
  const [maxMarks, setMaxMarks] = useState(100);
  const [status, setStatus] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [previewData, setPreviewData] = useState<Row[]>([]);
  const [students, setStudents] = useState<Student[]>([]);
  const [subjects, setSubjects] = useState<string[]>(["Mathematics"]);
  const [marksData, setMarksData] = useState<MarkEntry[]>([]);
  const [activeTab, setActiveTab] = useState<"csv" | "table">("csv");

  useEffect(() => {
    const loadStudents = async () => {
      try {
        const res = await fetch("/api/admin/students");
        if (!res.ok) return;
        
        const studentsData = await res.json();
        setStudents(studentsData.map((s: any) => ({
          id: s.id, name: s.name, registerNo: s.registerNo
        })));
        
        const initialMarksData: MarkEntry[] = studentsData.flatMap((student: any) => 
          subjects.map(subject => ({
            studentId: student.id, registerNo: student.registerNo, name: student.name,
            subject, scored: '', maxMarks: 100, examType: "Internal"
          }))
        );
        setMarksData(initialMarksData);
      } catch (error) { console.error("Failed to load students", error); }
    };
    loadStudents();
  }, [subjects]); // Run when subjects change to keep table sync

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const f = e.target.files?.[0] || null;
    setFile(f);
    if (f) {
      Papa.parse(f, {
        header: true, skipEmptyLines: true,
        complete: (results) => setPreviewData(results.data as Row[])
      });
    }
  };

  const handleCsvUpload = async () => {
    if (!file) return setStatus("Please select a CSV file first.");
    setLoading(true);
    try {
      // Use Papa Parse locally inside function if needed, or re-use previewData
      // Simple mapping strategy:
      const body = {
        marks: previewData.map(r => ({
           // Simple assumption: First key is RegNo, find subject columns dynamically in real app
           // For now, passing raw data for API to handle or simple mapping
           registerNo: Object.values(r)[0],
           subject: "Mathematics", // Default or needs smart detection
           scored: Object.values(r)[1], // Default assumption
           examType, maxMarks
        }))
      };

      const res = await fetch("/api/marks/upload", {
        method: "POST", headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body)
      });
      if (res.ok) setStatus("✅ Upload Successful");
      else setStatus("❌ Upload Failed");
    } catch (e) { setStatus("❌ Error uploading"); }
    finally { setLoading(false); }
  };

  // --- MANUAL TABLE UPLOAD ---
  const handleTableUpload = async () => {
    setLoading(true);
    try {
      const validMarks = marksData.filter(m => m.scored !== '' && m.scored !== null);
      if (validMarks.length === 0) {
         setLoading(false); return setStatus("Enter at least one mark.");
      }

      const body = {
        marks: validMarks.map(mark => ({
          registerNo: mark.registerNo,
          subject: mark.subject,
          scored: Number(mark.scored),
          maxMarks: Number(mark.maxMarks),
          examType: mark.examType
        }))
      };

      const res = await fetch("/api/marks/upload", {
        method: "POST", headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body)
      });
      if (res.ok) setStatus("✅ Marks Saved Successfully!");
      else setStatus("❌ Failed to save marks.");
    } catch (e) { setStatus("❌ Error saving marks."); }
    finally { setLoading(false); }
  };

  return (
    <div className="p-8 max-w-6xl mx-auto min-h-screen bg-gray-50">
      <h1 className="text-3xl font-bold mb-6 text-indigo-700">📤 Upload Marks</h1>
      
      {/* TABS */}
      <div className="flex gap-4 mb-6 border-b">
        <button onClick={() => setActiveTab('csv')} className={`px-6 py-2 rounded-t-lg font-bold ${activeTab === 'csv' ? 'bg-indigo-600 text-white' : 'bg-gray-200'}`}>CSV Upload</button>
        <button onClick={() => setActiveTab('table')} className={`px-6 py-2 rounded-t-lg font-bold ${activeTab === 'table' ? 'bg-indigo-600 text-white' : 'bg-gray-200'}`}>Table Entry</button>
      </div>

      <div className="mb-6 p-4 bg-white rounded shadow flex justify-between">
         <span>Enable Notifications</span>
         <NotificationButton />
      </div>

      {activeTab === 'csv' && (
        <div className="bg-white p-6 rounded shadow">
           <input type="file" accept=".csv" onChange={handleFileChange} className="mb-4" />
           {previewData.length > 0 && <div className="text-sm text-green-600 font-bold mb-4">Preview: {previewData.length} rows loaded</div>}
           <div className="flex gap-4 mb-4">
              <input value={examType} onChange={e => setExamType(e.target.value)} className="border p-2 rounded" placeholder="Exam Type" />
              <input type="number" value={maxMarks} onChange={e => setMaxMarks(Number(e.target.value))} className="border p-2 rounded" placeholder="Max Marks" />
           </div>
           <button onClick={handleCsvUpload} disabled={loading} className="bg-indigo-600 text-white px-6 py-2 rounded font-bold">{loading ? "Uploading..." : "Upload CSV"}</button>
        </div>
      )}

      {activeTab === 'table' && (
        <div className="bg-white p-6 rounded shadow overflow-x-auto">
           <table className="w-full text-left border-collapse">
             <thead>
               <tr className="bg-gray-100">
                 <th className="p-3">Reg No</th><th className="p-3">Name</th>
                 {subjects.map(sub => <th key={sub} className="p-3">{sub}</th>)}
               </tr>
             </thead>
             <tbody>
               {students.map(s => (
                 <tr key={s.id} className="border-b">
                   <td className="p-3 font-mono">{s.registerNo}</td><td className="p-3">{s.name}</td>
                   {subjects.map(sub => {
                     const entry = marksData.find(m => m.studentId === s.id && m.subject === sub);
                     return (
                       <td key={sub} className="p-3">
                         <input 
                           className="border p-1 w-20 text-center" 
                           placeholder="-"
                           value={entry?.scored || ''}
                           onChange={e => {
                             const val = e.target.value;
                             setMarksData(prev => prev.map(m => m.studentId === s.id && m.subject === sub ? {...m, scored: val} : m));
                           }}
                         />
                       </td>
                     );
                   })}
                 </tr>
               ))}
             </tbody>
           </table>
           <button onClick={handleTableUpload} disabled={loading} className="mt-6 w-full bg-indigo-600 text-white py-3 rounded font-bold">{loading ? "Saving..." : "Save Marks"}</button>
        </div>
      )}
      
      {status && <div className="mt-4 p-4 bg-gray-100 border rounded text-center font-bold">{status}</div>}
    </div>
  );
}