'use client';

import { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';

export default function MarksEntryPage() {
  const { data: session } = useSession();
  const router = useRouter();
  const [students, setStudents] = useState<any[]>([]);
  
  // NEW STATE: Max Marks
  const [subject, setSubject] = useState('');
  const [maxMarks, setMaxMarks] = useState(100); 
  const [marks, setMarks] = useState<Record<string, string>>({}); 
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    fetch('/api/admin/students')
      .then(res => res.json())
      .then(data => setStudents(data));
  }, []);

  const handleMarkChange = (studentId: string, value: string) => {
    setMarks(prev => ({ ...prev, [studentId]: value }));
  };

  const handleSubmit = async () => {
    if (!subject) return alert("Please enter a Subject Name first!");
    
    setLoading(true);
    const marksPayload = Object.entries(marks).map(([studentId, mark]) => ({
      studentId,
      registerNo: students.find(s => s.id === studentId)?.registerNo,
      subject,
      mark: Number(mark),
      maxMarks: Number(maxMarks) // SEND MAX MARKS TO API
    })).filter(entry => entry.mark > 0); 

    try {
      const res = await fetch('/api/marks/add-bulk', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ marks: marksPayload })
      });

      if (res.ok) {
        alert('Marks Uploaded Successfully!');
        router.push('/admin/marks'); 
      } else {
        alert('Failed to upload marks');
      }
    } catch (e) {
      console.error(e);
      alert('Error uploading marks');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ padding: '40px', background: '#f3f4f6', minHeight: '100vh' }}>
      <div style={{ maxWidth: '1000px', margin: '0 auto', background: 'white', borderRadius: '20px', padding: '30px', boxShadow: '0 4px 20px rgba(0,0,0,0.1)' }}>
        
        <h1 style={{ fontSize: '24px', fontWeight: 'bold', marginBottom: '20px' }}>📝 Enter Marks</h1>

        {/* INPUTS ROW */}
        <div style={{ display: 'flex', gap: '20px', marginBottom: '20px' }}>
          
          {/* Subject Input */}
          <div style={{ flex: 2, padding: '20px', background: '#eff6ff', borderRadius: '12px', border: '1px solid #bfdbfe' }}>
            <label style={{ display: 'block', fontWeight: 'bold', marginBottom: '8px', color: '#1e40af' }}>Subject Name</label>
            <input 
              type="text" 
              value={subject}
              onChange={(e) => setSubject(e.target.value)}
              placeholder="e.g. Mathematics"
              style={{ width: '100%', padding: '12px', borderRadius: '8px', border: '1px solid #93c5fd', fontSize: '16px' }}
            />
          </div>

          {/* Max Marks Input */}
          <div style={{ flex: 1, padding: '20px', background: '#fff7ed', borderRadius: '12px', border: '1px solid #fed7aa' }}>
            <label style={{ display: 'block', fontWeight: 'bold', marginBottom: '8px', color: '#c2410c' }}>Max Marks</label>
            <input 
              type="number" 
              value={maxMarks}
              onChange={(e) => setMaxMarks(Number(e.target.value))}
              placeholder="100"
              style={{ width: '100%', padding: '12px', borderRadius: '8px', border: '1px solid #fdba74', fontSize: '16px', fontWeight: 'bold' }}
            />
          </div>

        </div>

        {/* Students Table */}
        <table style={{ width: '100%', borderCollapse: 'collapse', marginBottom: '20px' }}>
          <thead>
            <tr style={{ background: '#f9fafb', borderBottom: '2px solid #e5e7eb' }}>
              <th style={{ padding: '12px', textAlign: 'left' }}>Register No</th>
              <th style={{ padding: '12px', textAlign: 'left' }}>Student Name</th>
              <th style={{ padding: '12px', textAlign: 'left' }}>Mark (Out of {maxMarks})</th>
            </tr>
          </thead>
          <tbody>
            {students.map(student => (
              <tr key={student.id} style={{ borderBottom: '1px solid #e5e7eb' }}>
                <td style={{ padding: '12px', fontFamily: 'monospace' }}>{student.registerNo}</td>
                <td style={{ padding: '12px' }}>{student.name}</td>
                <td style={{ padding: '12px' }}>
                  <input 
                    type="number" 
                    placeholder="0"
                    onChange={(e) => handleMarkChange(student.id, e.target.value)}
                    style={{ padding: '8px', width: '80px', borderRadius: '6px', border: '1px solid #d1d5db' }}
                  />
                </td>
              </tr>
            ))}
          </tbody>
        </table>

        <button 
          onClick={handleSubmit}
          disabled={loading}
          style={{ width: '100%', padding: '15px', background: '#2563eb', color: 'white', border: 'none', borderRadius: '10px', fontSize: '16px', fontWeight: 'bold', cursor: 'pointer' }}
        >
          {loading ? 'Saving...' : '🚀 Save All Marks'}
        </button>

      </div>
    </div>
  );
}