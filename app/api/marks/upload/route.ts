import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { sendMarksUpdateNotification } from "@/lib/notifications"; // Ensure this file exists

// Force dynamic to prevent caching issues
export const dynamic = 'force-dynamic';

const ADMIN_EMAILS = [
  "saisiddharthvooka@gmail.com",
  "kothaig2@srmist.edu.in",
];

export async function POST(req: Request) {
  try {
    // 1. Security Check
    const session = await getServerSession(authOptions);
    if (!session || !session.user?.email || !ADMIN_EMAILS.includes(session.user.email)) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await req.json();
    const { marks } = body; // Expecting { marks: [...] } from the Gradebook frontend

    if (!Array.isArray(marks) || marks.length === 0) {
      return NextResponse.json({ error: "No marks data provided" }, { status: 400 });
    }

    console.log(`📝 Processing ${marks.length} mark entries...`);

    let createdCount = 0;
    let updatedCount = 0;

    // 2. Process Each Row
    for (const entry of marks) {
      // Validate basic data
      if (!entry.registerNo || !entry.subject || !entry.scored) continue;

      // Find the student (using Register Number is safest)
      const student = await prisma.student.findUnique({
        where: { registerNo: entry.registerNo }
      });

      if (!student) {
        console.warn(`Skipping unknown student: ${entry.registerNo}`);
        continue;
      }

      // Prepare data types
      const scored = parseFloat(entry.scored);
      const maxMarks = parseFloat(entry.maxMarks) || 100;
      const subject = entry.subject.trim();
      const examType = entry.examType?.trim() || "Internal";

      // Check if mark already exists (to update instead of create duplicates)
      const existingMark = await prisma.mark.findFirst({
        where: {
          studentId: student.id,
          subject: subject,
          examType: examType
        }
      });

      if (existingMark) {
        await prisma.mark.update({
          where: { id: existingMark.id },
          data: { scored, maxMarks }
        });
        updatedCount++;
      } else {
        await prisma.mark.create({
          data: {
            studentId: student.id,
            subject,
            examType,
            scored,
            maxMarks
          }
        });
        createdCount++;
      }
    }

    // 3. Send Notifications (Only if we actually changed data)
    if (createdCount > 0 || updatedCount > 0) {
      // Safely check for VAPID keys before trying to send
      if (process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY && process.env.VAPID_PRIVATE_KEY) {
        try {
          const message = `📢 New Marks Alert: ${createdCount} added, ${updatedCount} updated. Check your portal!`;
          await sendMarksUpdateNotification(message);
          console.log("✅ Notifications sent successfully.");
        } catch (notifError) {
          console.error("⚠️ Failed to send notifications:", notifError);
          // We don't fail the request here, just log the error
        }
      } else {
        console.log("ℹ️ Skipping notifications (VAPID keys missing).");
      }
    }

    return NextResponse.json({
      success: true,
      message: `Processed ${marks.length} rows. Added: ${createdCount}, Updated: ${updatedCount}`,
      stats: { createdCount, updatedCount }
    });

  } catch (error) {
    console.error("❌ Upload error:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}