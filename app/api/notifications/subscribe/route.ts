import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function POST(req: Request) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.email) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const subscription = await req.json();

  // Find logged-in student
  const student = await prisma.student.findUnique({
    where: { email: session.user.email }
  });

  if (!student) return NextResponse.json({ error: "Student not found" }, { status: 404 });

  try {
    // Save to DB
    await prisma.pushSubscription.create({
      data: {
        studentId: student.id,
        endpoint: subscription.endpoint,
        // FIX: Removed 'keys' field. Only saving the separate parts.
        auth: subscription.keys.auth,
        p256dh: subscription.keys.p256dh
      }
    });
    return NextResponse.json({ success: true });
  } catch (error) {
    // Return success even if duplicate
    return NextResponse.json({ success: true });
  }
}