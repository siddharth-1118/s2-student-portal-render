import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export const dynamic = 'force-dynamic'; // Ensure it always fetches fresh data

export async function GET() {
  try {
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
    return NextResponse.json({ error: 'Failed to fetch marks' }, { status: 500 });
  }
}