import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import { prisma } from "@/lib/prisma";
import { sendMarksUpdateNotification } from "@/lib/notifications";

const ADMIN_EMAILS = [
  "saisiddharthvooka@gmail.com",
  "kothaig2@srmist.edu.in",
];

// Simple AI analysis function for demo purposes
function analyzeStudentPerformance(marks: any[]) {
  if (marks.length === 0) return "No marks data available";
  
  const totalSubjects = marks.length;
  const passedSubjects = marks.filter(mark => 
    mark.scored >= (mark.maxMarks * 0.4) // Assuming 40% is pass mark
  ).length;
  
  const averagePercentage = marks.reduce((sum, mark) => 
    sum + (mark.scored / mark.maxMarks) * 100, 0) / marks.length;
  
  let performanceLevel = "";
  if (averagePercentage >= 90) performanceLevel = "Excellent";
  else if (averagePercentage >= 75) performanceLevel = "Good";
  else if (averagePercentage >= 60) performanceLevel = "Average";
  else if (averagePercentage >= 40) performanceLevel = "Below Average";
  else performanceLevel = "Needs Improvement";
  
  return {
    totalSubjects,
    passedSubjects,
    averagePercentage: averagePercentage.toFixed(2),
    performanceLevel,
    recommendations: generateRecommendations(marks)
  };
}

function generateRecommendations(marks: any[]) {
  const recommendations = [];
  
  // Subject-wise recommendations
  marks.forEach(mark => {
    const percentage = (mark.scored / mark.maxMarks) * 100;
    if (percentage < 40) {
      recommendations.push(`Focus more on ${mark.subject}. Consider extra study hours or tutoring.`);
    } else if (percentage < 60) {
      recommendations.push(`Improve in ${mark.subject} with additional practice.`);
    }
  });
  
  // Overall recommendations
  const weakSubjects = marks.filter(mark => (mark.scored / mark.maxMarks) * 100 < 60);
  if (weakSubjects.length > marks.length / 2) {
    recommendations.push("Consider seeking academic support for overall improvement.");
  }
  
  if (recommendations.length === 0) {
    recommendations.push("Keep up the good work! Maintain your study habits.");
  }
  
  return recommendations;
}

export async function POST(req: Request) {
  const session = await getServerSession(authOptions);

  if (!session || !session.user?.email || !ADMIN_EMAILS.includes(session.user.email)) {
    return NextResponse.json({ error: "Unauthorized (not admin)" }, { status: 401 });
  }

  const body = await req.json();

  let rows: Array<Record<string, any>> | undefined;

  if (Array.isArray(body)) {
    rows = body;
  } else {
    for (const value of Object.values(body)) {
      if (
        Array.isArray(value) &&
        value.length > 0 &&
        typeof value[0] === "object" &&
        value[0] !== null
      ) {
        rows = value as Array<Record<string, any>>;
        break;
      }
    }
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

  const sample = rows[0];

  const lowerKeys = Object.keys(sample).reduce<Record<string, string>>(
    (acc, key) => {
      acc[key.toLowerCase().trim()] = key;
      return acc;
    },
    {},
  );

  const registerKey =
    lowerKeys["register number"] ||
    lowerKeys["reg no"] ||
    lowerKeys["regno"] ||
    lowerKeys["register_no"] ||
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
    let updatedCount = 0;
    const problems: string[] = [];
    const studentAnalyses: any[] = []; // Store AI analyses for each student

    for (const row of rows) {
      const regRaw = row[registerKey];
      const reg = regRaw ? String(regRaw).trim() : "";

      if (!reg) {
        problems.push("Row without register number, skipping.");
        continue;
      }

      const nameRaw = nameKey ? row[nameKey] : null;
      const name = nameRaw ? String(nameRaw).trim() : "Unknown";

      // First, check if student already exists in database with an email
      const existingStudent = await prisma.student.findUnique({
        where: { registerNo: reg },
      });

      // Prepare student data for upsert
      let studentData: { registerNo: string; name: string; email?: string } = {
        registerNo: reg,
        name,
      };

      // If student already exists, preserve their email
      if (existingStudent?.email) {
        studentData.email = existingStudent.email;
      }

      const student = await prisma.student.upsert({
        where: { registerNo: reg },
        update: { 
          name,
          // Preserve email if it exists
          ...(existingStudent?.email && { email: existingStudent.email })
        },
        create: studentData,
      });

      // Store marks for this student to analyze later
      const studentMarks: any[] = [];

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

        const examType =
          typeof body.examType === "string" && body.examType.trim() !== ""
            ? body.examType
            : "Internal";

        const maxMarks =
          typeof body.maxMarks === "number" && !Number.isNaN(body.maxMarks)
            ? body.maxMarks
            : 100;

        const existing = await prisma.mark.findFirst({
          where: {
            studentId: student.id,
            subject: subjectName,
            examType,
          },
        });

        if (existing) {
          await prisma.mark.update({
            where: { id: existing.id },
            data: { scored, maxMarks },
          });
          updatedCount++;
        } else {
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

        // Store mark for AI analysis
        studentMarks.push({
          subject: subjectName,
          scored,
          maxMarks,
          examType
        });
      }

      // Perform AI analysis for this student
      const analysis = analyzeStudentPerformance(studentMarks);
      studentAnalyses.push({
        studentId: student.id,
        registerNo: student.registerNo,
        name: student.name,
        email: student.email,
        analysis
      });

      // Optionally, you could store this analysis in the database
      // For now, we'll just collect it for the response
    }

    // Send notification to all subscribed students
    if (createdCount > 0 || updatedCount > 0) {
      const message = `New marks have been uploaded. ${createdCount} new marks added, ${updatedCount} marks updated.`;
      await sendMarksUpdateNotification(message);
    }

    return NextResponse.json({
      ok: true,
      createdCount,
      updatedCount,
      problems,
      studentAnalyses // Include AI analyses in response
    });
  } catch (e) {
    console.error("Bulk upload marks error:", e);
    return NextResponse.json(
      { error: "Failed to upload marks (server error)" },
      { status: 500 },
    );
  }
}