import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";

// GET: Fetch all circulars
export async function GET() {
  try {
    const circulars = await prisma.circular.findMany({
      orderBy: { createdAt: 'desc' }
    });
    return NextResponse.json(circulars);
  } catch (error) {
    return NextResponse.json({ error: "Failed to fetch circulars" }, { status: 500 });
  }
}

// POST: Create a new circular
export async function POST(req: Request) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session || !session.user?.email) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { title, content } = await req.json();

    if (!title || !content) {
      return NextResponse.json({ error: "Title and content are required" }, { status: 400 });
    }

    const newCircular = await prisma.circular.create({
      data: {
        title,
        content,
        authorEmail: session.user.email
      }
    });

    return NextResponse.json(newCircular);
  } catch (error) {
    console.error("Circular creation error:", error);
    return NextResponse.json({ error: "Failed to create circular" }, { status: 500 });
  }
}