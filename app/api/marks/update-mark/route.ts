// app/api/marks/update-mark/route.ts
import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

const ADMIN_EMAILS = [
  "saisiddharthvooka@gmail.com",
  "kothaig2@srmist.edu.in",
];

export async function POST(req: Request) {
  const session = await getServerSession(authOptions);

  // ✅ Only admins can update marks
  if (!session || !session.user?.email || !ADMIN_EMAILS.includes(session.user.email)) {
    return NextResponse.json({ error: "Unauthorized (not admin)" }, { status: 401 });
  }

  try {
    const { markId, scored } = await req.json();

    if (!markId || scored === undefined) {
      return NextResponse.json(
        { error: "Missing markId or scored value" },
        { status: 400 }
      );
    }

    // Update the mark
    const updatedMark = await prisma.mark.update({
      where: { id: markId },
      data: { scored: Number(scored) }
    });

    return NextResponse.json({ success: true, mark: updatedMark });
  } catch (e) {
    console.error("Update mark error:", e);
    return NextResponse.json(
      { error: "Failed to update mark" },
      { status: 500 }
    );
  }
}