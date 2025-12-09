'use client';
import { useState, useEffect } from 'react';

// This uses the key from your .env file
const PUBLIC_KEY = process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY;

export default function NotificationButton() {
  const [isSubscribed, setIsSubscribed] = useState(false);
  const [loading, setLoading] = useState(false);

  // Helper to convert key
  function urlBase64ToUint8Array(base64String: string) {
    const padding = '='.repeat((4 - base64String.length % 4) % 4);
    const base64 = (base64String + padding).replace(/-/g, '+').replace(/_/g, '/');
    const rawData = window.atob(base64);
    const outputArray = new Uint8Array(rawData.length);
    for (let i = 0; i < rawData.length; ++i) {
      outputArray[i] = rawData.charCodeAt(i);
    }
    return outputArray;
  }

  async function subscribe() {
    if (!PUBLIC_KEY) return alert("System Error: VAPID Key missing");
    setLoading(true);

    try {
      // 1. Register Service Worker
      const registration = await navigator.serviceWorker.register('/sw.js');

      // 2. Subscribe to Chrome/Firefox Push Server
      const subscription = await registration.pushManager.subscribe({
        userVisibleOnly: true,
        applicationServerKey: urlBase64ToUint8Array(PUBLIC_KEY)
      });

      // 3. Send Subscription to Our Backend
      await fetch('/api/notifications/subscribe', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(subscription)
      });

      setIsSubscribed(true);
      alert("✅ You will now receive notifications!");
    } catch (error) {
      console.error(error);
      alert("Please check your browser settings and Allow Notifications.");
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