import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    const students = await prisma.student.findMany({
      select: {
        id: true,
        registerNo: true,
        name: true
      },
      orderBy: { registerNo: 'asc' }
    });
    
    // Safety check: If no students, return empty array instead of crashing
    if (!students) return NextResponse.json([]);
    
    return NextResponse.json(students);
  } catch (error) {
    return NextResponse.json({ error: "Failed to fetch students" }, { status: 500 });
  }
}