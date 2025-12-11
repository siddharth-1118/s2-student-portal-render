'use client';

import { useState, useEffect } from 'react';

// Helper to convert key (same as before)
const urlBase64ToUint8Array = (base64String: string) => {
  const padding = '='.repeat((4 - base64String.length % 4) % 4);
  const base64 = (base64String + padding).replace(/\-/g, '+').replace(/_/g, '/');
  const rawData = window.atob(base64);
  const outputArray = new Uint8Array(rawData.length);
  for (let i = 0; i < rawData.length; ++i) {
    outputArray[i] = rawData.charCodeAt(i);
  }
  return outputArray;
};

export default function NotificationReminder() {
  const [showBanner, setShowBanner] = useState(false);
  const [permissionState, setPermissionState] = useState('default'); // default, granted, denied

  useEffect(() => {
    // 1. Check browser support
    if (!('serviceWorker' in navigator) || !('Notification' in window)) {
      return; // Not supported, don't show banner
    }

    // 2. Check current permission status
    setPermissionState(Notification.permission);

    // 3. If not granted, show banner
    if (Notification.permission === 'default') {
      setShowBanner(true);
    } 
    // If denied, we might want to show instructions (optional)
    else if (Notification.permission === 'denied') {
      setShowBanner(true);
    }
  }, []);

  const enableNotifications = async () => {
    try {
      const register = await navigator.serviceWorker.ready;
      const publicKey = process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY;
      
      if (!publicKey) return alert("System Error: VAPID Key missing");

      const subscription = await register.pushManager.subscribe({
        userVisibleOnly: true,
        applicationServerKey: urlBase64ToUint8Array(publicKey.trim())
      });

      // Save to DB
      await fetch('/api/notification/subscribe', {
        method: 'POST',
        body: JSON.stringify(subscription),
        headers: { 'Content-Type': 'application/json' }
      });

      alert("✅ Notifications Enabled! This banner will disappear.");
      setShowBanner(false);
      setPermissionState('granted');
      
    } catch (error) {
      console.error(error);
      alert("Failed to enable. If you blocked notifications previously, please click the Lock icon 🔒 in your URL bar to Reset Permissions.");
    }
  };

  if (!showBanner || permissionState === 'granted') return null;

  return (
    <div style={{
      position: 'fixed',
      bottom: '20px',
      left: '50%',
      transform: 'translateX(-50%)',
      width: '90%',
      maxWidth: '600px',
      background: permissionState === 'denied' ? '#fef2f2' : '#eff6ff', // Red if denied, Blue if default
      border: permissionState === 'denied' ? '1px solid #fecaca' : '1px solid #bfdbfe',
      borderRadius: '12px',
      padding: '16px',
      boxShadow: '0 10px 30px rgba(0,0,0,0.1)',
      zIndex: 9999,
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'space-between',
      gap: '15px'
    }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
        <div style={{ fontSize: '24px' }}>🔔</div>
        <div>
          <h4 style={{ margin: 0, fontSize: '16px', fontWeight: 'bold', color: '#1e3a8a' }}>
            {permissionState === 'denied' ? 'Notifications Blocked' : 'Don\'t miss updates!'}
          </h4>
          <p style={{ margin: '4px 0 0 0', fontSize: '13px', color: '#64748b' }}>
            {permissionState === 'denied' 
              ? 'Please click the 🔒 icon in your address bar and "Reset Permission" to allow notifications.' 
              : 'Enable notifications to get instant alerts for marks and timetable.'}
          </p>
        </div>
      </div>

      {permissionState === 'default' && (
        <button 
          onClick={enableNotifications}
          style={{
            whiteSpace: 'nowrap',
            padding: '10px 20px',
            background: '#2563eb',
            color: 'white',
            border: 'none',
            borderRadius: '8px',
            fontWeight: 'bold',
            cursor: 'pointer'
          }}
        >
          Enable Now
        </button>
      )}
    </div>
  );
}