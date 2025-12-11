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

  useEffect(() => {
    if (status === 'authenticated') {
      if (!ADMIN_EMAILS.includes(session?.user?.email || '')) {
        router.push('/');
      } else {
        fetchStudents();
      }
    }
  }, [status, session, router]);

  const fetchStudents = async () => {
    try {
      setLoading(true);
      const response = await fetch('/api/marks/list');
      const data = await response.json();
      
      if (response.ok) {
        // 🛡️ PERMANENT FIX: Sanitize data to ensure 'marks' is always an array
        const safeData = data.map((student: any) => ({
          ...student,
          marks: student.marks || [] // If marks is undefined, force it to be []
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

  const filteredStudents = students.filter(student => {
    const searchTermLower = searchTerm.toLowerCase();
    return (
      // FIX: Add ( || '') to prevent crashes if data is missing
      (student.registerNo || '').toLowerCase().includes(searchTermLower) ||
      (student.name || '').toLowerCase().includes(searchTermLower) ||
      (student.email || '').toLowerCase().includes(searchTermLower) ||
      student.marks?.some((mark: any) => 
        (mark.subject || '').toLowerCase().includes(searchTermLower)
      )
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
        <div style={{ background: 'rgba(255, 255, 255, 0.95)', backdropFilter: 'blur(10px)', borderRadius: '20px', padding: '32px', marginBottom: '32px', boxShadow: '0 8px 32px rgba(0, 0, 0, 0.1)' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '20px' }}>
            <div>
              <h1 style={{ fontSize: '32px', fontWeight: 'bold', marginBottom: '8px', background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>
                🎓 Student Management
              </h1>
              <p style={{ fontSize: '14px', color: '#6b7280' }}>
                View and manage all students in the system
              </p>
            </div>
            <button 
              onClick={() => router.push('/')} 
              style={{ 
                padding: '12px 24px', 
                background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)', 
                color: 'white', 
                border: 'none', 
                borderRadius: '12px', 
                fontSize: '14px', 
                fontWeight: '600', 
                cursor: 'pointer' 
              }}
            >
              ← Back to Dashboard
            </button>
          </div>
          {/* ... inside your header section ... */}

<div style={{ display: 'flex', gap: '10px' }}>
  
  {/* NEW NOTIFY BUTTON */}
  <button 
    onClick={() => router.push('/admin/notify')} 
    style={{ 
      padding: '12px 24px', 
      background: '#f59e0b', // Orange color
      color: 'white', 
      border: 'none', 
      borderRadius: '12px', 
      fontSize: '14px', 
      fontWeight: '600', 
      cursor: 'pointer' 
    }}
  >
    🔔 Send Notification
  </button>

  {/* Existing Back Button */}
  <button 
    onClick={() => router.push('/')} 
    style={{ 
      padding: '12px 24px', 
      background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)', 
      color: 'white', 
      border: 'none', 
      borderRadius: '12px', 
      fontSize: '14px', 
      fontWeight: '600', 
      cursor: 'pointer' 
    }}
  >
    ← Back to Dashboard
  </button>
</div>
        </div>

        {/* Search Bar */}
        <div style={{ background: 'rgba(255, 255, 255, 0.95)', backdropFilter: 'blur(10px)', borderRadius: '20px', padding: '24px', marginBottom: '32px', boxShadow: '0 8px 32px rgba(0, 0, 0, 0.1)' }}>
          <div style={{ display: 'flex', gap: '16px', alignItems: 'center' }}>
            <div style={{ flex: 1 }}>
              <input
                type="text"
                placeholder="🔍 Search students by name, register number, email, or subject..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                style={{ 
                  width: '100%', 
                  padding: '12px 16px', 
                  border: '2px solid #e5e7eb', 
                  borderRadius: '8px', 
                  fontSize: '14px',
                  outline: 'none'
                }}
                onFocus={(e) => e.target.style.borderColor = '#667eea'}
                onBlur={(e) => e.target.style.borderColor = '#e5e7eb'}
              />
            </div>
            <button 
              onClick={fetchStudents}
              style={{ 
                padding: '12px 20px', 
                background: 'linear-gradient(135deg, #4facfe 0%, #00f2fe 100%)', 
                color: 'white', 
                border: 'none', 
                borderRadius: '8px', 
                fontSize: '14px', 
                fontWeight: '600', 
                cursor: 'pointer' 
              }}
            >
              🔄 Refresh
            </button>
          </div>
        </div>

        {/* Stats */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '20px', marginBottom: '32px' }}>
          <StatCard title="Total Students" value={students.length} icon="👥" color="#667eea" />
          <StatCard title="Students with Email" value={students.filter(s => s.email).length} icon="📧" color="#f093fb" />
          
          {/* Safe Checks applied here */}
          <StatCard 
            title="Students with Marks" 
            value={students.filter(s => s.marks?.length > 0).length} 
            icon="📊" 
            color="#43e97b" 
          />
          <StatCard 
            title="Total Marks Entries" 
            value={students.reduce((acc, student) => acc + (student.marks?.length || 0), 0)} 
            icon="📝" 
            color="#f5576c" 
          />
        </div>

        {/* Students Table */}
        <div style={{ background: 'rgba(255, 255, 255, 0.95)', backdropFilter: 'blur(10px)', borderRadius: '20px', padding: '32px', boxShadow: '0 8px 32px rgba(0, 0, 0, 0.1)' }}>
          <h2 style={{ fontSize: '24px', fontWeight: 'bold', marginBottom: '24px', color: '#111827' }}>
            📋 All Students ({filteredStudents.length} found)
          </h2>
          
          {loading ? (
            <div style={{ textAlign: 'center', padding: '40px' }}>
              <div style={{ width: '40px', height: '40px', margin: '0 auto 20px', border: '4px solid rgba(102, 126, 234, 0.3)', borderTop: '4px solid #667eea', borderRadius: '50%' }}></div>
              <p>Loading students...</p>
            </div>
          ) : filteredStudents.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '40px' }}>
              <div style={{ fontSize: '64px', marginBottom: '20px' }}>👥</div>
              <h3 style={{ fontSize: '20px', fontWeight: 'bold', color: '#111827', marginBottom: '12px' }}>
                No Students Found
              </h3>
              <p style={{ fontSize: '16px', color: '#6b7280' }}>
                {searchTerm ? 'Try adjusting your search criteria.' : 'There are no students in the system yet.'}
              </p>
            </div>
          ) : (
            <div style={{ overflowX: 'auto' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                {/* ... inside app/admin/students/page.tsx ... */}

{/* Update the Table Headers */}
<thead>
  <tr style={{ backgroundColor: '#f3f4f6' }}>
    <th style={{ padding: '12px', textAlign: 'left', borderBottom: '2px solid #e5e7eb', fontWeight: '600' }}>Register No</th>
    <th style={{ padding: '12px', textAlign: 'left', borderBottom: '2px solid #e5e7eb', fontWeight: '600' }}>Name</th>
    
    {/* 🟢 NEW COLUMNS ADDED */}
    <th style={{ padding: '12px', textAlign: 'left', borderBottom: '2px solid #e5e7eb', fontWeight: '600' }}>Phone</th>
    <th style={{ padding: '12px', textAlign: 'left', borderBottom: '2px solid #e5e7eb', fontWeight: '600' }}>Dept / Year</th>
    <th style={{ padding: '12px', textAlign: 'left', borderBottom: '2px solid #e5e7eb', fontWeight: '600' }}>Section</th>
    
    <th style={{ padding: '12px', textAlign: 'left', borderBottom: '2px solid #e5e7eb', fontWeight: '600' }}>Marks Count</th>
  </tr>
</thead>

{/* Update the Table Body */}
<tbody>
  {filteredStudents.map((student) => (
    <tr key={student.id} style={{ borderBottom: '1px solid #e5e7eb' }}>
      <td style={{ padding: '12px', fontFamily: 'monospace', color: '#374151' }}>{student.registerNo}</td>
      <td style={{ padding: '12px', fontWeight: '500', color: '#111827' }}>{student.name}</td>
      
      {/* 🟢 DISPLAY NEW DETAILS */}
      <td style={{ padding: '12px', color: '#4b5563' }}>
        {student.phone || <span style={{color:'#f87171'}}>No Phone</span>}
      </td>
      <td style={{ padding: '12px', color: '#4b5563' }}>
        {student.department ? `${student.department} - ${student.year}` : '-'}
      </td>
      <td style={{ padding: '12px', fontWeight:'bold', color: '#4b5563' }}>
        {student.section || '-'}
      </td>

      <td style={{ padding: '12px', textAlign: 'center' }}>
        <span style={{ 
          padding: '4px 8px', 
          borderRadius: '12px', 
          backgroundColor: student.marks?.length > 0 ? '#dcfce7' : '#fee2e2',
          color: student.marks?.length > 0 ? '#166534' : '#991b1b',
          fontSize: '12px', fontWeight: '600'
        }}>
          {student.marks?.length || 0}
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