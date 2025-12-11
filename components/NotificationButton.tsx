'use client';

import { useState } from 'react';

// HELPER: Converts the VAPID key string to the format browsers need
const urlBase64ToUint8Array = (base64String: string) => {
  try {
    const padding = '='.repeat((4 - base64String.length % 4) % 4);
    const base64 = (base64String + padding)
      .replace(/\-/g, '+')
      .replace(/_/g, '/');

    const rawData = window.atob(base64);
    const outputArray = new Uint8Array(rawData.length);

    for (let i = 0; i < rawData.length; ++i) {
      outputArray[i] = rawData.charCodeAt(i);
    }
    return outputArray;
  } catch (e) {
    console.error("VAPID Conversion Error:", e);
    throw new Error("VAPID Key is malformed.");
  }
};

export default function NotificationButton() {
  const [status, setStatus] = useState('Enable Notifications');

  const subscribe = async () => {
    try {
      setStatus('Checking...');

      // 1. Check if Service Workers are supported
      if (!('serviceWorker' in navigator)) {
        throw new Error("This browser does not support Service Workers");
      }

      // 2. Register Service Worker
      const register = await navigator.serviceWorker.register('/sw.js');
      await navigator.serviceWorker.ready; 

      // 3. Get Key from ENV (We removed the hardcoded string)
      let publicKey = process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY;
      
      console.log("USING KEY:", publicKey); // This should print your NEW key in console

      if (!publicKey) {
        throw new Error("Public Key missing. Restart server!");
      }

      // 4. Convert Key
      const convertedKey = urlBase64ToUint8Array(publicKey.trim());

      // 5. Attempt Subscription
      const subscription = await register.pushManager.subscribe({
        userVisibleOnly: true,
        applicationServerKey: convertedKey
      });

      // 6. Save to Backend
      const res = await fetch('/api/notification/subscribe', {
        method: 'POST',
        body: JSON.stringify(subscription),
        headers: { 'Content-Type': 'application/json' }
      });

      if (!res.ok) throw new Error("Failed to save subscription");

      setStatus('✅ Notifications Enabled!');
      alert("Success! Notifications enabled.");

    } catch (error: any) {
      console.error(error);
      alert(`Error: ${error.message || error}`);
      setStatus('Retry Enable Notifications');
    }
  };

  return (
    <button 
      onClick={subscribe}
      style={{ padding: '10px 20px', background: '#2563eb', color: 'white', borderRadius: '8px', border: 'none', cursor: 'pointer' }}
    >
      {status}
    </button>
  );
}