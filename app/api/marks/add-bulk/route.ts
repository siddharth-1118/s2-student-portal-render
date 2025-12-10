import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import webpush from 'web-push';

// 1. CONFIGURE WEB PUSH (Use your VAPID keys from .env)
webpush.setVapidDetails(
  'mailto:your-email@example.com',
  process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY || '',
  process.env.VAPID_PRIVATE_KEY || ''
);

export async function POST(req: Request) {
  try {
    const { marks } = await req.json();

    if (!marks || !Array.isArray(marks)) {
      return NextResponse.json({ error: 'Invalid data format' }, { status: 400 });
    }

    // 2. SAVE MARKS TO DATABASE
    for (const entry of marks) {
      // Logic to upsert (create or update) marks
      const existingMark = await prisma.mark.findFirst({
        where: {
          studentId: entry.studentId,
          subject: entry.subject,
          examType: 'Internal',
        }
      });

      if (existingMark) {
        await prisma.mark.update({
          where: { id: existingMark.id },
          data: { 
            scored: Number(entry.mark),
            maxMarks: Number(entry.maxMarks || 100)
          }
        });
      } else {
        await prisma.mark.create({
          data: {
            studentId: entry.studentId,
            subject: entry.subject,
            scored: Number(entry.mark),
            maxMarks: Number(entry.maxMarks || 100),
            examType: 'Internal',
          }
        });
      }

      // 3. SEND NOTIFICATION (New Logic)
      try {
        // A. Find the student's subscription
        const subscriptions = await prisma.pushSubscription.findMany({
          where: { studentId: entry.studentId }
        });

        // B. Define the message
        const payload = JSON.stringify({
          title: '📢 New Marks Uploaded!',
          body: `Your marks for ${entry.subject} have been released: ${entry.mark}/${entry.maxMarks || 100}`,
          icon: '/icons/icon-192.png', // Ensure you have this icon in public/icons
          url: '/student/marks'
        });

        // C. Send to all user's devices (Laptop, Phone, etc.)
        for (const sub of subscriptions) {
          try {
            await webpush.sendNotification({
              endpoint: sub.endpoint,
              keys: {
                p256dh: sub.p256dh,
                auth: sub.auth,
              },
            }, payload);
          } catch (err) {
            console.error('Failed to send push to one device', err);
            // Optional: Delete invalid subscription here
          }
        }
      } catch (notifyError) {
        console.error("Notification Error (Mark saved anyway):", notifyError);
      }
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Bulk Upload Error:', error);
    return NextResponse.json({ error: 'Failed to save marks' }, { status: 500 });
  }
}