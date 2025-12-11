import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { prisma } from '@/lib/prisma';
import { authOptions } from '@/lib/auth'; // ⚠️ Check this path! It might be '@/app/api/auth/[...nextauth]/route' or '@/auth' depending on your project

export async function POST(req: Request) {
  try {
    const subscription = await req.json();

    if (!subscription || !subscription.endpoint) {
      return NextResponse.json({ error: 'Invalid subscription data' }, { status: 400 });
    }

    // 1. Get Logged In User
    const session = await getServerSession(authOptions);
    
    // ⚠️ Debugging: Log session to see if it exists
    console.log("Session in Subscribe API:", session);

    if (!session || !session.user?.email) {
      return NextResponse.json({ error: 'You must be logged in to enable notifications' }, { status: 401 });
    }

    // 2. Find Student ID based on Email
    const student = await prisma.student.findUnique({
      where: { email: session.user.email }
    });

    if (!student) {
      return NextResponse.json({ error: 'Student profile not found for this user' }, { status: 404 });
    }

    // 3. Save to Database
    // We use 'upsert' to avoid creating duplicates for the same device
    await prisma.pushSubscription.upsert({
      where: { endpoint: subscription.endpoint },
      update: {
        p256dh: subscription.keys.p256dh,
        auth: subscription.keys.auth,
        studentId: student.id,
      },
      create: {
        endpoint: subscription.endpoint,
        p256dh: subscription.keys.p256dh,
        auth: subscription.keys.auth,
        studentId: student.id,
      },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Subscribe API Error:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}