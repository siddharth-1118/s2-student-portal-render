import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function DELETE(req: Request) {
  try {
    // This deletes ALL marks from the database
    await prisma.mark.deleteMany({});
    
    return NextResponse.json({ success: true, message: "All marks deleted." });
  } catch (error) {
    return NextResponse.json({ error: "Failed to reset database" }, { status: 500 });
  }
}