import webpush from "web-push";

let isVapidConfigured = false;

function ensureVapidConfigured() {
  if (!isVapidConfigured) {
    const publicKey = process.env.VAPID_PUBLIC_KEY!;
    const privateKey = process.env.VAPID_PRIVATE_KEY!;
    const subject = process.env.VAPID_SUBJECT || "mailto:you@example.com";
    
    webpush.setVapidDetails(subject, publicKey, privateKey);
    isVapidConfigured = true;
  }
}

// Lazy-load the public key
export function getPublicKey() {
  ensureVapidConfigured();
  return process.env.VAPID_PUBLIC_KEY!;
}

export { webpush };
