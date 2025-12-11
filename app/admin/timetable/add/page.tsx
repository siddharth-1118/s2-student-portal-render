'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';

export default function AddClassPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  
  // Form State
  const [formData, setFormData] = useState({
    day: 'Monday',
    period: 1,
    subject: '',
    room: ''
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const res = await fetch('/api/admin/timetable/add', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });

      if (res.ok) {
        alert('Class added successfully!');
        router.push('/admin/timetable'); // Go back to the list
      } else {
        const data = await res.json();
        alert(data.error || 'Failed to add class');
      }
    } catch (error) {
      alert('Error connecting to server');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ minHeight: '100vh', background: '#f3f4f6', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '20px' }}>
      <div style={{ width: '100%', maxWidth: '500px', background: 'white', padding: '30px', borderRadius: '12px', boxShadow: '0 4px 6px rgba(0,0,0,0.1)' }}>
        
        <h1 style={{ fontSize: '24px', fontWeight: 'bold', marginBottom: '20px', color: '#1f2937' }}>➕ Add New Class</h1>
        
        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
          
          {/* Day Selection */}
          <div>
            <label style={{ display: 'block', marginBottom: '5px', fontWeight: '600', color: '#4b5563' }}>Day</label>
            <select 
              value={formData.day}
              onChange={(e) => setFormData({...formData, day: e.target.value})}
              style={{ width: '100%', padding: '10px', borderRadius: '6px', border: '1px solid #d1d5db' }}
            >
              {['Day- 1', 'Day- 2', 'Day- 3', 'Day- 4', 'Day- 5'].map(day => (
                <option key={day} value={day}>{day}</option>
              ))}
            </select>
          </div>

          {/* Period Input */}
          <div>
            <label style={{ display: 'block', marginBottom: '5px', fontWeight: '600', color: '#4b5563' }}>Period Number</label>
            <input 
              type="number" 
              min="1" max="10"
              value={formData.period}
              onChange={(e) => setFormData({...formData, period: Number(e.target.value)})}
              required
              style={{ width: '100%', padding: '10px', borderRadius: '6px', border: '1px solid #d1d5db' }}
            />
          </div>

          {/* Subject Input */}
          <div>
            <label style={{ display: 'block', marginBottom: '5px', fontWeight: '600', color: '#4b5563' }}>Subject Name</label>
            <input 
              type="text" 
              placeholder="e.g. Mathematics"
              value={formData.subject}
              onChange={(e) => setFormData({...formData, subject: e.target.value})}
              required
              style={{ width: '100%', padding: '10px', borderRadius: '6px', border: '1px solid #d1d5db' }}
            />
          </div>

          {/* Room Input (Optional) */}
          <div>
            <label style={{ display: 'block', marginBottom: '5px', fontWeight: '600', color: '#4b5563' }}>Room Number (Optional)</label>
            <input 
              type="text" 
              placeholder="e.g. 301-B"
              value={formData.room}
              onChange={(e) => setFormData({...formData, room: e.target.value})}
              style={{ width: '100%', padding: '10px', borderRadius: '6px', border: '1px solid #d1d5db' }}
            />
          </div>

          {/* Buttons */}
          <div style={{ display: 'flex', gap: '10px', marginTop: '10px' }}>
            <button 
              type="button" 
              onClick={() => router.back()}
              style={{ flex: 1, padding: '12px', background: '#e5e7eb', color: '#374151', border: 'none', borderRadius: '8px', cursor: 'pointer', fontWeight: 'bold' }}
            >
              Cancel
            </button>
            <button 
              type="submit" 
              disabled={loading}
              style={{ flex: 1, padding: '12px', background: '#2563eb', color: 'white', border: 'none', borderRadius: '8px', cursor: 'pointer', fontWeight: 'bold' }}
            >
              {loading ? 'Saving...' : 'Save Class'}
            </button>
          </div>

        </form>
      </div>
    </div>
  );
}