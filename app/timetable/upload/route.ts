import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from "@/lib/auth";

const ADMIN_EMAILS = ['saisiddharthvooka@gmail.com', 'kothaig2@srmist.edu.in'];

export async function POST(req: Request) {
  try {
    const session = await getServerSession(authOptions);
    
    // ADMIN CHECK - Only admins can upload timetable
    if (!session || !ADMIN_EMAILS.includes(session.user?.email || '')) {
      return NextResponse.json({ 
        error: 'Unauthorized: Only admins can upload timetables' 
      }, { status: 403 });
    }

    const { url, timetableData } = await req.json();

    console.log(`Admin ${(session.user?.email ?? 'unknown user')} uploading timetable from: ${url}`);
    
    // Store timetable in database (placeholder)
    return NextResponse.json({ 
      success: true, 
      message: 'Timetable uploaded successfully',
      uploadedBy: session.user?.email
    });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
