'use client';

import { useState, useEffect } from 'react';

export default function NotificationBell() {
  const [notifications, setNotifications] = useState<any[]>([]);
  const [isOpen, setIsOpen] = useState(false);
  const unreadCount = notifications.filter(n => !n.isRead).length;

  const fetchNotifications = async () => {
    const res = await fetch('/api/notifications/list');
    if (res.ok) setNotifications(await res.json());
  };

  useEffect(() => {
    fetchNotifications();
    // Poll every 30 seconds for new messages
    const interval = setInterval(fetchNotifications, 30000); 
    return () => clearInterval(interval);
  }, []);

  const markRead = async (id: number) => {
    await fetch('/api/notifications/list', {
      method: 'PUT',
      body: JSON.stringify({ id })
    });
    setNotifications(prev => prev.map(n => n.id === id ? { ...n, isRead: true } : n));
  };

  return (
    <div style={{ position: 'relative' }}>
      {/* BELL ICON */}
      <button 
        onClick={() => setIsOpen(!isOpen)}
        style={{ background: 'none', border: 'none', fontSize: '24px', cursor: 'pointer', position: 'relative' }}
      >
        🔔
        {unreadCount > 0 && (
          <span style={{ 
            position: 'absolute', top: '-5px', right: '-5px', 
            background: '#ef4444', color: 'white', fontSize: '10px', 
            padding: '2px 6px', borderRadius: '10px', fontWeight: 'bold' 
          }}>
            {unreadCount}
          </span>
        )}
      </button>

      {/* DROPDOWN LIST */}
      {isOpen && (
        <div style={{
          position: 'absolute', right: 0, top: '40px', width: '300px',
          background: 'white', border: '1px solid #e5e7eb', borderRadius: '12px',
          boxShadow: '0 10px 30px rgba(0,0,0,0.1)', zIndex: 1000, maxHeight: '400px', overflowY: 'auto'
        }}>
          <div style={{ padding: '12px', borderBottom: '1px solid #f3f4f6', fontWeight: 'bold' }}>Notifications</div>
          
          {notifications.length === 0 ? (
            <div style={{ padding: '20px', textAlign: 'center', color: '#6b7280', fontSize: '14px' }}>No notifications</div>
          ) : (
            notifications.map(n => (
              <div 
                key={n.id} 
                onClick={() => markRead(n.id)}
                style={{ 
                  padding: '12px', 
                  borderBottom: '1px solid #f3f4f6', 
                  background: n.isRead ? 'white' : '#eff6ff',
                  cursor: 'pointer' 
                }}
              >
                <div style={{ fontWeight: '600', fontSize: '14px', color: '#1f2937' }}>{n.title}</div>
                <div style={{ fontSize: '13px', color: '#4b5563', marginTop: '2px' }}>{n.message}</div>
                <div style={{ fontSize: '10px', color: '#9ca3af', marginTop: '4px' }}>
                  {new Date(n.createdAt).toLocaleDateString()}
                </div>
              </div>
            ))
          )}
        </div>
      )}
    </div>
  );
}