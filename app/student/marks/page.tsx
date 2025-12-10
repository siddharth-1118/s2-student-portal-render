'use client';

import { useState, useEffect } from 'react';

export default function StudentMarksPage() {
  const [marks, setMarks] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchMarks = async () => {
      try {
        const res = await fetch('/api/student/marks');
        if (res.ok) {
          const data = await res.json();
          setMarks(data);
        }
      } catch (error) {
        console.error('Failed to load marks');
      } finally {
        setLoading(false);
      }
    };

    fetchMarks();
  }, []);

  if (loading) return <div style={{ padding: '40px', textAlign: 'center' }}>Loading your marks...</div>;

  return (
    <div style={{ minHeight: '100vh', padding: '40px', background: '#f3f4f6' }}>
      <div style={{ maxWidth: '800px', margin: '0 auto' }}>
        
        <h1 style={{ fontSize: '28px', fontWeight: 'bold', marginBottom: '20px', color: '#111827' }}>
          📊 My Performance
        </h1>

        {marks.length === 0 ? (
          <div style={{ padding: '40px', background: 'white', borderRadius: '12px', textAlign: 'center', boxShadow: '0 4px 6px rgba(0,0,0,0.05)' }}>
            <h3 style={{ fontSize: '20px', fontWeight: 'bold', color: '#374151' }}>No marks yet</h3>
            <p style={{ color: '#6b7280' }}>Your marks have not been uploaded by the admin yet.</p>
          </div>
        ) : (
          <div style={{ background: 'white', borderRadius: '12px', overflow: 'hidden', boxShadow: '0 4px 6px rgba(0,0,0,0.05)' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
              <thead style={{ background: '#374151', color: 'white' }}>
                <tr>
                  <th style={{ padding: '16px' }}>Subject</th>
                  <th style={{ padding: '16px' }}>Exam Type</th>
                  <th style={{ padding: '16px' }}>Score</th>
                  <th style={{ padding: '16px' }}>Status</th>
                </tr>
              </thead>
              <tbody>
                {marks.map((entry) => (
                  <tr key={entry.id} style={{ borderBottom: '1px solid #e5e7eb' }}>
                    <td style={{ padding: '16px', fontWeight: '500' }}>{entry.subject}</td>
                    <td style={{ padding: '16px', color: '#6b7280' }}>{entry.examType || 'Internal'}</td>
                    <td style={{ padding: '16px', fontWeight: 'bold', fontSize: '18px' }}>
                      {/* 🛡️ FIX: Use 'scored' because that is your DB column name */}
                      {entry.scored} / {entry.maxMarks || 100}
                    </td>
                    <td style={{ padding: '16px' }}>
                      <span style={{
                        padding: '4px 10px',
                        borderRadius: '20px',
                        fontSize: '12px',
                        fontWeight: 'bold',
                        // Color logic: Green for Pass (>=50), Red for Fail
                        backgroundColor: entry.scored >= 50 ? '#dcfce7' : '#fee2e2',
                        color: entry.scored >= 50 ? '#166534' : '#991b1b',
                      }}>
                        {entry.scored >= 50 ? 'PASS' : 'FAIL'}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}