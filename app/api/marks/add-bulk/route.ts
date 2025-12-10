import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function POST(req: Request) {
  try {
    const { marks } = await req.json();

    if (!marks || !Array.isArray(marks)) {
      return NextResponse.json({ error: 'Invalid data format' }, { status: 400 });
    }

    // Loop through each mark to UPSERT (Update if exists, Create if new)
    for (const entry of marks) {
      const existingMark = await prisma.mark.findFirst({
        where: {
          studentId: entry.studentId,
          subject: entry.subject,
          examType: 'Internal', // Assuming this is your default
        }
      });

      if (existingMark) {
        // UPDATE existing mark
        await prisma.mark.update({
          where: { id: existingMark.id },
          data: { 
            scored: Number(entry.mark) 
          }
        });
      } else {
        // CREATE new mark
        await prisma.mark.create({
          data: {
            studentId: entry.studentId,
            subject: entry.subject,
            scored: Number(entry.mark),
            examType: 'Internal',
            maxMarks: 100
          }
        });
      }
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Bulk Upload Error:', error);
    return NextResponse.json({ error: 'Failed to save marks' }, { status: 500 });
  }
}