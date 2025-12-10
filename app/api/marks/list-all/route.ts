import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

// Force Next.js to always fetch fresh data (no caching)
export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    // Fetch all marks and include the student details (Reg No, Name)
    const marks = await prisma.mark.findMany({
      include: {
        student: {
          select: {
            registerNo: true,
            name: true,
          }
        }
      },
      orderBy: {
        student: {
          registerNo: 'asc'
        }
      }
    });

    return NextResponse.json(marks);
  } catch (error) {
    console.error("API Error:", error);
    return NextResponse.json({ error: 'Failed to fetch marks' }, { status: 500 });
  }
}