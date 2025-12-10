import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

// ⚠️ IMPORTANT: This line prevents Next.js from showing old cached data
export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    const students = await prisma.student.findMany({
      orderBy: {
        registerNo: 'asc', // Sort by Register Number
      },
      // 👇 THIS IS THE MISSING PART
      include: {
        marks: true, // This tells the DB: "Fetch the marks for these students too"
      },
    });

    return NextResponse.json(students);
  } catch (error) {
    return NextResponse.json({ error: 'Failed to fetch students' }, { status: 500 });
  }
}