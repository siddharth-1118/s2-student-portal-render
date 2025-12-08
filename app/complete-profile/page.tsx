'use client';

import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { useState, useEffect } from 'react';

export default function CompleteProfile() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [registerNo, setRegisterNo] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push('/');
    }
  }, [status, router]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      // Validate register number format (you can customize this)
      if (!registerNo.trim()) {
        setError('Please enter your register number');
        setLoading(false);
        return;
      }

      // Update student profile with register number
      const response = await fetch('/api/student/update-profile', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          email: session?.user?.email,
          registerNo: registerNo.trim().toUpperCase(),
          name: session?.user?.name,
        }),
      });

      const data = await response.json();

      if (response.ok && data.success) {
        // Refresh the session to update the user data
        window.location.href = '/'; // This will refresh the session
      } else {
        setError(data.error || 'Failed to update profile');
      }
    } catch (err) {
      setError('An unexpected error occurred');
      console.error('Error updating profile:', err);
    } finally {
      setLoading(false);
    }
  };

  if (status === 'loading') {
    return (
      <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)' }}>
        <div style={{ width: '60px', height: '60px', border: '6px solid rgba(255,255,255,0.3)', borderTop: '6px solid white', borderRadius: '50%' }}></div>
      </div>
    );
  }

  return (
    <div style={{ minHeight: '100vh', background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '20px' }}>
      <div style={{ background: 'rgba(255, 255, 255, 0.95)', backdropFilter: 'blur(10px)', borderRadius: '24px', padding: '48px', boxShadow: '0 20px 60px rgba(0, 0, 0, 0.3)', textAlign: 'center', maxWidth: '500px', width: '100%' }}>
        <h1 style={{ fontSize: '32px', fontWeight: 'bold', marginBottom: '16px', background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>Complete Your Profile</h1>
        <p style={{ fontSize: '16px', color: '#6b7280', marginBottom: '32px' }}>Please enter your register number to complete your registration</p>
        
        <form onSubmit={handleSubmit} style={{ textAlign: 'left' }}>
          <div style={{ marginBottom: '24px' }}>
            <label style={{ display: 'block', marginBottom: '8px', fontWeight: '600', color: '#374151' }}>Full Name</label>
            <input
              type="text"
              value={session?.user?.name || ''}
              readOnly
              style={{ 
                width: '100%', 
                padding: '12px', 
                borderRadius: '8px', 
                border: '1px solid #d1d5db', 
                fontSize: '16px',
                backgroundColor: '#f3f4f6'
              }}
            />
          </div>
          
          <div style={{ marginBottom: '24px' }}>
            <label style={{ display: 'block', marginBottom: '8px', fontWeight: '600', color: '#374151' }}>Email</label>
            <input
              type="email"
              value={session?.user?.email || ''}
              readOnly
              style={{ 
                width: '100%', 
                padding: '12px', 
                borderRadius: '8px', 
                border: '1px solid #d1d5db', 
                fontSize: '16px',
                backgroundColor: '#f3f4f6'
              }}
            />
          </div>
          
          <div style={{ marginBottom: '24px' }}>
            <label style={{ display: 'block', marginBottom: '8px', fontWeight: '600', color: '#374151' }}>Register Number</label>
            <input
              type="text"
              placeholder="RA2511028010868"
              value={registerNo}
              onChange={(e) => setRegisterNo(e.target.value)}
              required
              style={{ 
                width: '100%', 
                padding: '12px', 
                borderRadius: '8px', 
                border: '1px solid #d1d5db', 
                fontSize: '16px'
              }}
            />
            <p style={{ marginTop: '8px', fontSize: '14px', color: '#6b7280' }}>
              Enter your official SRM register number (format: RA251102601XXXX)
            </p>
          </div>
          
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
          
          <button 
            type="submit"
            disabled={loading}
            style={{ 
              width: '100%',
              padding: '14px 32px', 
              background: loading ? '#9ca3af' : 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)', 
              color: 'white', 
              border: 'none', 
              borderRadius: '12px', 
              fontSize: '16px', 
              fontWeight: '600', 
              cursor: loading ? 'not-allowed' : 'pointer'
            }}
          >
            {loading ? 'Saving...' : 'Complete Profile'}
          </button>
        </form>
        
        <div style={{ marginTop: '24px', padding: '16px', backgroundColor: '#eff6ff', borderRadius: '8px', border: '1px solid #dbeafe' }}>
          <h3 style={{ fontSize: '16px', fontWeight: '600', color: '#1e40af', marginBottom: '8px' }}>Why do we need this?</h3>
          <p style={{ fontSize: '14px', color: '#374151', lineHeight: '1.5' }}>
            Your register number is required to match your academic records and ensure you receive the correct marks and notifications.
          </p>
        </div>
      </div>
    </div>
  );
}