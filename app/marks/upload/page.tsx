'use client';

import { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';

export default function MarksEntryPage() {
  const { data: session } = useSession();
  const router = useRouter();
  
  const [students, setStudents] = useState<any[]>([]);
  const [subject, setSubject] = useState('');
  const [globalMaxMarks, setGlobalMaxMarks] = useState(100); // Default for everyone
  
  // Store marks and custom max marks for each student
  const [marksData, setMarksData] = useState<Record<string, { scored: string, max: number }>>({});
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    fetch('/api/admin/students')
      .then(res => res.json())
      .then(data => setStudents(data));
  }, []);

  // Handle Input Changes
  const handleScoreChange = (studentId: string, scored: string) => {
    setMarksData(prev => ({
      ...prev,
      [studentId]: { 
        scored, 
        max: prev[studentId]?.max || globalMaxMarks // Keep existing max or use global
      }
    }));
  };

  const handleMaxMarkChange = (studentId: string, max: string) => {
    setMarksData(prev => ({
      ...prev,
      [studentId]: { 
        scored: prev[studentId]?.scored || '', // Keep existing score
        max: Number(max)
      }
    }));
  };

  const handleSubmit = async () => {
    if (!subject) return alert("Please enter a Subject Name first!");
    
    setLoading(true);

    // Prepare data
    const marksPayload = Object.entries(marksData).map(([studentId, data]) => ({
      studentId,
      registerNo: students.find(s => s.id === studentId)?.registerNo,
      subject,
      mark: Number(data.scored),
      maxMarks: Number(data.max || globalMaxMarks)
    })).filter(entry => entry.mark >= 0 && entry.mark !== null); // Ensure valid marks

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
      <div style={{ maxWidth: '1200px', margin: '0 auto', background: 'white', borderRadius: '20px', padding: '30px', boxShadow: '0 4px 20px rgba(0,0,0,0.1)' }}>
        
        <h1 style={{ fontSize: '24px', fontWeight: 'bold', marginBottom: '20px' }}>📝 Enter Marks</h1>

        {/* TOP CONTROLS */}
        <div style={{ display: 'flex', gap: '20px', marginBottom: '20px' }}>
          
          <div style={{ flex: 2 }}>
            <label style={{ display: 'block', fontWeight: 'bold', marginBottom: '8px', color: '#1e40af' }}>Subject Name</label>
            <input 
              type="text" 
              value={subject}
              onChange={(e) => setSubject(e.target.value)}
              placeholder="e.g. Mathematics"
              style={{ width: '100%', padding: '12px', borderRadius: '8px', border: '1px solid #93c5fd', fontSize: '16px' }}
            />
          </div>

          <div style={{ flex: 1 }}>
            <label style={{ display: 'block', fontWeight: 'bold', marginBottom: '8px', color: '#c2410c' }}>Default Max Marks</label>
            <input 
              type="number" 
              value={globalMaxMarks}
              onChange={(e) => setGlobalMaxMarks(Number(e.target.value))}
              style={{ width: '100%', padding: '12px', borderRadius: '8px', border: '1px solid #fdba74', fontSize: '16px', fontWeight: 'bold' }}
            />
            <small style={{ color: '#666' }}>Applies to all unless changed below</small>
          </div>

        </div>

        {/* TABLE */}
        <table style={{ width: '100%', borderCollapse: 'collapse', marginBottom: '20px' }}>
          <thead>
            <tr style={{ background: '#f9fafb', borderBottom: '2px solid #e5e7eb' }}>
              <th style={{ padding: '12px', textAlign: 'left' }}>Register No</th>
              <th style={{ padding: '12px', textAlign: 'left' }}>Student Name</th>
              {/* NEW COLUMN */}
              <th style={{ padding: '12px', textAlign: 'left', width: '150px' }}>Max Marks</th>
              {/* SCORED COLUMN */}
              <th style={{ padding: '12px', textAlign: 'left', width: '150px' }}>Scored Marks</th>
            </tr>
          </thead>
          <tbody>
            {students.map(student => (
              <tr key={student.id} style={{ borderBottom: '1px solid #e5e7eb' }}>
                <td style={{ padding: '12px', fontFamily: 'monospace' }}>{student.registerNo}</td>
                <td style={{ padding: '12px' }}>{student.name}</td>
                
                {/* Max Marks Input (Per Student) */}
                <td style={{ padding: '12px' }}>
                   <input 
                    type="number" 
                    value={marksData[student.id]?.max || globalMaxMarks}
                    onChange={(e) => handleMaxMarkChange(student.id, e.target.value)}
                    style={{ padding: '8px', width: '80px', borderRadius: '6px', border: '1px solid #fdba74', background: '#fff7ed' }}
                  />
                </td>

                {/* Scored Marks Input */}
                <td style={{ padding: '12px' }}>
                  <input 
                    type="number" 
                    placeholder="0"
                    onChange={(e) => handleScoreChange(student.id, e.target.value)}
                    style={{ padding: '8px', width: '80px', borderRadius: '6px', border: '2px solid #3b82f6', fontWeight: 'bold' }}
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