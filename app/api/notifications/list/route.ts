import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { prisma } from '@/lib/prisma';
import { authOptions } from '@/lib/auth';

export const dynamic = 'force-dynamic';

export async function GET() {
  const session = await getServerSession(authOptions);
  
  if (!session?.user?.email) {
    return NextResponse.json([]);
  }

  // Get notifications for the logged-in user
  const notifications = await prisma.notification.findMany({
    where: { email: session.user.email },
    orderBy: { createdAt: 'desc' }
  });

  return NextResponse.json(notifications);
}

// Mark notification as read
export async function PUT(req: Request) {
  try {
    const { id } = await req.json();
    await prisma.notification.update({
      where: { id: Number(id) },
      data: { isRead: true }
    });
    return NextResponse.json({ success: true });
  } catch (error) {
    return NextResponse.json({ error: 'Failed' }, { status: 500 });
  }
}