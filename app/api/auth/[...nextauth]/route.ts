import NextAuth, { type NextAuthOptions } from "next-auth";
import GoogleProvider from "next-auth/providers/google";
import { prisma } from "@/lib/prisma";

const ADMIN_EMAILS = [
  "saisiddharthvooka@gmail.com",
  "kothaig2@srmist.edu.in",
];

const secret = process.env.NEXTAUTH_SECRET;
if (!secret) {
  throw new Error("NEXTAUTH_SECRET environment variable is not set");
}

export const authOptions: NextAuthOptions = {
  secret,
  providers: [
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID!,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
    }),
  ],
  callbacks: {
    async signIn({ user }) {
      const email = user.email;
      if (!email) return false;

      // admins always allowed
      if (ADMIN_EMAILS.includes(email)) return true;

      // must exist as Student
      const student = await prisma.student.findFirst({
        where: { email },
      });

      return !!student;
    },

    async session({ session }) {
      if (!session.user?.email) return session;

      const student = await prisma.student.findFirst({
        where: { email: session.user.email },
        select: { id: true, registerNo: true, name: true },
      });

      if (student) {
        (session.user as any).studentId = student.id;
        (session.user as any).registerNo = student.registerNo;
      }

      return session;
    },
  },
};

const handler = NextAuth(authOptions);
export { handler as GET, handler as POST };
