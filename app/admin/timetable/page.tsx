'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';

export default function AdminTimetable() {
  const router = useRouter();
  const [entries, setEntries] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  // FETCH TIMETABLE
  useEffect(() => {
    const fetchTimetable = async () => {
      try {
        const res = await fetch('/api/timetable/list'); 
        const data = await res.json();
        setEntries(data);
      } catch (error) {
        console.error("Failed to load");
      } finally {
        setLoading(false);
      }
    };
    fetchTimetable();
  }, []);

  // DELETE FUNCTION
  const handleDelete = async (id: number) => {
    if (!confirm('⚠️ Delete this class?')) return;

    try {
      const res = await fetch(`/api/admin/timetable/delete?id=${id}`, {
        method: 'DELETE',
      });

      if (res.ok) {
        setEntries(prev => prev.filter(entry => entry.id !== id));
      } else {
        alert('Failed to delete.');
      }
    } catch (error) {
      alert('Server error.');
    }
  };

  if (loading) return <div style={{ padding: '40px', textAlign: 'center' }}>Loading...</div>;

  return (
    <div style={{ minHeight: '100vh', padding: '40px', background: '#f3f4f6' }}>
      <div style={{ maxWidth: '1000px', margin: '0 auto' }}>
        
        {/* HEADER */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '30px' }}>
          <div>
            <h1 style={{ fontSize: '28px', fontWeight: 'bold', color: '#1f2937' }}>📅 ADMIN TIMETABLE</h1>
            <p style={{ color: '#ef4444', fontWeight: 'bold' }}>You are in Admin Mode (Delete Enabled)</p>
          </div>
          <button 
            onClick={() => router.push('/admin/timetable/add')} 
            style={{ padding: '10px 20px', background: '#2563eb', color: 'white', borderRadius: '8px', border: 'none', cursor: 'pointer' }}
          >
            + Add Class
          </button>
        </div>

        {/* TABLE WITH DELETE BUTTONS */}
        <div style={{ background: 'white', borderRadius: '12px', overflow: 'hidden', boxShadow: '0 4px 6px rgba(0,0,0,0.1)' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
            <thead style={{ background: '#1f2937', color: 'white' }}>
              <tr>
                <th style={{ padding: '16px' }}>Day</th>
                <th style={{ padding: '16px' }}>Period</th>
                <th style={{ padding: '16px' }}>Subject</th>
                <th style={{ padding: '16px' }}>Room</th>
                <th style={{ padding: '16px', textAlign: 'center', background: '#991b1b' }}>DELETE</th>
              </tr>
            </thead>
            <tbody>
              {entries.map((entry) => (
                <tr key={entry.id} style={{ borderBottom: '1px solid #e5e7eb' }}>
                  <td style={{ padding: '16px', fontWeight: 'bold' }}>{entry.day}</td>
                  <td style={{ padding: '16px' }}>{entry.period}</td>
                  <td style={{ padding: '16px', color: '#2563eb' }}>{entry.subject}</td>
                  <td style={{ padding: '16px' }}>{entry.room || '-'}</td>
                  <td style={{ padding: '16px', textAlign: 'center' }}>
                    
                    {/* 🔴 THE DELETE BUTTON */}
                    <button 
                      onClick={() => handleDelete(entry.id)}
                      style={{
                        background: '#fee2e2', 
                        color: '#991b1b', 
                        border: '2px solid #ef4444', 
                        padding: '8px 16px', 
                        borderRadius: '6px', 
                        cursor: 'pointer',
                        fontWeight: 'bold'
                      }}
                    >
                      🗑️ DELETE
                    </button>

                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}