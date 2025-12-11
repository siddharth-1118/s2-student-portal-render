import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    const students = await prisma.student.findMany({
      orderBy: { registerNo: 'asc' },
      // ⚠️ CRITICAL: We explicitly select the fields we want to see
      select: {
        id: true,
        registerNo: true,
        name: true,
        email: true,
        // Add the missing profile fields here:
        phone: true,
        department: true,
        year: true,
        section: true,
        profileCompleted: true, // Useful to see who hasn't finished
        marks: true // Keep this to count marks
      }
    });

    return NextResponse.json(students);
  } catch (error) {
    return NextResponse.json({ error: 'Failed to fetch students' }, { status: 500 });
  }
}