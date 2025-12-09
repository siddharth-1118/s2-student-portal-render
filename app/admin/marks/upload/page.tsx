'use client';

import { useState } from 'react';
import * as XLSX from 'xlsx';

export default function SmartMarksUpload() {
  const [file, setFile] = useState<File | null>(null);
  const [previewData, setPreviewData] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);

  // 1. Handle File Selection & "AI" Parsing
  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0];
    if (!selectedFile) return;
    setFile(selectedFile);

    const reader = new FileReader();
    reader.onload = (evt) => {
      const bstr = evt.target?.result;
      if (!bstr) return;

      const wb = XLSX.read(bstr, { type: 'binary' });
      const wsname = wb.SheetNames[0];
      const ws = wb.Sheets[wsname];
      
      // FIX: Pass 'ws' (worksheet) here, not 'data'
      const data = XLSX.utils.sheet_to_json(ws);
      
      console.log("Raw Data:", data); // Debugging
      analyzeAndMapData(data);
    };
    reader.readAsBinaryString(selectedFile);
  };

  // 2. "AI" Analysis: Find correct columns automatically
  const analyzeAndMapData = (rawData: any[]) => {
    if (rawData.length === 0) return;

    // Look at the first row to find keys
    const headers = Object.keys(rawData[0]);
    
    // Find the column that looks like a Register Number (contains 'reg', 'no', 'id')
    const regKey = headers.find(h => /reg|no|id/i.test(h)) || headers[0];
    
    // Assume other columns are Subjects (ignoring name/reg no)
    const subjectKeys = headers.filter(h => h !== regKey && !/name|student/i.test(h));

    // Reformat data for the preview table
    const formatted = [];
    for (const row of rawData) {
      const registerNo = row[regKey];
      for (const subject of subjectKeys) {
        formatted.push({
          registerNo: String(registerNo).trim(),
          subject: subject,
          scored: row[subject],
          maxMarks: 100, // Default to 100
          examType: "Internal" // Default
        });
      }
    }
    setPreviewData(formatted);
  };

  // 3. Upload to Server
  const handleUpload = async () => {
    if (previewData.length === 0) return alert("No valid data found in file.");
    
    setLoading(true);
    try {
      const res = await fetch('/api/admin/marks/upload', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ marks: previewData })
      });

      if (res.ok) {
        alert(`✅ Successfully uploaded ${previewData.length} marks!`);
        setPreviewData([]);
        setFile(null);
      } else {
        alert("❌ Failed to upload. Check server logs.");
      }
    } catch (error) {
      console.error(error);
      alert("Error uploading file.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-8 max-w-5xl mx-auto min-h-screen bg-gray-50">
      <h1 className="text-3xl font-bold mb-2 text-indigo-700">📂 Upload Marks File</h1>
      <p className="text-gray-500 mb-8">Upload an Excel or CSV file. The AI will automatically detect Student IDs and Marks.</p>

      {/* File Drop Zone */}
      <div className="bg-white p-8 rounded-xl shadow-md border-2 border-dashed border-indigo-200 text-center">
        <input 
          type="file" 
          accept=".csv, .xlsx, .xls"
          onChange={handleFileChange}
          className="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-indigo-50 file:text-indigo-700 hover:file:bg-indigo-100"
        />
        <p className="mt-2 text-xs text-gray-400">Supported: .xlsx, .csv</p>
      </div>

      {/* Preview Table */}
      {previewData.length > 0 && (
        <div className="mt-8">
          <h2 className="text-xl font-bold mb-4">👀 AI Preview (Check before saving)</h2>
          <div className="bg-white shadow rounded-lg overflow-hidden max-h-96 overflow-y-auto">
            <table className="w-full text-left">
              <thead className="bg-gray-100 sticky top-0">
                <tr>
                  <th className="p-3 font-bold">Register No</th>
                  <th className="p-3 font-bold">Subject</th>
                  <th className="p-3 font-bold">Scored</th>
                </tr>
              </thead>
              <tbody>
                {previewData.map((row, i) => (
                  <tr key={i} className="border-b hover:bg-gray-50">
                    <td className="p-3 font-mono text-blue-600">{row.registerNo}</td>
                    <td className="p-3">{row.subject}</td>
                    <td className="p-3 font-bold">{row.scored}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <div className="mt-6 flex justify-end">
            <button 
              onClick={handleUpload}
              disabled={loading}
              className="bg-green-600 text-white px-8 py-3 rounded-lg font-bold hover:bg-green-700 shadow-lg disabled:opacity-50"
            >
              {loading ? "Uploading & Notifying..." : "✅ Confirm & Send to Students"}
            </button>
          </div>
        </div>
      )}
    </div>
  );
}