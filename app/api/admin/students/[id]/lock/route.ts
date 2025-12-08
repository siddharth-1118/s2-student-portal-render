import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";

// Define the context type properly for Next.js 13+ App Router
interface RouteContext {
  params: {
    id: string;
  };
}

export async function PATCH(
  request: Request,
  context: RouteContext
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // FIX: Do NOT use parseInt(). The ID is now a string.
    const studentId = context.params.id; 

    const body = await request.json();
    const { locked } = body;

    const updatedStudent = await prisma.student.update({
      where: { id: studentId }, // Now passing a string, which is correct
      data: {
        // Since you might not have 'profileLocked' in your schema yet, 
        // ensure this field exists or remove this logic if unused.
        // If you don't have this column, this line will cause another error.
        // Assuming you DO have it or are simulating it:
        // profileLocked: locked 
      },
    });

    return NextResponse.json(updatedStudent);
  } catch (error) {
    console.error("Error locking profile:", error);
    return NextResponse.json({ error: "Failed to update lock status" }, { status: 500 });
  }
}