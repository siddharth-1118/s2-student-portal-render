import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { prisma } from '@/lib/prisma';
import { authOptions } from '@/lib/auth'; // Adjust path if needed

export async function POST(req: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || !session.user?.email) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const data = await req.json();

    // 1. Check if already locked
    const currentStudent = await prisma.student.findUnique({
      where: { email: session.user.email }
    });

    if (currentStudent?.profileCompleted) {
      return NextResponse.json({ error: 'Profile is locked. Contact Admin.' }, { status: 403 });
    }

    // 2. Update and LOCK the profile
    await prisma.student.update({
      where: { email: session.user.email },
      data: {
        name: data.name,
        registerNo: data.registerNo,
        phone: data.phone,
        department: data.department,
        year: data.year,
        section: data.section,
        profileCompleted: true // 🔒 THIS LOCKS IT
      }
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Profile Update Error:', error);
    return NextResponse.json({ error: 'Failed to update profile' }, { status: 500 });
  }
}