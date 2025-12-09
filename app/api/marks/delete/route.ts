// app/api/marks/delete/route.ts
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

  // ✅ Only admins can delete marks
  if (!session || !session.user?.email || !ADMIN_EMAILS.includes(session.user.email)) {
    return NextResponse.json({ error: "Unauthorized (not admin)" }, { status: 401 });
  }

  try {
    const { markId } = await req.json();

    if (!markId) {
      return NextResponse.json(
        { error: "Missing markId" },
        { status: 400 }
      );
    }

    // Delete the mark
    await prisma.mark.delete({
      where: { id: markId }
    });

    return NextResponse.json({ success: true });
  } catch (e) {
    console.error("Delete mark error:", e);
    return NextResponse.json(
      { error: "Failed to delete mark" },
      { status: 500 }
    );
  }
}