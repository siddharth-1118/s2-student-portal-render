import webPush from 'web-push';
import { prisma } from "@/lib/prisma";

// Configure Web Push with your keys
const publicKey = process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY;
const privateKey = process.env.VAPID_PRIVATE_KEY;
const subject = process.env.VAPID_SUBJECT;

if (publicKey && privateKey && subject) {
  webPush.setVapidDetails(subject, publicKey, privateKey);
}

// 1. Send to ALL Students (For Circulars)
export async function sendBroadcastNotification(title: string, message: string) {
  try {
    const subs = await prisma.pushSubscription.findMany();
    console.log(`📣 Sending broadcast to ${subs.length} subscribers...`);

    const payload = JSON.stringify({ 
      title: title, 
      body: message,
      url: '/circulars' 
    });

    await Promise.all(subs.map(async (sub) => {
      try {
        await webPush.sendNotification({
          endpoint: sub.endpoint,
          // FIX: Construct the keys object manually from separate columns
          keys: {
            p256dh: sub.p256dh,
            auth: sub.auth
          }
        }, payload);
      } catch (err: any) {
        if (err.statusCode === 410) {
          // Subscription is dead (user blocked us), delete it
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