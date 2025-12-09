import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { day, period, subject, room } = body;

    const newEntry = await prisma.timetableEntry.create({
      data: {
        day,
        period: parseInt(period),
        subject,
        room
      }
    });

    return NextResponse.json(newEntry);
  } catch (error) {
    return NextResponse.json({ error: "Failed to create class" }, { status: 500 });
  }
}