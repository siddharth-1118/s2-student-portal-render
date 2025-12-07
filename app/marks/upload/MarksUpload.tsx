'use client';

import { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';

const ADMIN_EMAILS = ['saisiddharthvooka@gmail.com', 'kothaig2@srmist.edu.in'];

export default function MarksUpload() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [mounted, setMounted] = useState(false);
  const [subject, setSubject] = useState('');
  const [examType, setExamType] = useState('CAT1');
  const [maxMarks, setMaxMarks] = useState('100');
  const [sheetUrl, setSheetUrl] = useState('');
  const [parsedData, setParsedData] = useState<any[]>([]);
  const [analysis, setAnalysis] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [uploading, setUploading] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (status === 'authenticated' && session && mounted) {
      if (!ADMIN_EMAILS.includes(session.user?.email || '')) {
        router.push('/');
      }
    }
  }, [session, status, mounted, router]);

  if (status === 'loading' || !mounted) {
    return (
      <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)' }}>
        <div style={{ width: '50px', height: '50px', border: '5px solid rgba(255,255,255,0.3)', borderTopColor: '#fff', borderRadius: '50%' }}></div>
      </div>
    );
  }

  if (!ADMIN_EMAILS.includes(session?.user?.email || '')) {
    return null;
  }

  const handleAnalyzeSheet = async () => {
    if (!sheetUrl.trim()) {
      alert('⚠️ Please enter a Google Sheets URL');
      return;
    }

    setLoading(true);
    try {
      const response = await fetch('/api/sheets/parse', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ sheetUrl }),
      });

      const result = await response.json();
      
      if (response.ok) {
        setParsedData(result.data);
        setAnalysis(result.analysis);
      } else {
        alert('❌ ' + (result.error || 'Failed to parse spreadsheet'));
      }
    } catch (error) {
      alert('❌ Error analyzing spreadsheet');
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const handleUploadMarks = async () => {
    if (!parsedData || parsedData.length === 0) {
      alert('⚠️ No data to upload');
      return;
    }

    if (!subject.trim()) {
      alert('⚠️ Please enter subject name');
      return;
    }

    setUploading(true);
    try {
      const response = await fetch('/api/marks/bulk-upload', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          marks: parsedData,
          subject,
          examType,
          maxMarks: parseInt(maxMarks)
        }),
      });

      if (response.ok) {
        alert(`✅ Marks uploaded successfully for ${parsedData.length} students!`);
        setParsedData([]);
        setAnalysis(null);
        setSheetUrl('');
        setSubject('');
      } else {
        const error = await response.json();
        alert('❌ ' + (error.message || 'Upload failed'));
      }
    } catch (error) {
      alert('❌ Error uploading marks');
      console.error(error);
    } finally {
      setUploading(false);
    }
  };

  return (
    <div style={{ minHeight: '100vh', background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)', padding: '40px 20px' }}>
      <div style={{ maxWidth: '1200px', margin: '0 auto' }}>
        <div style={{ textAlign: 'center', marginBottom: '40px' }}>
          <h1 style={{ fontSize: '42px', fontWeight: 'bold', color: 'white', marginBottom: '12px', textShadow: '0 2px 10px rgba(0,0,0,0.2)' }}>
            🤖 AI-Powered Marks Upload
          </h1>
          <p style={{ fontSize: '18px', color: 'rgba(255,255,255,0.9)' }}>
            Paste your Google Sheets link and let AI analyze and import the data
          </p>
        </div>

        <div style={{ background: 'white', borderRadius: '20px', padding: '32px', boxShadow: '0 20px 60px rgba(0,0,0,0.3)', marginBottom: '24px' }}>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '20px', marginBottom: '24px' }}>
            <div>
              <label style={{ display: 'block', fontSize: '14px', fontWeight: '600', color: '#374151', marginBottom: '8px' }}>📚 Subject Name</label>
              <input 
                type="text" 
                value={subject} 
                onChange={(e) => setSubject(e.target.value)} 
                placeholder="e.g., Mathematics" 
                style={{ width: '100%', padding: '10px 12px', border: '2px solid #e5e7eb', borderRadius: '8px', fontSize: '14px', outline: 'none' }} 
              />
            </div>
            <div>
              <label style={{ display: 'block', fontSize: '14px', fontWeight: '600', color: '#374151', marginBottom: '8px' }}>📝 Exam Type</label>
              <select 
                value={examType} 
                onChange={(e) => setExamType(e.target.value)} 
                style={{ width: '100%', padding: '10px 12px', border: '2px solid #e5e7eb', borderRadius: '8px', fontSize: '14px', outline: 'none' }}
              >
                <option value="CAT1">CAT 1</option>
                <option value="CAT2">CAT 2</option>
                <option value="SEM">Semester Exam</option>
                <option value="ASSIGNMENT">Assignment</option>
                <option value="QUIZ">Quiz</option>
              </select>
            </div>
            <div>
              <label style={{ display: 'block', fontSize: '14px', fontWeight: '600', color: '#374151', marginBottom: '8px' }}>💯 Max Marks</label>
              <input 
                type="number" 
                value={maxMarks} 
                onChange={(e) => setMaxMarks(e.target.value)} 
                placeholder="100" 
                style={{ width: '100%', padding: '10px 12px', border: '2px solid #e5e7eb', borderRadius: '8px', fontSize: '14px', outline: 'none' }} 
              />
            </div>
          </div>

          <div>
            <label style={{ display: 'block', fontSize: '14px', fontWeight: '600', color: '#374151', marginBottom: '8px' }}>🔗 Google Sheets URL</label>
            <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap' }}>
              <input 
                type="url" 
                value={sheetUrl} 
                onChange={(e) => setSheetUrl(e.target.value)} 
                placeholder="https://docs.google.com/spreadsheets/d/..." 
                style={{ flex: 1, minWidth: '250px', padding: '12px 16px', border: '2px solid #e5e7eb', borderRadius: '8px', fontSize: '14px', outline: 'none' }} 
              />
              <button 
                onClick={handleAnalyzeSheet} 
                disabled={loading} 
                style={{ 
                  padding: '12px 32px', 
                  background: loading ? '#9ca3af' : 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)', 
                  color: 'white', 
                  border: 'none', 
                  borderRadius: '8px', 
                  fontSize: '14px', 
                  fontWeight: '600', 
                  cursor: loading ? 'not-allowed' : 'pointer', 
                  boxShadow: '0 4px 12px rgba(102, 126, 234, 0.4)', 
                  whiteSpace: 'nowrap' 
                }}
              >
                {loading ? '🔄 Analyzing...' : '🤖 Analyze Sheet'}
              </button>
            </div>
            <p style={{ fontSize: '12px', color: '#6b7280', marginTop: '8px' }}>
              💡 Tip: Make sure your sheet is set to &quot;Anyone with the link can view&quot;
            </p>
          </div>
        </div>

        {analysis && (
          <div style={{ background: 'white', borderRadius: '20px', padding: '32px', boxShadow: '0 20px 60px rgba(0,0,0,0.3)' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '16px', marginBottom: '24px' }}>
              <div style={{ width: '60px', height: '60px', background: 'linear-gradient(135deg, #10b981 0%, #059669 100%)', borderRadius: '16px', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '28px' }}>
                ✅
              </div>
              <div>
                <h2 style={{ fontSize: '24px', fontWeight: 'bold', color: '#111827', marginBottom: '4px' }}>
                  AI Analysis Complete!
                </h2>
                <p style={{ fontSize: '14px', color: '#6b7280' }}>
                  {analysis.insights.suggestion}
                </p>
              </div>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '16px', marginBottom: '24px' }}>
              <div style={{ background: 'linear-gradient(135deg, #3b82f6 0%, #2563eb 100%)', borderRadius: '12px', padding: '20px', color: 'white' }}>
                <div style={{ fontSize: '14px', opacity: 0.9, marginBottom: '8px' }}>Total Students</div>
                <div style={{ fontSize: '32px', fontWeight: 'bold' }}>{analysis.totalStudents}</div>
              </div>
              <div style={{ background: 'linear-gradient(135deg, #8b5cf6 0%, #7c3aed 100%)', borderRadius: '12px', padding: '20px', color: 'white' }}>
                <div style={{ fontSize: '14px', opacity: 0.9, marginBottom: '8px' }}>Data Columns</div>
                <div style={{ fontSize: '32px', fontWeight: 'bold' }}>{analysis.columns.length}</div>
              </div>
              <div style={{ background: 'linear-gradient(135deg, #10b981 0%, #059669 100%)', borderRadius: '12px', padding: '20px', color: 'white' }}>
                <div style={{ fontSize: '14px', opacity: 0.9, marginBottom: '8px' }}>Ready to Upload</div>
                <div style={{ fontSize: '32px', fontWeight: 'bold' }}>✓</div>
              </div>
            </div>

            <div style={{ marginBottom: '24px' }}>
              <h3 style={{ fontSize: '18px', fontWeight: '600', color: '#111827', marginBottom: '12px' }}>
                📊 All Students ({parsedData.length})
              </h3>
              <div style={{ maxHeight: '400px', overflowY: 'auto', borderRadius: '8px', border: '1px solid #e5e7eb' }}>
                <table style={{ width: '100%', borderCollapse: 'collapse', minWidth: '500px' }}>
                  <thead style={{ position: 'sticky', top: 0 }}>
                    <tr style={{ background: '#f9fafb' }}>
                      <th style={{ padding: '12px', textAlign: 'center', fontSize: '12px', fontWeight: '600', color: '#374151', borderBottom: '2px solid #e5e7eb', width: '50px' }}>
                        #
                      </th>
                      {analysis.columns.map((col: string, idx: number) => (
                        <th key={idx} style={{ padding: '12px', textAlign: 'left', fontSize: '12px', fontWeight: '600', color: '#374151', borderBottom: '2px solid #e5e7eb' }}>
                          {col}
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {parsedData.map((row: any, idx: number) => (
                      <tr key={idx} style={{ borderBottom: '1px solid #e5e7eb', background: idx % 2 === 0 ? 'white' : '#f9fafb' }}>
                        <td style={{ padding: '12px', fontSize: '13px', color: '#374151', textAlign: 'center', fontWeight: '600' }}>
                          {idx + 1}
                        </td>
                        {analysis.columns.map((col: string, colIdx: number) => (
                          <td key={colIdx} style={{ padding: '12px', fontSize: '13px', color: '#6b7280' }}>
                            {row[col] || '-'}
                          </td>
                        ))}
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
              <p style={{ fontSize: '12px', color: '#6b7280', marginTop: '8px' }}>
                💡 Showing all {parsedData.length} students. Scroll to see more.
              </p>
              
              <button
                onClick={handleUploadMarks}
                disabled={uploading}
                style={{
                                    width: '100%',
                                    marginTop: '24px',
                                    padding: '16px',
                                    background: uploading ? '#9ca3af' : 'linear-gradient(135deg, #10b981 0%, #059669 100%)',
                                    color: 'white',
                                    border: 'none',
                                    borderRadius: '8px',
                                    fontSize: '14px',
                                    fontWeight: '600',
                                    cursor: uploading ? 'not-allowed' : 'pointer',
                                    boxShadow: '0 4px 12px rgba(16, 185, 129, 0.4)',
                                  }}
                                >
                                  {uploading ? '⏳ Uploading...' : '✅ Upload Marks'}
                                </button>
                              </div>
                            </div>
                          )}
                        </div>
                      </div>
                    );
                  }
