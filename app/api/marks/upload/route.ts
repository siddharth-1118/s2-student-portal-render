import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { sendMarksUpdateNotification } from "@/lib/notifications";

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { marks } = body;

    // FIX: Handle "No marks data provided" error
    if (!marks || !Array.isArray(marks) || marks.length === 0) {
      console.error("❌ Upload failed: Payload was empty");
      return NextResponse.json({ error: "No marks data provided" }, { status: 400 });
    }

    console.log(`📝 Processing ${marks.length} marks...`);
    let count = 0;

    for (const entry of marks) {
      // 1. Find Student by Register Number
      const student = await prisma.student.findUnique({
        where: { registerNo: String(entry.registerNo).trim() }
      });

      if (student) {
        // 2. Save/Update Mark
        await prisma.mark.create({
          data: {
            studentId: student.id,
            subject: entry.subject,
            scored: parseFloat(entry.scored),
            maxMarks: parseFloat(entry.maxMarks) || 100,
            examType: entry.examType || "Internal"
          }
        });
        count++;

        // 3. Notify Specific Student
        // (We send a general broadcast for now to ensure delivery, specific targeting requires user mapping)
        await sendMarksUpdateNotification(`New mark uploaded for ${entry.subject}: ${entry.scored}`);
      } else {
        console.warn(`⚠️ Student not found: ${entry.registerNo}`);
      }
    }

    return NextResponse.json({ success: true, count });
  } catch (error) {
    console.error("Server Error:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}