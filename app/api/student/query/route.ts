import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { prisma } from '@/lib/prisma';
import { authOptions } from '@/lib/auth'; // ⚠️ Check this path! Might be '@/app/api/auth/[...nextauth]/route'

const ADMIN_EMAILS = ['saisiddharthvooka@gmail.com', 'kothaig2@srmist.edu.in'];

export async function POST(req: Request) {
  try {
    const session = await getServerSession(authOptions);
    const { message } = await req.json();

    // Safer check to ensure user and email exist
    if (!session || !session.user || !session.user.email || !message) {
      return NextResponse.json({ error: 'Invalid Request' }, { status: 400 });
    }

    const studentName = session.user.name || 'Unknown Student';
    const studentEmail = session.user.email;

    // Create a notification for EVERY Admin
    // We use Promise.all to run them in parallel
    await Promise.all(
      ADMIN_EMAILS.map(adminEmail => 
        prisma.notification.create({
          data: {
            email: adminEmail,
            title: `📝 Query: ${studentName}`,
            message: `${studentName} asks: "${message}"`,
            studentId: studentEmail 
          }
        })
      )
    );

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Query Error:", error);
    return NextResponse.json({ error: 'Failed to send query' }, { status: 500 });
  }
}