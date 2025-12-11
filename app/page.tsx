'use client';

import { useSession, signOut, signIn } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { useState, useEffect } from 'react';
import NotificationBell from '@/components/NotificationBell'; // Ensure this component exists

const ADMIN_EMAILS = ['saisiddharthvooka@gmail.com', 'kothaig2@srmist.edu.in'];

export default function Home() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  if (status === 'loading') {
    return (
      <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)' }}>
        <div style={{ width: '60px', height: '60px', border: '6px solid rgba(255,255,255,0.3)', borderTop: '6px solid white', borderRadius: '50%' }}></div>
      </div>
    );
  }

  if (!session) {
    return (
      <div style={{ minHeight: '100vh', background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '20px' }}>
        <div style={{ background: 'rgba(255, 255, 255, 0.95)', backdropFilter: 'blur(10px)', borderRadius: '24px', padding: '48px', boxShadow: '0 20px 60px rgba(0, 0, 0, 0.3)', textAlign: 'center', maxWidth: '500px' }}>
          <h1 style={{ fontSize: '36px', fontWeight: 'bold', marginBottom: '16px', background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>🎓 S2 Portal</h1>
          <p style={{ fontSize: '16px', color: '#6b7280', marginBottom: '32px' }}>Welcome. Sign in to access your portal.</p>
          
          {/* Email/Password Login Form */}
          <div style={{ marginBottom: '24px', textAlign: 'left' }}>
            {error && <div style={{ padding: '12px', borderRadius: '8px', backgroundColor: '#fee2e2', border: '1px solid #fecaca', color: '#991b1b', marginBottom: '16px' }}>{error}</div>}
            
            <input type="email" placeholder="your@email.com" value={email} onChange={(e) => setEmail(e.target.value)} style={{ width: '100%', padding: '12px', borderRadius: '8px', border: '1px solid #d1d5db', marginBottom: '16px' }} disabled={loading} />
            <input type="password" placeholder="Password" value={password} onChange={(e) => setPassword(e.target.value)} style={{ width: '100%', padding: '12px', borderRadius: '8px', border: '1px solid #d1d5db', marginBottom: '16px' }} disabled={loading} />
            
            <button 
              onClick={async () => {
                setLoading(true); setError('');
                const result = await signIn('credentials', { email, password, redirect: false });
                if (result?.error) setError(result.error);
                setLoading(false);
              }}
              disabled={loading || !email || !password}
              style={{ width: '100%', padding: '14px', background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)', color: 'white', border: 'none', borderRadius: '12px', fontWeight: '600', cursor: 'pointer' }}
            >
              {loading ? 'Signing in...' : 'Sign In'}
            </button>
          </div>
          
          <div style={{ display: 'flex', alignItems: 'center', margin: '24px 0' }}>
            <div style={{ flex: 1, height: '1px', backgroundColor: '#e5e7eb' }}></div><span style={{ padding: '0 16px', color: '#6b7280', fontSize: '14px' }}>OR</span><div style={{ flex: 1, height: '1px', backgroundColor: '#e5e7eb' }}></div>
          </div>
          
          <button onClick={() => signIn('google')} style={{ width: '100%', padding: '14px', background: 'white', color: '#374151', border: '1px solid #d1d5db', borderRadius: '12px', fontWeight: '600', cursor: 'pointer', display: 'flex', justifyContent: 'center', gap: '8px' }}>
            Sign In with Google
          </button>
        </div>
      </div>
    );
  }

  const isAdmin = ADMIN_EMAILS.includes(session.user?.email || '');

  return (
    <div style={{ minHeight: '100vh', background: 'linear-gradient(135deg, #f5f7fa 0%, #c3cfe2 100%)', padding: '40px 20px' }}>
      <style jsx>{`
        @keyframes slideUp { from { opacity: 0; transform: translateY(20px); } to { opacity: 1; transform: translateY(0); } }
        .card { animation: slideUp 0.5s ease-out; transition: all 0.3s; }
        .card:hover { transform: translateY(-8px); box-shadow: 0 20px 40px rgba(0, 0, 0, 0.2); }
      `}</style>

      <div style={{ maxWidth: '1200px', margin: '0 auto' }}>
        {/* HEADER CARD */}
        <div style={{ background: 'rgba(255, 255, 255, 0.95)', backdropFilter: 'blur(10px)', borderRadius: '20px', padding: '32px', marginBottom: '32px', boxShadow: '0 8px 32px rgba(0, 0, 0, 0.1)', animation: 'slideUp 0.5s ease-out' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '20px' }}>
            <div>
              <h1 style={{ fontSize: '32px', fontWeight: 'bold', marginBottom: '8px', background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>Welcome, {session.user?.name?.split(' ')[0]}! 👋</h1>
              <p style={{ fontSize: '14px', color: '#6b7280' }}>📧 {session.user?.email} • <span style={{ padding: '4px 12px', background: isAdmin ? 'linear-gradient(135deg, #f093fb 0%, #f5576c 100%)' : 'linear-gradient(135deg, #4facfe 0%, #00f2fe 100%)', borderRadius: '20px', color: 'white', fontSize: '12px', fontWeight: '600' }}>{isAdmin ? '👑 ADMIN' : '🎓 STUDENT'}</span></p>
            </div>
            
            <div style={{ display: 'flex', alignItems: 'center', gap: '15px' }}>
              {/* 🔔 NOTIFICATION BELL */}
              <NotificationBell />
              
              <button onClick={() => signOut()} style={{ padding: '12px 24px', background: '#ef4444', color: 'white', border: 'none', borderRadius: '12px', fontSize: '14px', fontWeight: '600', cursor: 'pointer', boxShadow: '0 4px 15px rgba(239, 68, 68, 0.3)' }}>🚪 Logout</button>
            </div>
          </div>
        </div>

        {/* DASHBOARD GRID */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '24px' }}>
          {isAdmin ? (
            <>
              <DashboardCard icon="📊" title="Marks Upload" description="Upload student marks" gradient="linear-gradient(135deg, #667eea 0%, #764ba2 100%)" onClick={() => router.push('/marks/upload')} />
              <DashboardCard icon="👥" title="All Students" description="Manage all students" gradient="linear-gradient(135deg, #ff9a9e 0%, #fad0c4 100%)" onClick={() => router.push('/admin/students')} />
              <DashboardCard icon="📝" title="Student Profiles" description="Profile settings" gradient="linear-gradient(135deg, #a1c4fd 0%, #c2e9fb 100%)" onClick={() => router.push('/admin/profiles')} />
              <DashboardCard icon="📈" title="Analytics" description="Class performance" gradient="linear-gradient(135deg, #f093fb 0%, #f5576c 100%)" onClick={() => router.push('/admin/analytics')} />
              <DashboardCard icon="📅" title="Timetable" description="Manage schedules" gradient="linear-gradient(135deg, #4facfe 0%, #00f2fe 100%)" onClick={() => router.push('/admin/timetable')} />
            </>
          ) : (
            <>
              <DashboardCard icon="📝" title="My Marks" description="View performance" gradient="linear-gradient(135deg, #667eea 0%, #764ba2 100%)" onClick={() => router.push('/student/marks')} />
              <DashboardCard icon="👤" title="My Profile" description="Personal info" gradient="linear-gradient(135deg, #a1c4fd 0%, #c2e9fb 100%)" onClick={() => router.push('/student/profile')} />
              <DashboardCard icon="📈" title="My Analytics" description="Subject performance" gradient="linear-gradient(135deg, #f093fb 0%, #f5576c 100%)" onClick={() => router.push('/student/analytics')} />
              <DashboardCard icon="📅" title="Timetable" description="Class schedule" gradient="linear-gradient(135deg, #4facfe 0%, #00f2fe 100%)" onClick={() => router.push('/timetable')} />
            </>
          )}
        </div>
      </div>
    </div>
  );
}

function DashboardCard({ icon, title, description, gradient, onClick }: any) {
  return (
    <div className="card" onClick={onClick} style={{ background: 'rgba(255, 255, 255, 0.95)', backdropFilter: 'blur(10px)', borderRadius: '20px', padding: '32px', cursor: 'pointer', boxShadow: '0 8px 32px rgba(0, 0, 0, 0.1)', position: 'relative', overflow: 'hidden' }}>
      <div style={{ position: 'absolute', top: 0, left: 0, right: 0, height: '4px', background: gradient }}></div>
      <div style={{ fontSize: '48px', marginBottom: '16px' }}>{icon}</div>
      <h3 style={{ fontSize: '22px', fontWeight: 'bold', marginBottom: '8px', color: '#111827' }}>{title}</h3>
      <p style={{ fontSize: '14px', color: '#6b7280', marginBottom: '16px' }}>{description}</p>
      <div style={{ display: 'inline-flex', alignItems: 'center', gap: '8px', color: '#667eea', fontSize: '14px', fontWeight: '600' }}>Open <span>→</span></div>
    </div>
  );
}