import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { day, period, subject, room } = body;

    // Validation
    if (!day || !period || !subject) {
      return NextResponse.json({ error: 'Day, Period, and Subject are required' }, { status: 400 });
    }

    // Create Entry in Database
    const newEntry = await prisma.timetableEntry.create({
      data: {
        day,
        period: Number(period),
        subject,
        room
      }
    });

    return NextResponse.json({ success: true, data: newEntry });
  } catch (error) {
    console.error('Add Class Error:', error);
    return NextResponse.json({ error: 'Failed to add class' }, { status: 500 });
  }
}