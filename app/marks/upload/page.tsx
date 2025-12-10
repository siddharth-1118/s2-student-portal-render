'use client';

import React, { useState, useEffect } from "react";
import Papa from "papaparse";
import { NotificationSetup } from "@/app/marks/NotificationSetup";

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
  scored: number | null | string; // Allow string for input handling
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

  // Load students on component mount
  useEffect(() => {
    const loadStudents = async () => {
      try {
        // Adjust API path if needed (e.g., /api/admin/students)
        const res = await fetch("/api/admin/students"); 
        if (!res.ok) throw new Error("Failed to fetch students");
        
        const studentsData = await res.json();
        setStudents(studentsData.map((s: any) => ({
          id: s.id,
          name: s.name,
          registerNo: s.registerNo
        })));
        
        // Initialize marks data for table view
        const initialMarksData: MarkEntry[] = studentsData.flatMap((student: any) => 
          subjects.map(subject => ({
            studentId: student.id,
            registerNo: student.registerNo,
            name: student.name,
            subject,
            scored: '', // Start empty
            maxMarks: 100,
            examType: "Internal"
          }))
        );
        setMarksData(initialMarksData);
      } catch (error) {
        console.error("Failed to load students:", error);
      }
    };

    loadStudents();
  }, []); // Run once on mount

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const f = e.target.files?.[0] || null;
    setFile(f);
    setStatus(null);
    
    // Preview the CSV data
    if (f) {
      Papa.parse(f, {
        header: true,
        skipEmptyLines: true,
        complete: (results) => {
          setPreviewData(results.data as Row[]);
        }
      });
    } else {
      setPreviewData([]);
    }
  };

  const parseCsvFile = (file: File): Promise<Row[]> => {
    return new Promise((resolve, reject) => {
      Papa.parse(file, {
        header: true,
        skipEmptyLines: true,
        complete: (results) => {
          if (results.errors && results.errors.length > 0) {
            reject(results.errors[0]);
          } else {
            resolve(results.data as Row[]);
          }
        },
        error: (err) => reject(err),
      });
    });
  };

  const handleCsvUpload = async () => {
    if (!file) {
      setStatus("Please select a CSV file first.");
      return;
    }

    setLoading(true);
    setStatus(null);

    try {
      const rows = await parseCsvFile(file);

      // Map CSV rows to standard Marks format if API expects 'marks'
      // Or send 'rows' if your API logic parses it manually.
      // Assuming we send 'marks' array based on previous logic:
      const body = {
        marks: rows.map(r => ({
            registerNo: Object.values(r)[0], // Assuming first col is RegNo
            // You might need smarter mapping here depending on CSV structure
            ...r, 
            examType, 
            maxMarks 
        })), 
        rows, // Sending rows too just in case your API uses this
        examType,
        maxMarks,
      };

      const res = await fetch("/api/marks/upload", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });

      const data = await res.json();

      if (!res.ok) {
        setStatus(data?.error || `Upload failed with status ${res.status}`);
        return;
      }

      setStatus(
        `✅ Upload successful! Created: ${data.createdCount || 0}, Updated: ${data.updatedCount || 0}.`
      );
      
      setFile(null);
      setPreviewData([]);
    } catch (err: any) {
      console.error(err);
      setStatus("❌ Unexpected error while uploading. Check console/logs.");
    } finally {
      setLoading(false);
    }
  };

  // Table-based functions
  const addSubject = () => {
    const newSubject = `Subject ${subjects.length + 1}`;
    setSubjects([...subjects, newSubject]);
    
    // Add new subject column for all students
    const newMarksData = [...marksData];
    students.forEach(student => {
      newMarksData.push({
        studentId: student.id,
        registerNo: student.registerNo,
        name: student.name,
        subject: newSubject,
        scored: '',
        maxMarks: 100,
        examType: "Internal"
      });
    });
    setMarksData(newMarksData);
  };

  const removeSubject = (subjectToRemove: string) => {
    if (subjects.length <= 1) {
      alert("You must have at least one subject.");
      return;
    }
    
    setSubjects(subjects.filter(s => s !== subjectToRemove));
    setMarksData(marksData.filter(m => m.subject !== subjectToRemove));
  };

  const updateMark = (studentId: number, subject: string, field: keyof MarkEntry, value: any) => {
    setMarksData(prev => 
      prev.map(mark => 
        mark.studentId === studentId && mark.subject === subject 
          ? { ...mark, [field]: value } 
          : mark
      )
    );
  };

  // --- FIXED FUNCTION ---
  const handleTableUpload = async () => {
    setLoading(true);
    setStatus(null);

    try {
      // Filter out entries with empty scores
      const validMarks = marksData.filter(m => m.scored !== null && m.scored !== '' && m.scored !== undefined);
      
      if (validMarks.length === 0) {
        setStatus("Please enter at least one mark before uploading.");
        setLoading(false);
        return;
      }

      // Construct payload directly
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
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });

      const data = await res.json();

      if (!res.ok) {
        setStatus(`Failed to upload: ${data.error}`);
      } else {
        setStatus(
          `✅ Upload successful! Created: ${data.createdCount || 0}, Updated: ${data.updatedCount || 0}.`
        );
      }
    } catch (err: any) {
      console.error(err);
      setStatus("❌ Unexpected error while uploading.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ minHeight: '100vh', background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)', padding: '40px 20px' }}>
      <div style={{ maxWidth: '1200px', margin: '0 auto' }}>
        <div style={{ background: 'rgba(255, 255, 255, 0.95)', backdropFilter: 'blur(10px)', borderRadius: '20px', padding: '32px', marginBottom: '32px', boxShadow: '0 8px 32px rgba(0, 0, 0, 0.1)' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '20px', marginBottom: '24px' }}>
            <div>
              <h1 style={{ fontSize: '32px', fontWeight: 'bold', marginBottom: '8px', background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>
                📤 Upload Marks
              </h1>
              <p style={{ fontSize: '14px', color: '#6b7280' }}>
                Upload student marks via CSV file or table entry
              </p>
            </div>
          </div>
          
          {/* Tab Navigation */}
          <div style={{ display: 'flex', marginBottom: '24px', borderBottom: '1px solid #e5e7eb' }}>
            <button
              onClick={() => setActiveTab("csv")}
              style={{
                padding: '12px 24px',
                background: activeTab === "csv" ? 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)' : 'transparent',
                color: activeTab === "csv" ? 'white' : '#6b7280',
                border: 'none',
                borderBottom: activeTab === "csv" ? '3px solid #667eea' : 'none',
                borderRadius: '8px 8px 0 0',
                cursor: 'pointer',
                fontWeight: activeTab === "csv" ? '600' : 'normal'
              }}
            >
              CSV Upload
            </button>
            <button
              onClick={() => setActiveTab("table")}
              style={{
                padding: '12px 24px',
                background: activeTab === "table" ? 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)' : 'transparent',
                color: activeTab === "table" ? 'white' : '#6b7280',
                border: 'none',
                borderBottom: activeTab === "table" ? '3px solid #667eea' : 'none',
                borderRadius: '8px 8px 0 0',
                cursor: 'pointer',
                fontWeight: activeTab === "table" ? '600' : 'normal'
              }}
            >
              Table Entry
            </button>
          </div>

          {/* Notification Setup for Admins */}
          <NotificationSetup />

          {activeTab === "csv" ? (
            <>
              <div style={{ marginBottom: '24px' }}>
                <label style={{ display: 'block', marginBottom: '8px', fontWeight: '600', color: '#374151' }}>
                  📄 CSV file (with headers)
                </label>
                <div style={{ 
                  border: '2px dashed #d1d5db', 
                  borderRadius: '8px', 
                  padding: '24px', 
                  textAlign: 'center', 
                  backgroundColor: '#f9fafb',
                  transition: 'all 0.3s'
                }}>
                  <input 
                    type="file" 
                    accept=".csv" 
                    onChange={handleFileChange} 
                    style={{ display: 'none' }} 
                    id="file-upload"
                  />
                  <label htmlFor="file-upload" style={{ cursor: 'pointer' }}>
                    <div style={{ fontSize: '48px', marginBottom: '12px' }}>📁</div>
                    <p style={{ marginBottom: '8px', color: '#374151' }}>
                      {file ? file.name : 'Click to select a CSV file'}
                    </p>
                    <p style={{ fontSize: '12px', color: '#6b7280' }}>
                      CSV should contain Register Number and subject columns
                    </p>
                  </label>
                </div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px', marginBottom: '24px' }}>
                <div>
                  <label style={{ display: 'block', marginBottom: '8px', fontWeight: '600', color: '#374151' }}>
                    🏷️ Exam type
                  </label>
                  <input
                    type="text"
                    value={examType}
                    onChange={(e) => setExamType(e.target.value)}
                    style={{ width: '100%', padding: '12px 16px', border: '2px solid #e5e7eb', borderRadius: '8px', fontSize: '14px', outline: 'none' }}
                  />
                </div>

                <div>
                  <label style={{ display: 'block', marginBottom: '8px', fontWeight: '600', color: '#374151' }}>
                    🎯 Max marks
                  </label>
                  <input
                    type="number"
                    value={maxMarks}
                    onChange={(e) => setMaxMarks(Number(e.target.value))}
                    style={{ width: '100%', padding: '12px 16px', border: '2px solid #e5e7eb', borderRadius: '8px', fontSize: '14px', outline: 'none' }}
                  />
                </div>
              </div>

              <button
                onClick={handleCsvUpload}
                disabled={loading}
                style={{ 
                  width: '100%',
                  padding: '14px', 
                  background: loading ? '#9ca3af' : 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)', 
                  color: 'white', 
                  border: 'none', 
                  borderRadius: '12px', 
                  fontSize: '16px', 
                  fontWeight: '600', 
                  cursor: loading ? 'not-allowed' : 'pointer',
                  boxShadow: '0 4px 12px rgba(102, 126, 234, 0.4)',
                  transition: 'all 0.3s'
                }}
              >
                {loading ? 'Uploading...' : '📤 Upload Marks'}
              </button>

              {previewData.length > 0 && (
                <div style={{ background: 'rgba(255, 255, 255, 0.95)', backdropFilter: 'blur(10px)', borderRadius: '20px', padding: '32px', boxShadow: '0 8px 32px rgba(0, 0, 0, 0.1)', marginTop: '24px' }}>
                  <h2 style={{ fontSize: '24px', fontWeight: 'bold', marginBottom: '16px', color: '#111827' }}>📋 CSV Preview</h2>
                  <div style={{ maxHeight: '400px', overflowY: 'auto' }}>
                    <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                      <thead>
                        <tr style={{ backgroundColor: '#f3f4f6', position: 'sticky', top: 0 }}>
                          {Object.keys(previewData[0]).map((header) => (
                            <th key={header} style={{ padding: '12px', textAlign: 'left', borderBottom: '2px solid #e5e7eb', fontWeight: '600', color: '#374151' }}>
                              {header}
                            </th>
                          ))}
                        </tr>
                      </thead>
                      <tbody>
                        {previewData.map((row, rowIndex) => (
                          <tr key={rowIndex} style={{ borderBottom: '1px solid #e5e7eb' }}>
                            {Object.values(row).map((cell, cellIndex) => (
                              <td key={cellIndex} style={{ padding: '12px', color: '#374151' }}>
                                {String(cell)}
                              </td>
                            ))}
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}
            </>
          ) : (
            // Table Entry Tab
            <div>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
                <h2 style={{ fontSize: '24px', fontWeight: 'bold', color: '#111827' }}>✏️ Enter Marks Manually</h2>
                <button
                  onClick={addSubject}
                  style={{
                    padding: '8px 16px',
                    background: 'linear-gradient(135deg, #10b981 0%, #059669 100%)',
                    color: 'white',
                    border: 'none',
                    borderRadius: '8px',
                    cursor: 'pointer',
                    fontWeight: '600'
                  }}
                >
                  + Add Subject
                </button>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px', marginBottom: '24px' }}>
                <div>
                  <label style={{ display: 'block', marginBottom: '8px', fontWeight: '600', color: '#374151' }}>🏷️ Exam type</label>
                  <input
                    type="text"
                    value={examType}
                    onChange={(e) => {
                      setExamType(e.target.value);
                      setMarksData(prev => prev.map(m => ({ ...m, examType: e.target.value })));
                    }}
                    style={{ width: '100%', padding: '12px 16px', border: '2px solid #e5e7eb', borderRadius: '8px', fontSize: '14px', outline: 'none' }}
                  />
                </div>
                <div>
                  <label style={{ display: 'block', marginBottom: '8px', fontWeight: '600', color: '#374151' }}>🎯 Max marks</label>
                  <input
                    type="number"
                    value={maxMarks}
                    onChange={(e) => {
                      setMaxMarks(Number(e.target.value));
                      setMarksData(prev => prev.map(m => ({ ...m, maxMarks: Number(e.target.value) })));
                    }}
                    style={{ width: '100%', padding: '12px 16px', border: '2px solid #e5e7eb', borderRadius: '8px', fontSize: '14px', outline: 'none' }}
                  />
                </div>
              </div>

              <div style={{ maxHeight: '500px', overflowY: 'auto', marginBottom: '24px' }}>
                <div style={{ overflowX: 'auto' }}>
                  <table style={{ width: '100%', borderCollapse: 'collapse', minWidth: '800px' }}>
                    <thead>
                      <tr style={{ backgroundColor: '#f3f4f6', position: 'sticky', top: 0 }}>
                        <th style={{ padding: '12px', textAlign: 'left', borderBottom: '2px solid #e5e7eb', fontWeight: '600', color: '#374151' }}>Reg No</th>
                        <th style={{ padding: '12px', textAlign: 'left', borderBottom: '2px solid #e5e7eb', fontWeight: '600', color: '#374151' }}>Name</th>
                        {subjects.map((subject) => (
                          <th key={subject} style={{ padding: '12px', textAlign: 'center', borderBottom: '2px solid #e5e7eb', fontWeight: '600', color: '#374151' }}>
                            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px' }}>
                              {subject}
                              {subjects.length > 1 && (
                                <button
                                  onClick={() => removeSubject(subject)}
                                  style={{ background: '#ef4444', color: 'white', border: 'none', borderRadius: '50%', width: '20px', height: '20px', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '12px' }}
                                >
                                  ×
                                </button>
                              )}
                            </div>
                          </th>
                        ))}
                      </tr>
                    </thead>
                    <tbody>
                      {students.map((student) => (
                        <tr key={student.id} style={{ borderBottom: '1px solid #e5e7eb' }}>
                          <td style={{ padding: '12px', fontFamily: 'monospace', color: '#374151' }}>{student.registerNo}</td>
                          <td style={{ padding: '12px', color: '#374151' }}>{student.name}</td>
                          {subjects.map((subject) => {
                            const markEntry = marksData.find(m => m.studentId === student.id && m.subject === subject);
                            return (
                              <td key={subject} style={{ padding: '12px', textAlign: 'center' }}>
                                <input
                                  type="number"
                                  value={markEntry?.scored || ''}
                                  onChange={(e) => updateMark(student.id, subject, 'scored', e.target.value)}
                                  style={{ width: '80px', padding: '8px', border: '1px solid #d1d5db', borderRadius: '4px', textAlign: 'center' }}
                                  placeholder="-"
                                />
                              </td>
                            );
                          })}
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>

              <button
                onClick={handleTableUpload}
                disabled={loading}
                style={{ 
                  width: '100%',
                  padding: '14px', 
                  background: loading ? '#9ca3af' : 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)', 
                  color: 'white', 
                  border: 'none', 
                  borderRadius: '12px', 
                  fontSize: '16px', 
                  fontWeight: '600', 
                  cursor: loading ? 'not-allowed' : 'pointer',
                  boxShadow: '0 4px 12px rgba(102, 126, 234, 0.4)',
                  transition: 'all 0.3s'
                }}
              >
                {loading ? 'Saving Marks...' : '💾 Save Marks'}
              </button>
            </div>
          )}

          {status && (
            <div style={{ 
              marginTop: '20px',
              padding: '16px',
              borderRadius: '8px',
              backgroundColor: status.includes('✅') ? '#dcfce7' : status.includes('❌') ? '#fee2e2' : '#fffbeb',
              border: `1px solid ${status.includes('✅') ? '#bbf7d0' : status.includes('❌') ? '#fecaca' : '#fde68a'}`,
              color: status.includes('✅') ? '#166534' : status.includes('❌') ? '#991b1b' : '#854d0e'
            }}>
              {status}
            </div>
          )}
        </div>
      </div>
      
      <style jsx>{`
        @keyframes spin {
          0% { transform: rotate(0deg); }
          100% { transform: rotate(360deg); }
        }
      `}</style>
    </div>
  );
}