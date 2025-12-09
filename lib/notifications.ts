import webPush from 'web-push';
import { prisma } from "@/lib/prisma";

// Safe setup for VAPID keys
function setupWebPush() {
  const publicKey = process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY;
  const privateKey = process.env.VAPID_PRIVATE_KEY;
  const subject = process.env.VAPID_SUBJECT || 'mailto:admin@example.com';

  if (publicKey && privateKey) {
    webPush.setVapidDetails(subject, publicKey, privateKey);
    return true;
  }
  return false;
}

export async function sendBroadcastNotification(title: string, message: string) {
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
      // FIX: Check for separate columns
      if (!sub.endpoint || !sub.auth || !sub.p256dh) return;

      try {
        await webPush.sendNotification({
          endpoint: sub.endpoint,
          // FIX: Construct the keys object manually
          keys: {
            p256dh: sub.p256dh,
            auth: sub.auth
          }
        }, payload);
      } catch (err: any) {
        if (err.statusCode === 410) {
          try {
            await prisma.pushSubscription.delete({ where: { id: sub.id } });
          } catch (e) { /* Ignore */ }
        }
      }
    }));
  } catch (e) {
    console.error("Broadcast Error:", e);
  }
}

export async function sendMarksUpdateNotification(message: string) {
  await sendBroadcastNotification("📝 Marks Update", message);
}