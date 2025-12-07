import CredentialsProvider from "next-auth/providers/credentials";
import { prisma } from "@/lib/prisma";

export const authOptions = {
  secret: process.env.NEXTAUTH_SECRET,
  session: { strategy: "jwt" as const },
  providers: [
    CredentialsProvider({
      name: "Credentials",
      credentials: {
        username: { label: "Register No", type: "text" },
        password: { label: "Password", type: "password" }
      },
      async authorize(credentials: any) {
        if (!credentials?.username) return null;
        const student = await prisma.student.findUnique({
          where: { registerNo: credentials.username }
        });
        if (student) {
          return { 
            id: String(student.id), 
            name: student.name, 
            email: student.registerNo 
          } as any;
        }
        return null;
      }
    })
  ],
};