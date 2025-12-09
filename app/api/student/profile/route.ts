// app/api/student/profile/route.ts
import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function GET() {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session || !session.user?.email) {
      return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
    }

    // Find the student linked to this email
    const student = await prisma.student.findFirst({
      where: { email: session.user.email },
      select: {
        id: true,
        name: true,
        registerNo: true,
        email: true,
        phone: true,
        department: true,
        year: true,
        section: true,
        profileCompleted: true
      }
    });

    if (!student) {
      return NextResponse.json({ error: "No student record found for this email" }, { status: 404 });
    }

    return NextResponse.json(student);
  } catch (error) {
    console.error("Error fetching student profile:", error);
    return NextResponse.json({ error: "Failed to fetch student profile" }, { status: 500 });
  }
}

export async function PUT(req: Request) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session || !session.user?.email) {
      return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
    }

    // Find the student linked to this email using raw query to avoid type issues
    const students: any = await prisma.$queryRaw`SELECT * FROM "Student" WHERE "email" = ${session.user.email}`;
    const student = students[0];

    if (!student) {
      return NextResponse.json({ error: "No student record found for this email" }, { status: 404 });
    }

    // Check if profile is locked

    const { name, registerNo, phone, department, year, section } = await req.json();

    // Validate required fields
    if (!name || !registerNo || !phone || !department || !year || !section) {
      return NextResponse.json({ error: "All fields are required" }, { status: 400 });
    }

    // Update student profile
    const updatedStudent: any = await prisma.$queryRaw`UPDATE "Student" SET 
      "name" = ${name},
      "registerNo" = ${registerNo},
      "phone" = ${phone},
      "department" = ${department},
      "year" = ${year},
      "section" = ${section},
      "profileCompleted" = true
      WHERE "id" = ${student.id}
      RETURNING *`;

    return NextResponse.json(updatedStudent[0]);
  } catch (error) {
    console.error("Error updating student profile:", error);
    return NextResponse.json({ error: "Failed to update student profile" }, { status: 500 });
  }
}
