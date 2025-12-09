// app/marks/upload/route.ts
import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

const ADMIN_EMAILS = [
  "saisiddharthvooka@gmail.com",
  "kothaig2@srmist.edu.in",
];

export async function POST(req: Request) {
  const session = await getServerSession(authOptions);

  // ✅ Only admins can upload marks
  if (!session || !session.user?.email || !ADMIN_EMAILS.includes(session.user.email)) {
    return NextResponse.json({ error: "Unauthorized (not admin)" }, { status: 401 });
  }

  const body = await req.json();

  // 🔍 Try to detect where the rows are in the payload
  let rows: Array<Record<string, any>> | undefined;

  if (Array.isArray(body)) {
    rows = body;
  } else if (Array.isArray(body.rows)) {
    rows = body.rows;
  } else if (Array.isArray(body.data)) {
    rows = body.data;
  } else if (Array.isArray(body.students)) {
    rows = body.students;
  } else if (Array.isArray(body.parsed)) {
    rows = body.parsed;
  }

  if (!rows || rows.length === 0) {
    return NextResponse.json(
      {
        error: "No rows provided to upload",
        receivedKeys: Object.keys(body || {}),
      },
      { status: 400 },
    );
  }

  // Take a sample row to detect columns like "register number", "student name", etc.
  const sample = rows[0];

  const lowerKeys = Object.keys(sample).reduce<Record<string, string>>((acc, key) => {
    acc[key.toLowerCase().trim()] = key;
    return acc;
  }, {});

  // Try to find register number + student name columns
  const registerKey =
    lowerKeys["register number"] ||
    lowerKeys["reg no"] ||
    lowerKeys["regno"] ||
    lowerKeys["reg_number"] ||
    lowerKeys["registernumber"];

  const nameKey =
    lowerKeys["student name"] ||
    lowerKeys["name"] ||
    lowerKeys["student"];

  if (!registerKey) {
    return NextResponse.json(
      {
        error:
          "Could not detect 'register number' column. Make sure one column is named like 'register number' or 'reg no'.",
        columns: Object.keys(sample),
      },
      { status: 400 },
    );
  }

  // Any other column is treated as a subject column (e.g. "maths", "physics")
  const subjectKeys = Object.keys(sample).filter(
    (k) => k !== registerKey && k !== nameKey,
  );

  if (subjectKeys.length === 0) {
    return NextResponse.json(
      {
        error:
          "No subject columns detected. There should be at least one column with marks (e.g. 'maths').",
        columns: Object.keys(sample),
      },
      { status: 400 },
    );
  }

  try {
    let createdCount = 0;
    const problems: string[] = [];

    for (const row of rows) {
      const reg = String(row[registerKey] ?? "").trim();
      if (!reg) {
        problems.push("Row without register number, skipping.");
        continue;
      }

      const student = await prisma.student.findUnique({
        where: { registerNo: reg },
      });

      if (!student) {
        problems.push(`No student found for register number ${reg}, skipping.`);
        continue;
      }

      for (const subjectKey of subjectKeys) {
        const rawScore = row[subjectKey];

        if (
          rawScore === undefined ||
          rawScore === null ||
          rawScore === "" ||
          Number.isNaN(Number(rawScore))
        ) {
          continue;
        }

        const scored = Number(rawScore);
        const subjectName = subjectKey.toString().trim();

        // Default values – you can change these if needed
        const examType = (body.examType as string) || "Internal";
        const maxMarks =
          typeof body.maxMarks === "number" ? body.maxMarks : 100;

        await prisma.mark.create({
          data: {
            studentId: student.id,
            subject: subjectName,
            examType,
            maxMarks,
            scored,
          },
        });

        createdCount++;
      }
    }

    return NextResponse.json({
      ok: true,
      createdCount,
      problems, // you can log this in console if needed
    });
  } catch (e) {
    console.error("Bulk upload marks error:", e);
    return NextResponse.json(
      { error: "Failed to upload marks (server error)" },
      { status: 500 },
    );
  }
}
