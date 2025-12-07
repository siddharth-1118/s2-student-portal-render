import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import { prisma } from "@/lib/prisma";

export default async function MyMarksPage() {
  const session = await getServerSession(authOptions);

  if (!session || (session.user as any).role !== "STUDENT") {
    return <div style={{ padding: 24 }}>Not authorized</div>;
  }

  // Find student by email
  const student = await prisma.student.findUnique({
    where: { email: session.user?.email || "" },
    include: { marks: true },
  });

  if (!student) {
    return (
      <div style={{ padding: 24 }}>
        <h1>Register First</h1>
        <p>Please register your roll number first</p>
        <a href="/register"><button>Register Now</button></a>
      </div>
    );
  }

  return (
    <main style={{ padding: 24 }}>
      <h1>My Marks</h1>
      <p>Name: {student.name}</p>
      <p>Roll: {student.registerNo}</p>
      <a href="/">← Back to Home</a>

      <div style={{ marginTop: 24 }}>
        {student.marks.length === 0 ? (
          <p>No marks available yet</p>
        ) : (
          <table border={1} cellPadding={8} style={{ width: "100%" }}>
            <thead>
              <tr>
                <th>Subject</th>
                <th>Exam Type</th>
                <th>Max Marks</th>
                <th>Scored</th>
                <th>Percentage</th>
              </tr>
            </thead>
            <tbody>
              {student.marks.map(mark => (
                <tr key={mark.id}>
                  <td>{mark.subject}</td>
                  <td>{mark.examType}</td>
                  <td>{mark.maxMarks}</td>
                  <td>{mark.scored}</td>
                  <td>{((mark.scored / mark.maxMarks) * 100).toFixed(2)}%</td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </main>
  );
}
