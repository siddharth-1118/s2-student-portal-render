// app/api/admin/check/route.ts
import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";

const ADMIN_EMAILS = [
  "saisiddharthvooka@gmail.com",
  "kothaig2@srmist.edu.in",
];

export async function GET() {
  try {
    const session = await getServerSession(authOptions);

    const email = session?.user?.email || null;
    const isAdmin = !!email && ADMIN_EMAILS.includes(email);

    return NextResponse.json({ isAdmin, email });
  } catch (err) {
    console.error("admin/check error:", err);
    return NextResponse.json(
      { isAdmin: false, error: "Failed to check admin status" },
      { status: 500 },
    );
  }
}
