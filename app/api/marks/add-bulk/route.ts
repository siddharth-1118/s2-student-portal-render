import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function POST(req: Request) {
  try {
    const { marks } = await req.json();

    if (!marks || !Array.isArray(marks)) {
      return NextResponse.json({ error: 'Invalid data format' }, { status: 400 });
    }

    for (const entry of marks) {
      const existingMark = await prisma.mark.findFirst({
        where: {
          studentId: entry.studentId,
          subject: entry.subject,
          examType: 'Internal', 
        }
      });

      if (existingMark) {
        // Update existing
        await prisma.mark.update({
          where: { id: existingMark.id },
          data: { 
            scored: Number(entry.mark),
            maxMarks: Number(entry.maxMarks || 100) // 🟢 UPDATE MAX MARKS TOO
          }
        });
      } else {
        // Create new
        await prisma.mark.create({
          data: {
            studentId: entry.studentId,
            subject: entry.subject,
            scored: Number(entry.mark),
            examType: 'Internal',
            // 🟢 USE THE CUSTOM MAX MARK
            maxMarks: Number(entry.maxMarks || 100) 
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