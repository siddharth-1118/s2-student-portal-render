'use client';

import { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';

const ADMIN_EMAILS = ['saisiddharthvooka@gmail.com', 'kothaig2@srmist.edu.in'];

export default function AdminStudentsPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [students, setStudents] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');

  // 1. AUTH CHECK
  useEffect(() => {
    if (status === 'authenticated') {
      if (!ADMIN_EMAILS.includes(session?.user?.email || '')) {
        router.push('/');
      } else {
        fetchStudents();
      }
    }
  }, [status, session, router]);

  // 2. FETCH STUDENTS
  const fetchStudents = async () => {
    try {
      setLoading(true);
      // Ensure this API endpoint exists and returns student data
      const response = await fetch('/api/marks/list'); 
      const data = await response.json();
      
      if (response.ok) {
        // 🛡️ Sanitize data
        const safeData = data.map((student: any) => ({
          ...student,
          marks: student.marks || [] 
        }));
        setStudents(safeData);
      } else {
        console.error('Failed to fetch students:', data.error);
      }
    } catch (error) {
      console.error('Error fetching students:', error);
    } finally {
      setLoading(false);
    }
  };

  // 3. UNLOCK PROFILE FUNCTION
  const handleResetProfile = async (studentId: string, name: string) => {
    if (!confirm(`🔓 Unlock profile for ${name}? \n\nThey will be able to edit their details again.`)) return;

    try {
      const res = await fetch('/api/admin/students/reset-profile', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ studentId })
      });

      if (res.ok) {
        alert(`✅ Success! ${name}'s profile is now unlocked.`);
        fetchStudents(); // Refresh list to update status
      } else {
        alert('Failed to unlock profile.');
      }
    } catch (e) {
      console.error(e);
      alert('Error connecting to server.');
    }
  };

  // 4. FILTER LOGIC
  const filteredStudents = students.filter(student => {
    const term = searchTerm.toLowerCase();
    return (
      (student.registerNo || '').toLowerCase().includes(term) ||
      (student.name || '').toLowerCase().includes(term) ||
      (student.email || '').toLowerCase().includes(term) ||
      (student.phone || '').toLowerCase().includes(term) ||
      student.marks?.some((mark: any) => (mark.subject || '').toLowerCase().includes(term))
    );
  });

  if (status === 'loading') {
    return (
      <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)' }}>
        <div style={{ width: '60px', height: '60px', border: '6px solid rgba(255,255,255,0.3)', borderTop: '6px solid white', borderRadius: '50%' }}></div>
      </div>
    );
  }

  return (
    <div style={{ minHeight: '100vh', background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)', padding: '40px 20px' }}>
      <div style={{ maxWidth: '1400px', margin: '0 auto' }}>
        
        {/* HEADER */}
        <div style={{ background: 'rgba(255, 255, 255, 0.95)', backdropFilter: 'blur(10px)', borderRadius: '20px', padding: '32px', marginBottom: '32px', boxShadow: '0 8px 32px rgba(0, 0, 0, 0.1)' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '20px' }}>
            <div>
              <h1 style={{ fontSize: '32px', fontWeight: 'bold', marginBottom: '8px', background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>
                🎓 Student Management
              </h1>
              <p style={{ fontSize: '14px', color: '#6b7280' }}>
                View, manage, and unlock student profiles
              </p>
            </div>
            
            <div style={{ display: 'flex', gap: '10px' }}>
              {/* NOTIFY BUTTON */}
              <button 
                onClick={() => router.push('/admin/notify')} 
                style={{ padding: '12px 24px', background: '#f59e0b', color: 'white', border: 'none', borderRadius: '12px', fontSize: '14px', fontWeight: '600', cursor: 'pointer' }}
              >
                🔔 Send Notification
              </button>

              {/* BACK BUTTON */}
              <button 
                onClick={() => router.push('/')} 
                style={{ padding: '12px 24px', background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)', color: 'white', border: 'none', borderRadius: '12px', fontSize: '14px', fontWeight: '600', cursor: 'pointer' }}
              >
                ← Back to Dashboard
              </button>
            </div>
          </div>
        </div>

        {/* SEARCH BAR */}
        <div style={{ background: 'rgba(255, 255, 255, 0.95)', backdropFilter: 'blur(10px)', borderRadius: '20px', padding: '24px', marginBottom: '32px', boxShadow: '0 8px 32px rgba(0, 0, 0, 0.1)' }}>
          <div style={{ display: 'flex', gap: '16px', alignItems: 'center' }}>
            <input
              type="text"
              placeholder="🔍 Search by name, reg no, phone, or subject..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              style={{ width: '100%', padding: '12px 16px', border: '2px solid #e5e7eb', borderRadius: '8px', fontSize: '14px', outline: 'none' }}
            />
            <button 
              onClick={fetchStudents}
              style={{ padding: '12px 20px', background: 'linear-gradient(135deg, #4facfe 0%, #00f2fe 100%)', color: 'white', border: 'none', borderRadius: '8px', fontSize: '14px', fontWeight: '600', cursor: 'pointer', whiteSpace: 'nowrap' }}
            >
              🔄 Refresh
            </button>
          </div>
        </div>

        {/* STATS */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '20px', marginBottom: '32px' }}>
          <StatCard title="Total Students" value={students.length} icon="👥" color="#667eea" />
          <StatCard title="Profiles Completed" value={students.filter(s => s.profileCompleted).length} icon="✅" color="#10b981" />
          <StatCard title="With Marks" value={students.filter(s => s.marks?.length > 0).length} icon="📊" color="#43e97b" />
          <StatCard title="Total Entries" value={students.reduce((acc, student) => acc + (student.marks?.length || 0), 0)} icon="📝" color="#f5576c" />
        </div>

        {/* TABLE */}
        <div style={{ background: 'rgba(255, 255, 255, 0.95)', backdropFilter: 'blur(10px)', borderRadius: '20px', padding: '32px', boxShadow: '0 8px 32px rgba(0, 0, 0, 0.1)' }}>
          <h2 style={{ fontSize: '24px', fontWeight: 'bold', marginBottom: '24px', color: '#111827' }}>
            📋 All Students ({filteredStudents.length} found)
          </h2>
          
          {loading ? (
            <div style={{ textAlign: 'center', padding: '40px', color: '#6b7280' }}>Loading students...</div>
          ) : filteredStudents.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '40px', color: '#6b7280' }}>No Students Found</div>
          ) : (
            <div style={{ overflowX: 'auto' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                <thead>
                  <tr style={{ backgroundColor: '#f3f4f6' }}>
                    <th style={{ padding: '12px', textAlign: 'left', borderBottom: '2px solid #e5e7eb', fontWeight: '600' }}>Register No</th>
                    <th style={{ padding: '12px', textAlign: 'left', borderBottom: '2px solid #e5e7eb', fontWeight: '600' }}>Name</th>
                    <th style={{ padding: '12px', textAlign: 'left', borderBottom: '2px solid #e5e7eb', fontWeight: '600' }}>Phone</th>
                    <th style={{ padding: '12px', textAlign: 'left', borderBottom: '2px solid #e5e7eb', fontWeight: '600' }}>Dept / Year</th>
                    <th style={{ padding: '12px', textAlign: 'left', borderBottom: '2px solid #e5e7eb', fontWeight: '600' }}>Section</th>
                    <th style={{ padding: '12px', textAlign: 'center', borderBottom: '2px solid #e5e7eb', fontWeight: '600' }}>Marks</th>
                    <th style={{ padding: '12px', textAlign: 'center', borderBottom: '2px solid #e5e7eb', fontWeight: '600' }}>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredStudents.map((student) => (
                    <tr key={student.id} style={{ borderBottom: '1px solid #e5e7eb' }}>
                      <td style={{ padding: '12px', fontFamily: 'monospace', color: '#374151' }}>{student.registerNo}</td>
                      <td style={{ padding: '12px', fontWeight: '500', color: '#111827' }}>{student.name}</td>
                      <td style={{ padding: '12px', color: '#4b5563' }}>{student.phone || <span style={{color:'#f87171', fontSize:'12px'}}>N/A</span>}</td>
                      <td style={{ padding: '12px', color: '#4b5563' }}>{student.department ? `${student.department} - ${student.year}` : '-'}</td>
                      <td style={{ padding: '12px', fontWeight:'bold', color: '#4b5563' }}>{student.section || '-'}</td>
                      <td style={{ padding: '12px', textAlign: 'center' }}>
                        <span style={{ padding: '4px 8px', borderRadius: '12px', backgroundColor: student.marks?.length > 0 ? '#dcfce7' : '#fee2e2', color: student.marks?.length > 0 ? '#166534' : '#991b1b', fontSize: '12px', fontWeight: '600' }}>
                          {student.marks?.length || 0}
                        </span>
                      </td>
                      <td style={{ padding: '12px', textAlign: 'center' }}>
                        {/* UNLOCK BUTTON */}
                        <button 
                          onClick={() => handleResetProfile(student.id, student.name)}
                          style={{
                            padding: '6px 12px',
                            background: student.profileCompleted ? '#f59e0b' : '#e5e7eb',
                            color: student.profileCompleted ? 'white' : '#9ca3af',
                            border: 'none', borderRadius: '6px', cursor: student.profileCompleted ? 'pointer' : 'default',
                            fontSize: '12px', fontWeight: 'bold'
                          }}
                          disabled={!student.profileCompleted}
                          title={student.profileCompleted ? "Unlock to allow editing" : "Profile already unlocked"}
                        >
                          {student.profileCompleted ? '🔓 Unlock' : 'Open'}
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

function StatCard({ title, value, icon, color }: { title: string; value: number; icon: string; color: string }) {
  return (
    <div style={{ background: 'rgba(255, 255, 255, 0.95)', backdropFilter: 'blur(10px)', borderRadius: '16px', padding: '20px', boxShadow: '0 8px 32px rgba(0, 0, 0, 0.1)', border: '1px solid rgba(255, 255, 255, 0.2)', textAlign: 'center' }}>
      <div style={{ fontSize: '28px', marginBottom: '8px', color }}>{icon}</div>
      <p style={{ fontSize: '24px', fontWeight: 'bold', color: '#111827', marginBottom: '4px' }}>{value}</p>
      <p style={{ fontSize: '14px', color: '#6b7280' }}>{title}</p>
    </div>
  );
}