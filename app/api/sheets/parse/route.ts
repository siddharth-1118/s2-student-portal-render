import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from "@/app/api/auth/[...nextauth]/route";

const ADMIN_EMAILS = ['saisiddharthvooka@gmail.com', 'kothaig2@srmist.edu.in'];

export async function POST(req: Request) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session || !ADMIN_EMAILS.includes(session.user?.email || '')) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { sheetUrl } = await req.json();
    
    // Extract sheet ID from URL
    const sheetIdMatch = sheetUrl.match(/\/d\/([a-zA-Z0-9-_]+)/);
    const gidMatch = sheetUrl.match(/gid=([0-9]+)/);
    
    if (!session || !ADMIN_EMAILS.includes(session.user?.email || '')) {
  return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
}

    
    const sheetId = sheetIdMatch[1];
    const gid = gidMatch ? gidMatch[1] : '0';
    
    // Convert to CSV export URL
    const csvUrl = `https://docs.google.com/spreadsheets/d/${sheetId}/export?format=csv&gid=${gid}`;
    
    console.log('Fetching CSV from:', csvUrl);
    
    // Fetch the CSV data
    const response = await fetch(csvUrl);
    if (!response.ok) {
      return NextResponse.json({ error: 'Failed to fetch spreadsheet. Make sure it is publicly accessible.' }, { status: 400 });
    }
    
    const csvText = await response.text();
    console.log('CSV first 200 chars:', csvText.substring(0, 200));
    
    // Parse CSV more carefully
    const lines = csvText.split('\n').filter(line => line.trim());
    if (lines.length < 2) {
      return NextResponse.json({ error: 'Spreadsheet appears to be empty' }, { status: 400 });
    }
    
    // Parse headers
    const headerLine = lines[0];
    const headers = headerLine.split(',').map(h => h.trim().replace(/^"|"$/g, ''));
    
    console.log('Headers:', headers);
    
    // Parse data rows
    const data = [];
    for (let i = 1; i < lines.length; i++) {
      const line = lines[i];
      if (!line.trim()) continue;
      
      // Simple CSV parsing (handles basic cases)
      const values = line.split(',').map(v => v.trim().replace(/^"|"$/g, ''));
      
      const row: any = {};
      headers.forEach((header, index) => {
        row[header] = values[index] || '';
      });
      
      // Check if row has a register number (any variation)
      const hasRegNo = headers.some(h => 
        h.toLowerCase().includes('register') || 
        h.toLowerCase().includes('reg') ||
        h.toLowerCase().includes('roll')
      );
      
      // Get the first column value (usually register number)
      const firstColValue = values[0];
      
      if (firstColValue && firstColValue.trim()) {
        data.push(row);
      }
    }
    
    console.log('Parsed', data.length, 'rows');
    console.log('Sample row:', data[0]);
    
    // AI Analysis
    const analysis = {
      totalStudents: data.length,
      columns: headers,
      sampleData: data.slice(0, 5),
      insights: {
        hasRegisterNo: headers.some(h => h.toLowerCase().includes('register') || h.toLowerCase().includes('reg')),
        hasStudentName: headers.some(h => h.toLowerCase().includes('name') || h.toLowerCase().includes('student')),
        marksColumns: headers.filter(h => 
          h.toLowerCase().includes('marks') || 
          h.toLowerCase().includes('score') ||
          h.toLowerCase().includes('total')
        ),
        suggestion: `✅ Successfully detected ${data.length} students with ${headers.length} columns. Data is ready to import!`
      }
    };
    
    return NextResponse.json({ data, analysis });
  } catch (error: any) {
    console.error('Sheet parsing error:', error);
    return NextResponse.json({ error: error.message || 'Failed to parse spreadsheet' }, { status: 500 });
  }
}
