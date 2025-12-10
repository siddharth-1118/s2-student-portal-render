'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';

export default function MarksTerminal() {
  const router = useRouter();
  const [marksData, setMarksData] = useState<any[]>([]);
  const [editingId, setEditingId] = useState<string | number | null>(null);
  const [tempMark, setTempMark] = useState<number | string>('');

  const fetchMarks = async () => {
    try {
      const res = await fetch('/api/marks/list-all'); 
      const data = await res.json();
      setMarksData(data);
    } catch (error) {
      console.error('Failed to fetch marks', error);
    }
  };

  useEffect(() => {
    fetchMarks();
  }, []);

  // --- NEW: DELETE ALL FUNCTION ---
  const handleDeleteAll = async () => {
    // 1. Confirm with the user
    const confirmDelete = prompt("⚠️ DANGER: This will delete ALL marks for ALL students.\n\nType 'DELETE' to confirm.");
    
    if (confirmDelete === 'DELETE') {
      try {
        const res = await fetch('/api/admin/reset-students', { method: 'DELETE' });
        if (res.ok) {
          alert("All marks have been deleted.");
          window.location.reload(); // Refresh page to show empty table
        } else {
          alert("Failed to delete marks.");
        }
      } catch (error) {
        alert("Error connecting to server.");
      }
    }
  };

  // --- EXISTING FUNCTIONS ---
  const startEdit = (entry: any) => {
    setEditingId(entry.id);
    setTempMark(entry.scored);
  };

  const cancelEdit = () => {
    setEditingId(null);
    setTempMark('');
  };

  const saveEdit = async (id: number) => {
    try {
      const res = await fetch('/api/marks/update', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id, mark: Number(tempMark) }),
      });

      if (res.ok) {
        setMarksData(prev => 
          prev.map(item => item.id === id ? { ...item, scored: Number(tempMark) } : item)
        );
        setEditingId(null);
      } else {
        alert('Failed to update mark');
      }
    } catch (error) {
      alert('Error updating mark');
    }
  };

  const handleDelete = async (markId: number) => {
    if (!confirm('Are you sure you want to delete this mark entry?')) return;
    await fetch(`/api/marks/delete?id=${markId}`, { method: 'DELETE' });
    setMarksData(prev => prev.filter(m => m.id !== markId)); 
  };

  return (
    <div style={{ minHeight: '100vh', background: '#111827', color: '#e5e7eb', padding: '40px', fontFamily: 'monospace' }}>
      <div style={{ maxWidth: '1200px', margin: '0 auto' }}>
        
        {/* HEADER SECTION */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '30px' }}>
          <div>
            <h1 style={{ fontSize: '32px', color: '#4ade80' }}>&gt; ADMIN_MARKS_TERMINAL_</h1>
            <p style={{ color: '#9ca3af' }}>Manage, Edit, or Delete Student Marks</p>
          </div>
          
          {/* BUTTON GROUP */}
          <div style={{ display: 'flex', gap: '10px' }}>
            {/* NEW DELETE ALL BUTTON */}
            <button 
              onClick={handleDeleteAll}
              style={{ 
                padding: '10px 20px', 
                background: '#7f1d1d', // Dark Red
                color: '#fca5a5',      // Light Red Text
                border: '1px solid #ef4444', 
                borderRadius: '5px', 
                cursor: 'pointer',
                fontWeight: 'bold'
              }}
            >
              ⚠️ DELETE ALL
            </button>

            <button 
               onClick={() => router.push('/marks/upload')}
               style={{ padding: '10px 20px', background: '#374151', color: 'white', border: '1px solid #4b5563', borderRadius: '5px', cursor: 'pointer' }}
            >
              + ADD NEW MARKS
            </button>
          </div>
        </div>

        {/* TABLE SECTION */}
        <div style={{ background: '#1f2937', borderRadius: '8px', border: '1px solid #374151', overflow: 'hidden' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
            <thead style={{ background: '#374151', color: '#f3f4f6' }}>
              <tr>
                <th style={{ padding: '15px' }}>REG_NO</th>
                <th style={{ padding: '15px' }}>SUBJECT</th>
                <th style={{ padding: '15px' }}>SCORED</th>
                <th style={{ padding: '15px' }}>STATUS</th>
                <th style={{ padding: '15px', textAlign: 'right' }}>ACTIONS</th>
              </tr>
            </thead>
            <tbody>
              {marksData.length === 0 ? (
                 <tr>
                   <td colSpan={5} style={{ padding: '40px', textAlign: 'center', color: '#6b7280' }}>
                     System Empty. No marks found.
                   </td>
                 </tr>
              ) : (
                marksData.map((entry) => (
                  <tr key={entry.id} style={{ borderBottom: '1px solid #374151', backgroundColor: editingId === entry.id ? '#374151' : 'transparent' }}>
                    <td style={{ padding: '15px', color: '#60a5fa' }}>{entry.student?.registerNo || 'N/A'}</td>
                    <td style={{ padding: '15px' }}>{entry.subject}</td>
                    
                    {/* EDITABLE SCORE */}
                    <td style={{ padding: '15px' }}>
                      {editingId === entry.id ? (
                        <input 
                          type="number" 
                          value={tempMark}
                          onChange={(e) => setTempMark(e.target.value)}
                          style={{ background: '#111827', color: 'white', border: '1px solid #60a5fa', padding: '5px', width: '80px', borderRadius: '4px' }}
                        />
                      ) : (
                        <span style={{ fontWeight: 'bold', color: entry.scored < 50 ? '#f87171' : '#34d399' }}>
                          {entry.scored}
                        </span>
                      )}
                    </td>

                    <td style={{ padding: '15px' }}>
                       {editingId === entry.id ? (
                          <span style={{ color: '#9ca3af' }}>Editing...</span>
                       ) : (
                          <span style={{ 
                            padding: '2px 8px', 
                            borderRadius: '4px', 
                            background: entry.scored >= 50 ? 'rgba(52, 211, 153, 0.1)' : 'rgba(248, 113, 113, 0.1)',
                            color: entry.scored >= 50 ? '#34d399' : '#f87171',
                            fontSize: '12px'
                          }}>
                            {entry.scored >= 50 ? 'PASS' : 'FAIL'}
                          </span>
                       )}
                    </td>

                    <td style={{ padding: '15px', textAlign: 'right' }}>
                      {editingId === entry.id ? (
                        <>
                          <button onClick={() => saveEdit(entry.id)} style={{ marginRight: '10px', color: '#4ade80', background: 'none', border: 'none', cursor: 'pointer', fontWeight: 'bold' }}>[SAVE]</button>
                          <button onClick={cancelEdit} style={{ color: '#9ca3af', background: 'none', border: 'none', cursor: 'pointer' }}>[CANCEL]</button>
                        </>
                      ) : (
                        <>
                          <button onClick={() => startEdit(entry)} style={{ marginRight: '10px', color: '#60a5fa', background: 'none', border: 'none', cursor: 'pointer' }}>[EDIT]</button>
                          <button onClick={() => handleDelete(entry.id)} style={{ color: '#f87171', background: 'none', border: 'none', cursor: 'pointer' }}>[DELETE]</button>
                        </>
                      )}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}