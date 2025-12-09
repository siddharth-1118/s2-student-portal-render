import webPush from 'web-push';
import { prisma } from "@/lib/prisma";

// Helper to safely configure web-push only when needed
function setupWebPush() {
  const publicKey = process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY;
  const privateKey = process.env.VAPID_PRIVATE_KEY;
  const subject = process.env.VAPID_SUBJECT || 'mailto:admin@example.com';

  if (!publicKey || !privateKey) {
    console.warn("⚠️ VAPID Keys are missing. Notifications will not be sent.");
    return false;
  }

  try {
    webPush.setVapidDetails(subject, publicKey, privateKey);
    return true;
  } catch (error) {
    console.error("❌ Failed to setup web-push:", error);
    return false;
  }
}

// 1. Send to ALL Students (For Circulars)
export async function sendBroadcastNotification(title: string, message: string) {
  // Initialize configuration right here, just before sending
  if (!setupWebPush()) return;

  try {
    const subs = await prisma.pushSubscription.findMany();
    console.log(`📣 Sending broadcast to ${subs.length} subscribers...`);

    const payload = JSON.stringify({ 
      title: title, 
      body: message,
      url: '/circulars' 
    });

    await Promise.all(subs.map(async (sub) => {
      // Manual check to ensure we have valid endpoint data
      if (!sub.endpoint || !sub.auth || !sub.p256dh) return;

      try {
        await webPush.sendNotification({
          endpoint: sub.endpoint,
          keys: {
            p256dh: sub.p256dh,
            auth: sub.auth
          }
        }, payload);
      } catch (err: any) {
        if (err.statusCode === 410) {
          console.log(`Cleaning up dead subscription for user ${sub.studentId}`);
          try {
            await prisma.pushSubscription.delete({ where: { id: sub.id } });
          } catch (e) { /* Ignore */ }
        } else {
          console.error("Push Error:", err);
        }
      }
    }));

  } catch (e) {
    console.error("Broadcast Error:", e);
  }
}

// 2. Send to SPECIFIC Student (For Marks)
export async function sendMarksUpdateNotification(message: string) {
  await sendBroadcastNotification("📝 Marks Update", message);
}