// app/api/admin/students/[id]/lock/route.ts
import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import { prisma } from "@/lib/prisma";

const ADMIN_EMAILS = [
  "saisiddharthvooka@gmail.com",
  "kothaig2@srmist.edu.in",
];

export async function PUT(req: Request, { params }: { params: { id: string } }) {
  try {
    const session = await getServerSession(authOptions);
    
    // Check if user is admin
    if (!session || !session.user?.email || !ADMIN_EMAILS.includes(session.user.email)) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const studentId = parseInt(params.id);
    if (isNaN(studentId)) {
      return NextResponse.json({ error: "Invalid student ID" }, { status: 400 });
    }

    const { locked } = await req.json();

    // Update student profile lock status
    const updatedStudent = await prisma.student.update({
      where: { id: studentId },
      data: {
        profileLocked: locked
      },
      select: {
        id: true,
        name: true,
        registerNo: true,
        email: true,
        phone: true,
        department: true,
        year: true,
        section: true,
        profileLocked: true,
        profileCompleted: true
      }
    });

    return NextResponse.json(updatedStudent);
  } catch (error) {
    console.error("Error updating student profile lock status:", error);
    return NextResponse.json({ error: "Failed to update student profile lock status" }, { status: 500 });
  }
}