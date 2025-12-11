import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import webpush from 'web-push';

webpush.setVapidDetails(
  process.env.VAPID_SUBJECT || 'mailto:admin@example.com',
  process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY || '', // Or process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY
  process.env.VAPID_PRIVATE_KEY || ''
);

export async function POST(req: Request) {
  try {
    const { target, title, message } = await req.json(); // 'target' can be a studentID or 'INCOMPLETE'

    let subscriptions = [];

    // 1. DETERMINE RECIPIENTS
    if (target === 'INCOMPLETE') {
      // Find all students where profileCompleted is false
      const students = await prisma.student.findMany({
        where: { profileCompleted: false },
        include: { pushSubscriptions: true } // Get their subscriptions directly
      });
      // Flatten all subscriptions into one array
      subscriptions = students.flatMap(s => s.pushSubscriptions);
      
    } else {
      // It's a specific Student ID
      subscriptions = await prisma.pushSubscription.findMany({
        where: { studentId: target }
      });
    }

    if (subscriptions.length === 0) {
      return NextResponse.json({ error: 'No reachable devices found for this selection.' }, { status: 404 });
    }

    // 2. SEND NOTIFICATIONS
    const payload = JSON.stringify({
      title: title || 'Admin Alert',
      body: message,
      icon: '/icons/icon-192.png',
      url: '/profile' // Clicking takes them to Profile page to fix it
    });

    const notifications = subscriptions.map(sub => 
      webpush.sendNotification({
        endpoint: sub.endpoint,
        keys: { p256dh: sub.p256dh, auth: sub.auth },
      }, payload).catch(() => {})
    );

    await Promise.all(notifications);

    return NextResponse.json({ success: true, count: subscriptions.length });
  } catch (error) {
    console.error('Notify Error:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}