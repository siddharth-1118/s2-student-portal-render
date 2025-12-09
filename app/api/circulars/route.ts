import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";

const ADMIN_EMAILS = [
  "saisiddharthvooka@gmail.com",
  "kothaig2@srmist.edu.in",
];

// GET: Fetch all circulars (Newest first)
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
    if (!session || !session.user?.email || !ADMIN_EMAILS.includes(session.user.email)) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { title, content } = await req.json();

    const newCircular = await prisma.circular.create({
      data: {
        title,
        content,
        authorEmail: session.user.email
      }
    });

    return NextResponse.json(newCircular);
  } catch (error) {
    return NextResponse.json({ error: "Failed to create circular" }, { status: 500 });
  }
}

// PUT: Edit an existing circular
export async function PUT(req: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || !session.user?.email || !ADMIN_EMAILS.includes(session.user.email)) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id, title, content } = await req.json();

    const updatedCircular = await prisma.circular.update({
      where: { id: Number(id) },
      data: { title, content }
    });

    return NextResponse.json(updatedCircular);
  } catch (error) {
    return NextResponse.json({ error: "Failed to update circular" }, { status: 500 });
  }
}

// DELETE: Remove a circular
export async function DELETE(req: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || !session.user?.email || !ADMIN_EMAILS.includes(session.user.email)) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { searchParams } = new URL(req.url);
    const id = searchParams.get('id');

    if (!id) return NextResponse.json({ error: "ID required" }, { status: 400 });

    await prisma.circular.delete({
      where: { id: Number(id) }
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    return NextResponse.json({ error: "Failed to delete circular" }, { status: 500 });
  }
}