'use client';

import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { useState, useEffect } from 'react';

export default function StudentProfile() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [profile, setProfile] = useState({
    name: '',
    registerNo: '',
    email: '',
    phone: '',
    department: '',
    year: '',
    section: ''
  });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState('');

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
      }
    } catch (error) {
      console.error('Error fetching profile:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setProfile(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setMessage('');
    
    try {
      const response = await fetch('/api/student/profile', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          ...profile,
          year: profile.year ? parseInt(profile.year) : null
        }),
      });
      
      const data = await response.json();
      
      if (response.ok) {
        setMessage('Profile saved successfully!');
        // Refresh session to update profile status
        window.location.reload();
      } else {
        setMessage(data.error || 'Failed to save profile');
      }
    } catch (error) {
      setMessage('Error saving profile');
      console.error('Error saving profile:', error);
    } finally {
      setSaving(false);
    }
  };

  if (status === 'loading') {
    return (
      <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)' }}>
        <div style={{ width: '60px', height: '60px', border: '6px solid rgba(255,255,255,0.3)', borderTop: '6px solid white', borderRadius: '50%' }}></div>
      </div>
    );
  }

  if (!session) {
    router.push('/');
    return null;
  }

  // Check if profile is locked
  const isProfileLocked = (session.user as any).profileLocked;
  const isProfileCompleted = (session.user as any).profileCompleted;

  return (
    <div style={{ minHeight: '100vh', background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)', padding: '40px 20px' }}>
      <div style={{ maxWidth: '800px', margin: '0 auto' }}>
        <div style={{ background: 'rgba(255, 255, 255, 0.95)', backdropFilter: 'blur(10px)', borderRadius: '20px', padding: '32px', marginBottom: '32px', boxShadow: '0 8px 32px rgba(0, 0, 0, 0.1)' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '20px', marginBottom: '24px' }}>
            <div>
              <h1 style={{ fontSize: '32px', fontWeight: 'bold', marginBottom: '8px', background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>
                📝 Student Profile
              </h1>
              <p style={{ fontSize: '14px', color: '#6b7280' }}>
                Manage your personal information
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

          {isProfileLocked && (
            <div style={{ 
              padding: '16px', 
              borderRadius: '8px', 
              backgroundColor: '#fffbeb', 
              border: '1px solid #fde68a', 
              color: '#854d0e', 
              marginBottom: '24px' 
            }}>
              ⚠️ Your profile has been locked by an administrator. You cannot make changes. Contact admin for modifications.
            </div>
          )}

          {message && (
            <div style={{ 
              padding: '16px', 
              borderRadius: '8px', 
              backgroundColor: message.includes('success') ? '#dcfce7' : '#fee2e2', 
              border: '1px solid ' + (message.includes('success') ? '#bbf7d0' : '#fecaca'), 
              color: message.includes('success') ? '#166534' : '#991b1b', 
              marginBottom: '24px' 
            }}>
              {message}
            </div>
          )}

          {loading ? (
            <div style={{ textAlign: 'center', padding: '40px' }}>
              <div style={{ width: '40px', height: '40px', margin: '0 auto 20px', border: '4px solid rgba(102, 126, 234, 0.3)', borderTop: '4px solid #667eea', borderRadius: '50%' }}></div>
              <p>Loading profile...</p>
            </div>
          ) : (
            <form onSubmit={handleSubmit}>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '20px', marginBottom: '24px' }}>
                <div>
                  <label style={{ display: 'block', marginBottom: '8px', fontWeight: '600', color: '#374151' }}>Full Name</label>
                  <input
                    type="text"
                    name="name"
                    value={profile.name}
                    onChange={handleChange}
                    disabled={isProfileLocked}
                    required
                    style={{ 
                      width: '100%', 
                      padding: '12px', 
                      borderRadius: '8px', 
                      border: '1px solid #d1d5db', 
                      fontSize: '16px',
                      backgroundColor: isProfileLocked ? '#f3f4f6' : 'white'
                    }}
                  />
                </div>
                
                <div>
                  <label style={{ display: 'block', marginBottom: '8px', fontWeight: '600', color: '#374151' }}>Register Number</label>
                  <input
                    type="text"
                    name="registerNo"
                    value={profile.registerNo}
                    onChange={handleChange}
                    disabled={isProfileLocked}
                    required
                    style={{ 
                      width: '100%', 
                      padding: '12px', 
                      borderRadius: '8px', 
                      border: '1px solid #d1d5db', 
                      fontSize: '16px',
                      backgroundColor: isProfileLocked ? '#f3f4f6' : 'white'
                    }}
                  />
                </div>
                
                <div>
                  <label style={{ display: 'block', marginBottom: '8px', fontWeight: '600', color: '#374151' }}>Email</label>
                  <input
                    type="email"
                    name="email"
                    value={profile.email}
                    onChange={handleChange}
                    disabled={true}
                    required
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
                
                <div>
                  <label style={{ display: 'block', marginBottom: '8px', fontWeight: '600', color: '#374151' }}>Phone Number</label>
                  <input
                    type="tel"
                    name="phone"
                    value={profile.phone}
                    onChange={handleChange}
                    disabled={isProfileLocked}
                    required
                    style={{ 
                      width: '100%', 
                      padding: '12px', 
                      borderRadius: '8px', 
                      border: '1px solid #d1d5db', 
                      fontSize: '16px',
                      backgroundColor: isProfileLocked ? '#f3f4f6' : 'white'
                    }}
                  />
                </div>
                
                <div>
                  <label style={{ display: 'block', marginBottom: '8px', fontWeight: '600', color: '#374151' }}>Department</label>
                  <select
                    name="department"
                    value={profile.department}
                    onChange={handleChange}
                    disabled={isProfileLocked}
                    required
                    style={{ 
                      width: '100%', 
                      padding: '12px', 
                      borderRadius: '8px', 
                      border: '1px solid #d1d5db', 
                      fontSize: '16px',
                      backgroundColor: isProfileLocked ? '#f3f4f6' : 'white'
                    }}
                  >
                    <option value="">Select Department</option>
                    <option value="CSE">Computer Science & Engineering</option>
                    <option value="IT">Information Technology</option>
                    <option value="ECE">Electronics & Communication Engineering</option>
                    <option value="EEE">Electrical & Electronics Engineering</option>
                    <option value="MECH">Mechanical Engineering</option>
                    <option value="CIVIL">Civil Engineering</option>
                  </select>
                </div>
                
                <div>
                  <label style={{ display: 'block', marginBottom: '8px', fontWeight: '600', color: '#374151' }}>Year</label>
                  <select
                    name="year"
                    value={profile.year}
                    onChange={handleChange}
                    disabled={isProfileLocked}
                    required
                    style={{ 
                      width: '100%', 
                      padding: '12px', 
                      borderRadius: '8px', 
                      border: '1px solid #d1d5db', 
                      fontSize: '16px',
                      backgroundColor: isProfileLocked ? '#f3f4f6' : 'white'
                    }}
                  >
                    <option value="">Select Year</option>
                    <option value="1">1st Year</option>
                    <option value="2">2nd Year</option>
                    <option value="3">3rd Year</option>
                    <option value="4">4th Year</option>
                  </select>
                </div>
                
                <div>
                  <label style={{ display: 'block', marginBottom: '8px', fontWeight: '600', color: '#374151' }}>Section</label>
                  <input
                    type="text"
                    name="section"
                    value={profile.section}
                    onChange={handleChange}
                    disabled={isProfileLocked}
                    required
                    style={{ 
                      width: '100%', 
                      padding: '12px', 
                      borderRadius: '8px', 
                      border: '1px solid #d1d5db', 
                      fontSize: '16px',
                      backgroundColor: isProfileLocked ? '#f3f4f6' : 'white'
                    }}
                  />
                </div>
              </div>
              
              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '12px' }}>
                <button
                  type="button"
                  onClick={() => router.push('/')}
                  style={{ 
                    padding: '12px 24px', 
                    background: '#9ca3af', 
                    color: 'white', 
                    border: 'none', 
                    borderRadius: '12px', 
                    fontSize: '14px', 
                    fontWeight: '600', 
                    cursor: 'pointer' 
                  }}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isProfileLocked || saving}
                  style={{ 
                    padding: '12px 24px', 
                    background: isProfileLocked ? '#d1d5db' : 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)', 
                    color: 'white', 
                    border: 'none', 
                    borderRadius: '12px', 
                    fontSize: '14px', 
                    fontWeight: '600', 
                    cursor: isProfileLocked ? 'not-allowed' : 'pointer',
                    opacity: isProfileLocked ? 0.7 : 1
                  }}
                >
                  {saving ? 'Saving...' : 'Save Profile'}
                </button>
              </div>
            </form>
          )}
        </div>
      </div>
    </div>
  );
}