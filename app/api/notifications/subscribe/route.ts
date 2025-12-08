// app/api/notifications/subscribe/route.ts
import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import { prisma } from "@/lib/prisma";

export async function POST(req: Request) {
  const session = await getServerSession(authOptions);

  if (!session || !session.user?.email) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  // Find the student linked to this user
  const student = await prisma.student.findFirst({
    where: { email: session.user.email },
    select: { id: true },
  });

  if (!student) {
    return NextResponse.json({ error: "Not a student" }, { status: 400 });
  }

  const { subscription } = await req.json();

  try {
    await prisma.pushSubscription.upsert({
      where: { endpoint: subscription.endpoint },
      update: {
        p256dh: subscription.keys.p256dh,
        auth: subscription.keys.auth,
        studentId: student.id,
      },
      create: {
        endpoint: subscription.endpoint,
        p256dh: subscription.keys.p256dh,
        auth: subscription.keys.auth,
        studentId: student.id,
      },
    });

    return NextResponse.json({ ok: true });
  } catch (e) {
    console.error("Subscription save error", e);
    return NextResponse.json({ error: "Failed to save subscription" }, { status: 500 });
  }
}
