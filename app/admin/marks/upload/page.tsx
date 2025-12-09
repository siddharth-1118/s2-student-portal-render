'use client';

import { useState } from 'react';

export default function AdminUploadMarks() {
  const [textInput, setTextInput] = useState('');
  const [parsedData, setParsedData] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);

  // 1. Parse Data for Preview Table
  const handlePreview = () => {
    if (!textInput.trim()) return;
    
    // Assumes format: RegisterNo, Subject, TestName, Scored, MaxMarks
    const rows = textInput.trim().split('\n').map(row => {
      const [registerNo, subject, examType, scored, maxMarks] = row.split(',').map(s => s.trim());
      return { registerNo, subject, examType, scored, maxMarks };
    });
    setParsedData(rows);
  };

  // 2. Upload Data & Send Notifications
  const handleUpload = async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/admin/marks/upload', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ marks: parsedData }),
      });

      if (res.ok) {
        alert("✅ Marks uploaded and Notifications sent!");
        setParsedData([]);
        setTextInput('');
      } else {
        alert("❌ Failed to upload marks.");
      }
    } catch (error) {
      console.error(error);
      alert("Error uploading.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-6 max-w-6xl mx-auto">
      <h1 className="text-3xl font-bold mb-6">📤 Upload Student Marks</h1>

      {/* Input Area */}
      <div className="bg-white p-6 rounded-lg shadow mb-8">
        <label className="block font-bold mb-2">Paste Data (CSV Format)</label>
        <p className="text-sm text-gray-500 mb-2">Format: RegisterNo, Subject, TestName, Scored, MaxMarks</p>
        <textarea
          className="w-full p-4 border rounded h-40 font-mono"
          placeholder="RA2111003010001, Math, CAT-1, 45, 50&#10;RA2111003010002, Physics, Cycle Test 2, 88, 100"
          value={textInput}
          onChange={(e) => setTextInput(e.target.value)}
        />
        <button 
          onClick={handlePreview}
          className="mt-4 bg-blue-600 text-white px-6 py-2 rounded hover:bg-blue-700"
        >
          Preview Table
        </button>
      </div>

      {/* PREVIEW TABLE (This was missing before!) */}
      {parsedData.length > 0 && (
        <div className="bg-white rounded-lg shadow overflow-hidden mb-6">
          <h2 className="p-4 bg-gray-50 font-bold border-b">Preview Data</h2>
          <table className="w-full text-left">
            <thead className="bg-gray-100">
              <tr>
                <th className="p-3">Register No</th>
                <th className="p-3">Subject</th>
                <th className="p-3">Test Name</th>
                <th className="p-3">Marks</th>
                <th className="p-3">Max Marks</th>
              </tr>
            </thead>
            <tbody>
              {parsedData.map((row, index) => (
                <tr key={index} className="border-b">
                  <td className="p-3 font-mono">{row.registerNo}</td>
                  <td className="p-3">{row.subject}</td>
                  <td className="p-3">{row.examType}</td>
                  <td className="p-3 font-bold">{row.scored}</td>
                  <td className="p-3">{row.maxMarks}</td>
                </tr>
              ))}
            </tbody>
          </table>
          
          <div className="p-4 bg-gray-50 border-t flex justify-end">
            <button 
              onClick={handleUpload}
              disabled={loading}
              className="bg-green-600 text-white px-8 py-3 rounded-lg font-bold hover:bg-green-700 disabled:opacity-50"
            >
              {loading ? "Uploading..." : "Confirm Upload & Notify Students"}
            </button>
          </div>
        </div>
      )}
    </div>
  );
}