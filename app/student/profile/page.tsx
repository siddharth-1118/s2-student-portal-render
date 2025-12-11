'use client';

import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { useState, useEffect } from 'react';
import NotificationButton from '@/components/NotificationButton';

export default function StudentProfile() {
  const { data: session, status } = useSession();
  const router = useRouter();
  
  const [profile, setProfile] = useState({
    name: '', registerNo: '', email: '', phone: '', department: '', year: '', section: ''
  });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [isLocked, setIsLocked] = useState(false);
  
  // Query State
  const [query, setQuery] = useState('');
  const [sendingQuery, setSendingQuery] = useState(false);

  useEffect(() => {
    if (status === 'authenticated' && session?.user) {
      fetchProfile();
    }
  }, [status, session]);

  const fetchProfile = async () => {
    try {
      const response = await fetch('/api/student/profile');
      const data = await response.json();
      
      if (response.ok) {
        setProfile({
          name: data.name || session?.user?.name || '',
          registerNo: data.registerNo || '',
          email: data.email || session?.user?.email || '',
          phone: data.phone || '',
          department: data.department || '',
          year: data.year?.toString() || '',
          section: data.section || ''
        });
        // SET LOCK STATUS
        setIsLocked(data.profileCompleted === true);
      }
    } catch (error) {
      console.error('Error fetching profile:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (isLocked) return;
    setSaving(true);
    
    try {
      const response = await fetch('/api/student/profile/update', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...profile, profileCompleted: true }), // 🔒 Lock it on save
      });
      
      if (response.ok) {
        alert('✅ Profile Saved & Locked!');
        setIsLocked(true);
        router.refresh();
      } else {
        alert('Failed to save profile');
      }
    } catch (error) {
      console.error('Error saving profile:', error);
    } finally {
      setSaving(false);
    }
  };

  const sendQuery = async () => {
    if (!query) return alert("Please type a message first");
    setSendingQuery(true);
    try {
      const res = await fetch('/api/student/query', {
        method: 'POST',
        body: JSON.stringify({ message: query })
      });
      if (res.ok) {
        alert("Query sent to Admin! Check your notifications later.");
        setQuery('');
      } else {
        alert("Failed to send query.");
      }
    } catch (e) {
      alert("Error sending query");
    } finally {
      setSendingQuery(false);
    }
  };

  if (status === 'loading' || loading) return <div style={{ padding: '40px', textAlign: 'center' }}>Loading...</div>;
  if (!session) return null;

  return (
    <div style={{ minHeight: '100vh', background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)', padding: '40px 20px' }}>
      <div style={{ maxWidth: '800px', margin: '0 auto' }}>
        <div style={{ background: 'rgba(255, 255, 255, 0.95)', backdropFilter: 'blur(10px)', borderRadius: '20px', padding: '32px', boxShadow: '0 8px 32px rgba(0, 0, 0, 0.1)' }}>
          
          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '24px' }}>
            <h1 style={{ fontSize: '28px', fontWeight: 'bold' }}>📝 Student Profile</h1>
            <button onClick={() => router.push('/')} style={{ padding: '8px 16px', borderRadius: '8px', border: '1px solid #ccc' }}>← Back</button>
          </div>

          {/* 🔒 LOCKED BANNER & QUERY BOX */}
          {isLocked && (
            <div style={{ marginBottom: '30px', padding: '20px', background: '#fff7ed', border: '1px solid #fed7aa', borderRadius: '12px' }}>
              <h3 style={{ fontSize: '16px', fontWeight: 'bold', color: '#c2410c', marginBottom: '8px' }}>🔒 Profile Locked</h3>
              <p style={{ fontSize: '14px', color: '#9a3412', marginBottom: '12px' }}>
                Your details are submitted. To make changes, message the admin:
              </p>
              <div style={{ display: 'flex', gap: '10px' }}>
                <input 
                  type="text" 
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  placeholder="e.g. Please unlock, I made a typo in phone number."
                  style={{ flex: 1, padding: '10px', borderRadius: '6px', border: '1px solid #fdba74' }}
                />
                <button 
                  onClick={sendQuery}
                  disabled={sendingQuery}
                  type="button"
                  style={{ padding: '10px 15px', background: '#ea580c', color: 'white', border: 'none', borderRadius: '6px', cursor: 'pointer', fontWeight: 'bold' }}
                >
                  {sendingQuery ? 'Sending...' : 'Send'}
                </button>
              </div>
            </div>
          )}

          <form onSubmit={handleSubmit}>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px', marginBottom: '20px' }}>
              <div>
                <label style={{ fontWeight: 'bold' }}>Full Name</label>
                <input type="text" value={profile.name} disabled style={{ width: '100%', padding: '10px', background: '#e5e7eb', borderRadius: '6px' }} />
              </div>
              <div>
                <label style={{ fontWeight: 'bold' }}>Register No</label>
                <input type="text" value={profile.registerNo} onChange={(e) => setProfile({...profile, registerNo: e.target.value})} disabled={isLocked} style={{ width: '100%', padding: '10px', background: isLocked ? '#f3f4f6' : 'white', border: '1px solid #ccc', borderRadius: '6px' }} />
              </div>
              <div>
                <label style={{ fontWeight: 'bold' }}>Phone</label>
                <input type="text" value={profile.phone} onChange={(e) => setProfile({...profile, phone: e.target.value})} disabled={isLocked} style={{ width: '100%', padding: '10px', background: isLocked ? '#f3f4f6' : 'white', border: '1px solid #ccc', borderRadius: '6px' }} />
              </div>
              <div>
                <label style={{ fontWeight: 'bold' }}>Department</label>
                <select value={profile.department} onChange={(e) => setProfile({...profile, department: e.target.value})} disabled={isLocked} style={{ width: '100%', padding: '10px', background: isLocked ? '#f3f4f6' : 'white', border: '1px solid #ccc', borderRadius: '6px' }}>
                  <option value="">Select</option>
                  <option value="CSE">CSE</option>
                  <option value="ECE">ECE</option>
                  <option value="EEE">EEE</option>
                  <option value="MECH">MECH</option>
                </select>
              </div>
            </div>

            {!isLocked && (
              <button type="submit" disabled={saving} style={{ width: '100%', padding: '12px', background: '#2563eb', color: 'white', border: 'none', borderRadius: '8px', fontWeight: 'bold', cursor: 'pointer' }}>
                {saving ? 'Saving...' : 'Save & Lock Profile'}
              </button>
            )}
          </form>

          {/* PUSH NOTIFICATION BUTTON */}
          <div style={{ marginTop: '30px', borderTop: '1px solid #eee', paddingTop: '20px' }}>
             <p style={{marginBottom: '10px', fontWeight: 'bold'}}>Device Notifications</p>
             <NotificationButton />
          </div>

        </div>
      </div>
    </div>
  );
}