// lib/auth.ts

import NextAuth, { NextAuthOptions } from "next-auth";
import GoogleProvider from "next-auth/providers/google";
import CredentialsProvider from "next-auth/providers/credentials";
import { prisma } from "@/lib/prisma";

const ADMIN_EMAILS = [
  "saisiddharthvooka@gmail.com",
  "kothaig2@srmist.edu.in",
];

// ✅ Named export that other files can import
export const authOptions: NextAuthOptions = {
  secret: process.env.NEXTAUTH_SECRET,
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

        // In a real application, you would validate the credentials against your database
        // For now, we'll just check if the user exists in the Student table
        const student = await prisma.student.findUnique({
          where: { email: credentials.email }
        });

        // For demo purposes, we're not actually checking the password
        // In a real app, you would hash and compare passwords
        if (student) {
          return {
            id: student.id.toString(),
            name: student.name || credentials.email,
            email: student.email,
          };
        }

        return null;
      }
    })
  ],
  callbacks: {
    // Decide who is allowed to sign in
    async signIn({ user, account }) {
      const email = user.email;
      if (!email) return false;

      // 1️⃣ Admins can always log in
      if (ADMIN_EMAILS.includes(email)) return true;

      // 2️⃣ For Google logins, you can choose to restrict domain:
      //    - Keep this line if students MUST use @srmist.edu.in
      //    - Remove this block if students use normal Gmail / others
      if (account?.provider === "google" && !email.endsWith("@srmist.edu.in")) {
        return false;
      }

      // 3️⃣ Automatically create or update Student row on Google sign-in
      const name = user.name || "Unknown Student";

      try {
        await prisma.student.upsert({
          where: { email },
          update: { name },
          create: {
            email,
            name,
            // temporary register number, you can update later via UI or DB
            registerNo: `TEMP_${Date.now()}`,
          },
        });

        return true;
      } catch (err) {
        console.error("Error upserting student on signIn:", err);
        return false;
      }
    },

    // Attach student info to the session so /marks/me can use it
    async session({ session }) {
      if (!session.user?.email) return session;

      const student = await prisma.student.findFirst({
        where: { email: session.user.email },
        select: {
          id: true,
          registerNo: true,
          name: true,
        },
      });

      if (student) {
        (session.user as any).studentId = student.id;
        (session.user as any).registerNo = student.registerNo;
      }

      return session;
    },
  },
  session: {
    strategy: "jwt",
  },
};


