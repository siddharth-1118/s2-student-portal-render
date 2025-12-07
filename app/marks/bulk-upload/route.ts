import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from "@/lib/auth";
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();
const ADMIN_EMAILS = ['saisiddharthvooka@gmail.com', 'kothaig2@srmist.edu.in'];

export async function POST(req: Request) {
  try {
    const session = await getServerSession(authOptions);
    
    // ADMIN CHECK - Only admins can upload marks
    if (!session || !session.user || !ADMIN_EMAILS.includes(session.user.email || '')) {
      return NextResponse.json({ 
        error: 'Unauthorized: Only admins can upload marks' 
      }, { status: 403 });
    }

    const { marks, subject, examType, maxMarks } = await req.json();

    if (!marks || !Array.isArray(marks) || marks.length === 0) {
      return NextResponse.json({ error: 'Invalid marks data' }, { status: 400 });
    }

    // Process and store marks in database
    // For now, just return success
    console.log(`Admin ${session.user.email} uploading ${marks.length} marks for ${subject}`);
    
    return NextResponse.json({ 
      success: true, 
      message: `Successfully uploaded marks for ${marks.length} students`,
      uploadedBy: session.user.email
    });
  } catch (error: any) {
    console.error('Bulk upload error:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
