"use client";

import { useEffect, useState } from "react";

export function NotificationSetup() {
  const [ready, setReady] = useState(false);
  const [enabled, setEnabled] = useState(false);

  useEffect(() => {
    if (typeof window === "undefined") return;
    if (!("serviceWorker" in navigator) || !("PushManager" in window)) return;
    setReady(true);
  }, []);

  const subscribe = async () => {
    try {
      const registration = await navigator.serviceWorker.register("/sw.js");

      const permission = await Notification.requestPermission();
      if (permission !== "granted") return;

      const res = await fetch("/api/notifications/public-key");
      const { publicKey } = await res.json();
      
      // Check if publicKey is valid
      if (!publicKey) {
        console.error("Public key is missing");
        return;
      }

      const subscription = await registration.pushManager.subscribe({
        userVisibleOnly: true,
        applicationServerKey: urlBase64ToUint8Array(publicKey),
      });

      await fetch("/api/notifications/subscribe", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ subscription }),
      });

      setEnabled(true);
    } catch (e) {
      console.error("Subscription error", e);
    }
  };

  if (!ready) return null;

  return (
    <div className="mt-4 rounded-2xl border border-slate-200 p-3 text-xs text-slate-600">
      <p className="mb-2">
        {enabled
          ? "Notifications are enabled for this device."
          : "Enable notifications to get updates when your marks are changed."}
      </p>
      {!enabled && (
        <button
          onClick={subscribe}
          className="rounded bg-blue-600 px-3 py-1 text-xs text-white"
        >
          Enable notifications
        </button>
      )}
    </div>
  );
}

function urlBase64ToUint8Array(base64String: string) {
  const padding = "=".repeat((4 - (base64String.length % 4)) % 4);
  const base64 = (base64String + padding)
    .replace(/-/g, "+")
    .replace(/_/g, "/");

  const rawData = atob(base64);
  const outputArray = new Uint8Array(rawData.length);

  for (let i = 0; i < rawData.length; ++i) {
    outputArray[i] = rawData.charCodeAt(i);
  }
  return outputArray;
}
