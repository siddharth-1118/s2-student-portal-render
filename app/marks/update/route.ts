// app/api/marks/update/route.ts
import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import { prisma } from "@/lib/prisma";
import { webpush } from "@/lib/webpush";

const ADMIN_EMAILS = [
  "saisiddharthvooka@gmail.com",
  "kothaig2@srmist.edu.in",
];

export async function POST(req: Request) {
  const session = await getServerSession(authOptions);

  // ✅ Only admins can update marks
  if (!session || !session.user?.email || !ADMIN_EMAILS.includes(session.user.email)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const body = await req.json();
  // markId might come as string from the client; normalize it to number
  const markId = typeof body.markId === "string" ? Number(body.markId) : body.markId;
  const scored = typeof body.scored === "string" ? Number(body.scored) : body.scored;

  if (!markId || Number.isNaN(markId)) {
    return NextResponse.json({ error: "Invalid markId" }, { status: 400 });
  }

  try {
    // 1) Update the mark
    const updated = await prisma.mark.update({
      where: { id: markId },
      data: { scored },
    });

    // 2) Fetch mark with student info
    const markWithStudent = await prisma.mark.findUnique({
      where: { id: updated.id },
      include: {
        student: { select: { id: true, name: true, registerNo: true } },
      },
    });

    // 3) Send push notifications (if VAPID keys are configured)
    if (
      markWithStudent &&
      process.env.VAPID_PUBLIC_KEY &&
      process.env.VAPID_PRIVATE_KEY
    ) {
      const subs = await prisma.pushSubscription.findMany({
        where: { studentId: markWithStudent.student.id },
      });

      const payload = JSON.stringify({
        title: "Marks updated",
        body: `${markWithStudent.student.name}: ${markWithStudent.subject} updated to ${updated.scored}/${updated.maxMarks}`,
        url: "/marks/me",
      });

      for (const sub of subs) {
        webpush
          .sendNotification(
            {
              endpoint: sub.endpoint,
              keys: {
                p256dh: sub.p256dh,
                auth: sub.auth,
              },
            } as any,
            payload,
          )
          .catch((err) => {
            console.error("Push error:", err);
          });
      }
    }

    return NextResponse.json(updated);
  } catch (e) {
    console.error("Mark update error:", e);
    return NextResponse.json(
      { error: "Failed to update mark" },
      { status: 500 },
    );
  }
}
