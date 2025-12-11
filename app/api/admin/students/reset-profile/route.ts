import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function POST(req: Request) {
  try {
    const { studentId } = await req.json();

    if (!studentId) {
      return NextResponse.json({ error: 'Student ID required' }, { status: 400 });
    }

    // 1. Reset the Student Profile (Allow editing)
    const student = await prisma.student.update({
      where: { id: studentId },
      data: { profileCompleted: false }
    });

    // 2. Add Notification for the Student
    if (student.email) {
      await prisma.notification.create({
        data: {
          email: student.email, // Send to this student's email
          title: '🔓 Profile Unlocked',
          message: 'The Admin has unlocked your profile. You can now edit your details.',
          studentId: student.id // Optional link
        }
      });
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Reset Error:", error);
    return NextResponse.json({ error: 'Failed to reset profile' }, { status: 500 });
  }
}