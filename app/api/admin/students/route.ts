import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

// Force dynamic so it always fetches the latest list
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
    return NextResponse.json(students);
  } catch (error) {
    return NextResponse.json({ error: "Failed to fetch students" }, { status: 500 });
  }
}