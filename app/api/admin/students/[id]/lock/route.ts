import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";

export async function PATCH(
  request: Request,
  // FIX 1: Type the context correctly for newer Next.js versions (params is a Promise)
  context: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // FIX 2: You MUST await 'context.params' before using the ID
    const { id } = await context.params;
    const studentId = id; // It is already a string, so no need for parseInt

    const body = await request.json();
    const { locked } = body;

    // Note: If you don't have 'profileLocked' in your database schema yet,
    // this update might fail silently or throw an error.
    // Ensure you added that column if you intend to use it.
    const updatedStudent = await prisma.student.update({
      where: { id: studentId },
      data: {
        // profileLocked: locked // Uncomment this only if you added the column to schema.prisma
      },
    });

    return NextResponse.json(updatedStudent);
  } catch (error) {
    console.error("Error locking profile:", error);
    return NextResponse.json({ error: "Failed to update lock status" }, { status: 500 });
  }
}