// app/api/student/register/route.ts

import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import { prisma } from "@/lib/prisma";

export async function POST(req: Request) {
  try {
    // 1️⃣ Make sure user is logged in
    const session = await getServerSession(authOptions);

    if (!session || !session.user?.email) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      );
    }

    const email = session.user.email;
    const nameFromSession = session.user.name || "Unknown Student";

    // 2️⃣ Read register number from request body
    const { registerNo } = await req.json();

    if (!registerNo || typeof registerNo !== "string") {
      return NextResponse.json(
        { error: "Register number is required" },
        { status: 400 }
      );
    }

    const normalizedReg = registerNo.trim().toUpperCase();

    // 3️⃣ Upsert student using email
    const student = await prisma.student.upsert({
      where: { email },
      update: {
        registerNo: normalizedReg,
        name: nameFromSession,
      },
      create: {
        email,
        name: nameFromSession,
        registerNo: normalizedReg,
      },
    });

    return NextResponse.json({
      ok: true,
      student,
    });
  } catch (error) {
    console.error("Student register error:", error);
    return NextResponse.json(
      { error: "Failed to complete profile" },
      { status: 500 }
    );
  }
}
