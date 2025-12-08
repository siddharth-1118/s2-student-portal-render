'use client';

import { useSession, signOut, signIn } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { useState, useEffect } from 'react';

const ADMIN_EMAILS = ['saisiddharthvooka@gmail.com', 'kothaig2@srmist.edu.in'];

export default function Home() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  // Check if user needs to complete their profile
  useEffect(() => {
    if (status === 'authenticated' && session?.user) {
      // Check if this is a student and if their profile is completed
      const isStudent = !ADMIN_EMAILS.includes(session.user.email || '');
      const profileCompleted = (session.user as any).profileCompleted;
      const registerNo = (session.user as any).registerNo;
      
      // If student and profile not completed, or has a temporary register number, redirect to complete profile
      if (isStudent && (profileCompleted === false || (registerNo && registerNo.startsWith("TEMP_")))) {
        router.push('/complete-profile');
      }
    }
  }, [status, session, router]);

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
          <p style={{ fontSize: '16px', color: '#6b7280', marginBottom: '32px' }}>Welcome to the Student Portal. Sign in to access your marks, timetable, and more.</p>
          
          {/* Email/Password Login Form */}
          <div style={{ marginBottom: '24px', textAlign: 'left' }}>
            <h2 style={{ fontSize: '20px', fontWeight: '600', marginBottom: '16px' }}>Sign in with Email</h2>
            
            {error && (
              <div style={{ 
                padding: '12px', 
                borderRadius: '8px', 
                backgroundColor: '#fee2e2', 
                border: '1px solid #fecaca', 
                color: '#991b1b', 
                marginBottom: '16px' 
              }}>
                {error}
              </div>
            )}
            
            <div style={{ marginBottom: '16px' }}>
              <input
                type="email"
                placeholder="your@email.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                style={{ 
                  width: '100%', 
                  padding: '12px', 
                  borderRadius: '8px', 
                  border: '1px solid #d1d5db', 
                  fontSize: '16px'
                }}
                disabled={loading}
              />
            </div>
            
            <div style={{ marginBottom: '16px' }}>
              <input
                type="password"
                placeholder="Password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                style={{ 
                  width: '100%', 
                  padding: '12px', 
                  borderRadius: '8px', 
                  border: '1px solid #d1d5db', 
                  fontSize: '16px'
                }}
                disabled={loading}
              />
            </div>
            
            <button 
              onClick={async () => {
                setLoading(true);
                setError('');
                try {
                  const result = await signIn('credentials', {
                    email,
                    password,
                    redirect: false
                  });
                  
                  if (result?.error) {
                    setError(result.error);
                  }
                } catch (err) {
                  setError('An unexpected error occurred');
                } finally {
                  setLoading(false);
                }
              }}
              disabled={loading || !email || !password}
              style={{ 
                width: '100%',
                padding: '14px 32px', 
                background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)', 
                color: 'white', 
                border: 'none', 
                borderRadius: '12px', 
                fontSize: '16px', 
                fontWeight: '600', 
                cursor: (loading || !email || !password) ? 'not-allowed' : 'pointer',
                opacity: (loading || !email || !password) ? 0.7 : 1
              }}
            >
              {loading ? 'Signing in...' : 'Sign In'}
            </button>
          </div>
          
          <div style={{ display: 'flex', alignItems: 'center', margin: '24px 0' }}>
            <div style={{ flex: 1, height: '1px', backgroundColor: '#e5e7eb' }}></div>
            <span style={{ padding: '0 16px', color: '#6b7280', fontSize: '14px' }}>OR</span>
            <div style={{ flex: 1, height: '1px', backgroundColor: '#e5e7eb' }}></div>
          </div>
          
          <button 
            onClick={() => signIn('google')} 
            style={{ 
              width: '100%',
              padding: '14px 32px', 
              background: 'white', 
              color: '#374151', 
              border: '1px solid #d1d5db', 
              borderRadius: '12px', 
              fontSize: '16px', 
              fontWeight: '600', 
              cursor: 'pointer', 
              display: 'flex', 
              alignItems: 'center', 
              justifyContent: 'center', 
              gap: '8px'
            }}
          >
            <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24"><path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/><path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/><path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/><path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/></svg>
            Sign In with Google
          </button>
          
          <div style={{ marginTop: '24px', padding: '16px', backgroundColor: '#eff6ff', borderRadius: '8px', border: '1px solid #dbeafe' }}>
            <p style={{ fontSize: '14px', color: '#1e40af', margin: '0 0 8px 0' }}>
              <strong>For Students:</strong> Use your @srmist.edu.in email
            </p>
            <p style={{ fontSize: '14px', color: '#1e40af', margin: 0 }}>
              <strong>For Admins:</strong> Use your authorized admin email
            </p>
          </div>
        </div>
      </div>
    );
  }

  const isAdmin = ADMIN_EMAILS.includes(session.user?.email || '');

  return (
    <div style={{ minHeight: '100vh', background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)', padding: '40px 20px' }}>
      <style jsx>{`
        @keyframes slideUp { from { opacity: 0; transform: translateY(20px); } to { opacity: 1; transform: translateY(0); } }
        @keyframes float { 0%, 100% { transform: translateY(0px); } 50% { transform: translateY(-10px); } }
        .card { animation: slideUp 0.5s ease-out; transition: all 0.3s; }
        .card:hover { transform: translateY(-8px); box-shadow: 0 20px 40px rgba(0, 0, 0, 0.2); }
      `}</style>

      <div style={{ maxWidth: '1200px', margin: '0 auto' }}>
        <div style={{ background: 'rgba(255, 255, 255, 0.95)', backdropFilter: 'blur(10px)', borderRadius: '20px', padding: '32px', marginBottom: '32px', boxShadow: '0 8px 32px rgba(0, 0, 0, 0.1)', animation: 'slideUp 0.5s ease-out' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '20px' }}>
            <div>
              <h1 style={{ fontSize: '32px', fontWeight: 'bold', marginBottom: '8px', background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>Welcome, {session.user?.name?.split(' ')[0]}! 👋</h1>
              <p style={{ fontSize: '14px', color: '#6b7280' }}>📧 {session.user?.email} • <span style={{ padding: '4px 12px', background: isAdmin ? 'linear-gradient(135deg, #f093fb 0%, #f5576c 100%)' : 'linear-gradient(135deg, #4facfe 0%, #00f2fe 100%)', borderRadius: '20px', color: 'white', fontSize: '12px', fontWeight: '600' }}>{isAdmin ? '👑 ADMIN' : '🎓 STUDENT'}</span></p>
            </div>
            <button onClick={() => signOut()} style={{ padding: '12px 24px', background: '#ef4444', color: 'white', border: 'none', borderRadius: '12px', fontSize: '14px', fontWeight: '600', cursor: 'pointer', boxShadow: '0 4px 15px rgba(239, 68, 68, 0.3)', transition: 'all 0.2s' }}>🚪 Logout</button>
          </div>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '24px' }}>
          {isAdmin ? (
            <>
              <DashboardCard icon="📊" title="Marks Upload" description="Upload and manage student marks with AI" gradient="linear-gradient(135deg, #667eea 0%, #764ba2 100%)" onClick={() => router.push('/marks/upload')} />
              <DashboardCard icon="👥" title="All Students" description="View and manage all students" gradient="linear-gradient(135deg, #ff9a9e 0%, #fad0c4 100%)" onClick={() => router.push('/admin/students')} />
              <DashboardCard icon="📝" title="Student Profiles" description="Manage student profile settings" gradient="linear-gradient(135deg, #a1c4fd 0%, #c2e9fb 100%)" onClick={() => router.push('/admin/profiles')} />
              <DashboardCard icon="📈" title="Analytics" description="View class performance and statistics" gradient="linear-gradient(135deg, #f093fb 0%, #f5576c 100%)" onClick={() => router.push('/admin/analytics')} />
              <DashboardCard icon="📅" title="Timetable" description="Manage and view class schedules" gradient="linear-gradient(135deg, #4facfe 0%, #00f2fe 100%)" onClick={() => router.push('/timetable')} />
              <DashboardCard icon="📢" title="Circulars" description="Manage announcements for students" gradient="linear-gradient(135deg, #a1c4fd 0%, #c2e9fb 100%)" onClick={() => router.push('/admin/circulars')} />
            </>
          ) : (
            <>
              <DashboardCard icon="📝" title="My Marks" description="View your academic performance" gradient="linear-gradient(135deg, #667eea 0%, #764ba2 100%)" onClick={() => router.push('/student/marks')} />
              <DashboardCard icon="👤" title="My Profile" description="Manage your personal information" gradient="linear-gradient(135deg, #a1c4fd 0%, #c2e9fb 100%)" onClick={() => router.push('/student/profile')} />
              <DashboardCard icon="📈" title="My Analytics" description="View your subject-wise performance" gradient="linear-gradient(135deg, #f093fb 0%, #f5576c 100%)" onClick={() => router.push('/student/analytics')} />
              <DashboardCard icon="📅" title="Timetable" description="Check your class schedule" gradient="linear-gradient(135deg, #4facfe 0%, #00f2fe 100%)" onClick={() => router.push('/timetable')} />
              <DashboardCard icon="🎯" title="SGPA / CGPA" description="Calculate your grades" gradient="linear-gradient(135deg, #43e97b 0%, #38f9d7 100%)" onClick={() => router.push('/calculator')} />
              <DashboardCard icon="📢" title="Announcements" description="View latest circulars" gradient="linear-gradient(135deg, #a1c4fd 0%, #c2e9fb 100%)" onClick={() => router.push('/circulars')} />
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
      <div style={{ fontSize: '48px', marginBottom: '16px', animation: 'float 3s ease-in-out infinite' }}>{icon}</div>
      <h3 style={{ fontSize: '22px', fontWeight: 'bold', marginBottom: '8px', color: '#111827' }}>{title}</h3>
      <p style={{ fontSize: '14px', color: '#6b7280', marginBottom: '16px' }}>{description}</p>
      <div style={{ display: 'inline-flex', alignItems: 'center', gap: '8px', color: '#667eea', fontSize: '14px', fontWeight: '600' }}>Open <span>→</span></div>
    </div>
  );
}