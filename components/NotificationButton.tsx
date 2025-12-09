'use client';
import { useState } from 'react';

// Get key from env
const RAW_PUBLIC_KEY = process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY;

export default function NotificationButton() {
  const [isSubscribed, setIsSubscribed] = useState(false);
  const [loading, setLoading] = useState(false);

  // Helper: Convert Base64 key to Uint8Array (required by browser)
  function urlBase64ToUint8Array(base64String: string) {
    // FIX: Remove any accidental quotes or whitespace
    const cleanKey = base64String.replace(/['"]+/g, '').trim();
    
    const padding = '='.repeat((4 - cleanKey.length % 4) % 4);
    const base64 = (cleanKey + padding).replace(/-/g, '+').replace(/_/g, '/');
    
    const rawData = window.atob(base64);
    const outputArray = new Uint8Array(rawData.length);
    for (let i = 0; i < rawData.length; ++i) {
      outputArray[i] = rawData.charCodeAt(i);
    }
    return outputArray;
  }

  async function subscribe() {
    if (!RAW_PUBLIC_KEY) return alert("System Error: VAPID Key missing in Frontend");
    setLoading(true);

    try {
      if (!('serviceWorker' in navigator)) {
        throw new Error("Browser does not support Service Workers");
      }

      // 1. Register Service Worker
      const registration = await navigator.serviceWorker.register('/sw.js');

      // 2. Subscribe using the cleaned key
      const subscription = await registration.pushManager.subscribe({
        userVisibleOnly: true,
        applicationServerKey: urlBase64ToUint8Array(RAW_PUBLIC_KEY)
      });

      // 3. Save to Database
      const res = await fetch('/api/notifications/subscribe', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(subscription)
      });

      if (!res.ok) throw new Error("Failed to save to database");

      setIsSubscribed(true);
      alert("✅ Notifications Enabled Successfully!");

    } catch (error: any) {
      console.error("Subscription failed:", error);
      alert(`Error: ${error.message}`);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="mt-6 p-6 bg-white border border-gray-200 rounded-lg shadow-sm">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-lg font-bold text-gray-900">🔔 Stay Updated</h3>
          <p className="text-gray-500 text-sm">Get instant alerts for new Marks and Circulars.</p>
        </div>
        <button 
          onClick={subscribe}
          disabled={isSubscribed || loading}
          className={`px-5 py-2 rounded-lg font-bold text-white transition ${
            isSubscribed 
              ? 'bg-green-500 cursor-default' 
              : 'bg-indigo-600 hover:bg-indigo-700 shadow-md'
          }`}
        >
          {loading ? "Activating..." : isSubscribed ? "✅ Active" : "Enable Notifications"}
        </button>
      </div>
    </div>
  );
}