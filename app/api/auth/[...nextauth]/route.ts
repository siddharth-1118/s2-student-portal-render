// app/api/auth/[...nextauth]/route.ts

import NextAuth, { type NextAuthOptions } from "next-auth";
import GoogleProvider from "next-auth/providers/google";
import CredentialsProvider from "next-auth/providers/credentials";
import { prisma } from "@/lib/prisma";

const ADMIN_EMAILS = [
  "saisiddharthvooka@gmail.com",
  "kothaig2@srmist.edu.in",
];

export const authOptions: NextAuthOptions = {
  secret: process.env.NEXTAUTH_SECRET, // don't throw here
  providers: [
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID ?? "",
      clientSecret: process.env.GOOGLE_CLIENT_SECRET ?? "",
    }),
    CredentialsProvider({
      name: "Credentials",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" }
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) {
          return null;
        }

        // Check if user is an admin
        const isAdmin = ADMIN_EMAILS.includes(credentials.email);
        
        // For non-admin users, restrict to srmist.edu.in domain
        if (!isAdmin && !credentials.email.endsWith("@srmist.edu.in")) {
          throw new Error("Only SRMIST email addresses are allowed");
        }

        // For admin users, allow any domain but validate against admin emails
        if (isAdmin) {
          // Simple password check for admin (in production, use proper authentication)
          // For demo purposes, we'll use a simple check
          if (credentials.password !== "admin123") { // This should be improved in production
            return null;
          }
          
          return {
            id: "admin",
            email: credentials.email,
            name: credentials.email.includes("saisiddharthvooka") ? "Sai Siddharth" : "Admin User",
          };
        }

        // For student users, find in database
        const students: any = await prisma.$queryRaw`SELECT * FROM "Student" WHERE "email" = ${credentials.email}`;
        const student = students[0];

        // If no student found or no password set, return null
        if (!student || !student.password) {
          return null;
        }

        // Simple password comparison (in production, use bcrypt)
        if (credentials.password !== student.password) {
          return null;
        }

        return {
          id: student.id.toString(),
          email: student.email,
          name: student.name,
        };
      }
    })
  ],
  callbacks: {
    async signIn({ user, account }) {
      const email = user.email;
      if (!email) return false;

      // Allow admins
      if (ADMIN_EMAILS.includes(email)) return true;

      // Restrict to srmist.edu.in domain for Google login
      if (account?.provider === "google" && !email.endsWith("@srmist.edu.in")) {
        return false;
      }

      // Allow only students present in DB
      const student = await prisma.student.findFirst({
        where: { email },
      });

      return !!student;
    },

    async session({ session }) {
      if (!session.user?.email) return session;

      const student = await prisma.student.findFirst({
        where: { email: session.user.email },
        select: { 
          id: true, 
          registerNo: true, 
          name: true,
          profileLocked: true,
          profileCompleted: true
        },
      });

      if (student) {
        (session.user as any).studentId = student.id;
        (session.user as any).registerNo = student.registerNo;
        (session.user as any).profileLocked = student.profileLocked;
        (session.user as any).profileCompleted = student.profileCompleted;
      }

      return session;
    },
  },
};

const handler = NextAuth(authOptions);

export { handler as GET, handler as POST };