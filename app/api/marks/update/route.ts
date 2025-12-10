// app/api/marks/update/route.ts
import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function PUT(req: Request) {
  try {
    const { id, mark } = await req.json(); // We still receive "mark" from frontend

    if (!id || mark === undefined) {
      return NextResponse.json({ error: 'Missing Data' }, { status: 400 });
    }

    // FIX 1: Convert 'id' to Number (because your schema says id is Int)
    // FIX 2: Save to 'scored' (because your schema says scored, not mark)
    const updatedMark = await prisma.mark.update({
      where: { id: Number(id) }, 
      data: { scored: Number(mark) }, 
    });

    return NextResponse.json({ success: true, data: updatedMark });
  } catch (error) {
    console.error('Update Error:', error);
    return NextResponse.json({ error: 'Failed to update mark' }, { status: 500 });
  }
}