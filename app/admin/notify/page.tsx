'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';

export default function SendNotificationPage() {
  const router = useRouter();
  const [students, setStudents] = useState<any[]>([]);
  const [target, setTarget] = useState(''); // Stores Student ID or 'INCOMPLETE'
  const [title, setTitle] = useState('');
  const [message, setMessage] = useState('');
  const [loading, setLoading] = useState(false);
  const [status, setStatus] = useState<{ type: 'success' | 'error', text: string } | null>(null);

  useEffect(() => {
    fetch('/api/admin/students')
      .then(res => res.json())
      .then(data => setStudents(data));
  }, []);

  const handleSend = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setStatus(null);

    try {
      const res = await fetch('/api/admin/notify', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          target: target, // Send the selected target
          title: title,
          message: message
        })
      });

      const data = await res.json();
      if (res.ok) {
        setStatus({ type: 'success', text: `Sent to ${data.count} device(s)!` });
        setMessage('');
      } else {
        setStatus({ type: 'error', text: data.error || 'Failed.' });
      }
    } catch (error) {
      setStatus({ type: 'error', text: 'Server error.' });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ minHeight: '100vh', padding: '40px', background: '#f3f4f6' }}>
      <div style={{ maxWidth: '600px', margin: '0 auto', background: 'white', padding: '30px', borderRadius: '16px' }}>
        
        <h1 style={{ fontSize: '24px', fontWeight: 'bold', marginBottom: '20px' }}>🔔 Send Notification</h1>

        <form onSubmit={handleSend} style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
          
          {/* RECIPIENT SELECTOR */}
          <div>
            <label style={{ display: 'block', fontWeight: 'bold', marginBottom: '8px' }}>Recipient</label>
            <select 
              value={target} 
              onChange={(e) => setTarget(e.target.value)}
              required
              style={{ width: '100%', padding: '12px', borderRadius: '8px', border: '2px solid #2563eb' }}
            >
              <option value="">-- Choose Recipient --</option>
              
              {/* 🟢 SPECIAL OPTION FOR INCOMPLETE PROFILES */}
              <option value="INCOMPLETE" style={{ fontWeight: 'bold', color: '#d97706' }}>
                ⚠️ All Incomplete Profiles
              </option>

              <optgroup label="Specific Students">
                {students.map(s => (
                  <option key={s.id} value={s.id}>{s.registerNo} - {s.name}</option>
                ))}
              </optgroup>
            </select>
          </div>

          <div>
            <label style={{ display: 'block', fontWeight: 'bold', marginBottom: '8px' }}>Title</label>
            <input 
              type="text" 
              value={title} 
              onChange={(e) => setTitle(e.target.value)} 
              placeholder="e.g. Profile Pending"
              required
              style={{ width: '100%', padding: '12px', borderRadius: '8px', border: '1px solid #d1d5db' }}
            />
          </div>

          <div>
            <label style={{ display: 'block', fontWeight: 'bold', marginBottom: '8px' }}>Message</label>
            <textarea 
              value={message} 
              onChange={(e) => setMessage(e.target.value)} 
              placeholder="e.g. Please complete your profile details immediately."
              required rows={4}
              style={{ width: '100%', padding: '12px', borderRadius: '8px', border: '1px solid #d1d5db' }}
            />
          </div>

          {status && (
            <div style={{ padding: '10px', borderRadius: '8px', background: status.type === 'success' ? '#dcfce7' : '#fee2e2' }}>
              {status.text}
            </div>
          )}

          <button 
            type="submit" disabled={loading}
            style={{ padding: '15px', background: '#2563eb', color: 'white', border: 'none', borderRadius: '10px', fontWeight: 'bold', cursor: 'pointer' }}
          >
            {loading ? 'Sending...' : '🚀 Send Notification'}
          </button>
        </form>
      </div>
    </div>
  );
}