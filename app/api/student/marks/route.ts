import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { prisma } from '@/lib/prisma';
import { authOptions } from '@/lib/auth'; // Ensure this path points to your auth config

export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    // 1. Get the logged-in user's session
    const session = await getServerSession(authOptions);

    if (!session || !session.user?.email) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // 2. Find the Student ID using their email
    const student = await prisma.student.findUnique({
      where: { email: session.user.email },
      include: {
        marks: true // <--- CRITICAL: Get the marks!
      }
    });

    if (!student) {
      return NextResponse.json({ error: 'Student profile not found' }, { status: 404 });
    }

    // 3. Send the marks back
    return NextResponse.json(student.marks);
    
  } catch (error) {
    console.error("Error fetching marks:", error);
    return NextResponse.json({ error: 'Failed to fetch marks' }, { status: 500 });
  }
}