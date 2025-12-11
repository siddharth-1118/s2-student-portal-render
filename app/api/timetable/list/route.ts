import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

// Force dynamic to ensure we always get the latest data
export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    const timetable = await prisma.timetableEntry.findMany({
      orderBy: [
        { day: 'asc' },   // Sort by Day
        { period: 'asc' } // Then by Period
      ]
    });

    return NextResponse.json(timetable);
  } catch (error) {
    console.error('Timetable Fetch Error:', error);
    return NextResponse.json({ error: 'Failed to fetch timetable' }, { status: 500 });
  }
}