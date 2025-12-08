// app/api/auth/[...nextauth]/route.ts

import NextAuth, { type NextAuthOptions } from "next-auth";
import GoogleProvider from "next-auth/providers/google";
import CredentialsProvider from "next-auth/providers/credentials";
import { prisma } from "@/lib/prisma";

const ADMIN_EMAILS = [
  "saisiddharthvooka@gmail.com",
  "kothaig2@srmist.edu.in",
];

// Valid students list - in a real app, this would be in a database
const validStudents = [
  { roll: "RA2511026010868", name: "GURRAM VINAY JASWANTH" },
  { roll: "RA2511026010869", name: "VARNIKA JAIN" },
  { roll: "RA2511026010870", name: "KONDA VEERAVENKATAGANESH" },
  { roll: "RA2511026010871", name: "Y HARSHITHA" },
  { roll: "RA2511026010872", name: "ESAKI KESAVAN V" },
  { roll: "RA2511026010874", name: "KAVI PRIYA M" },
  { roll: "RA2511026010875", name: "SAMRIDDHI SINGH" },
  { roll: "RA2511026010876", name: "SATVIK SAHU" },
  { roll: "RA2511026010877", name: "MOHAMMED UBAID UL NAFEY" },
  { roll: "RA2511026010878", name: "ADITYA SHUBHANKAR" },
  { roll: "RA2511026010879", name: "PARUL TEKADE" },
  { roll: "RA2511026010880", name: "SIDDHARTHA MAJUMDER" },
  { roll: "RA2511026010881", name: "KEVIN K SHIBU" },
  { roll: "RA2511026010882", name: "BOBBALA MANJUNATH REDDY" },
  { roll: "RA2511026010883", name: "AARYA JAIN" },
  { roll: "RA2511026010884", name: "HARSHITHA GUNTUR VENKATESWARLU" },
  { roll: "RA2511026010885", name: "L NAGA ABHIESH REDDY" },
  { roll: "RA2511026010886", name: "SHARMISTHA MOHAPATRA" },
  { roll: "RA2511026010887", name: "VENKATA SAI TEJEESH CH" },
  { roll: "RA2511026010888", name: "ARYA G A" },
  { roll: "RA2511026010889", name: "MIHIR SINHA" },
  { roll: "RA2511026010890", name: "PRANAV SINGH" },
  { roll: "RA2511026010891", name: "AMRITHA H" },
  { roll: "RA2511026010892", name: "A SAI SANZANA RREDDY" },
  { roll: "RA2511026010893", name: "ARTH PARETA" },
  { roll: "RA2511026010894", name: "ARPIT SINGH" },
  { roll: "RA2511026010895", name: "SHARON NILUPHA J" },
  { roll: "RA2511026010896", name: "ADUTIYA AGARWAL" },
  { roll: "RA2511026010897", name: "TEG SINGH GILL" },
  { roll: "RA2511026010898", name: "DHANUSH KUMAR S" },
  { roll: "RA2511026010899", name: "ADIBOINA DIGVIJAY" },
  { roll: "RA2511026010900", name: "DARSHIL JOSHI" },
  { roll: "RA2511026010901", name: "RACHIT JHA" },
  { roll: "RA2511026010902", name: "TAYDEN J" },
  { roll: "RA2511026010903", name: "MANNI HARSHINI CHOWDARY" },
  { roll: "RA2511026010904", name: "EISHIT JAIN" },
  { roll: "RA2511026010905", name: "MALIK MOHMMAD AUSAIB" },
  { roll: "RA2511026010906", name: "VOOKA SAI SIDDHARTH" },
  { roll: "RA2511026010907", name: "SHUBHANG DARSHAN" },
  { roll: "RA2511026010908", name: "SRI VAISHNAVIMEENA LA" },
  { roll: "RA2511026010909", name: "ANURAG PRASAD" },
  { roll: "RA2511026010910", name: "DONALD ABISHAI FERNANDO A" },
  { roll: "RA2511026010911", name: "HARIHARAN R" },
  { roll: "RA2511026010912", name: "PANDIPRAJIN S" },
  { roll: "RA2511026010913", name: "VISHNUVARDHAN RAMPRABU" },
  { roll: "RA2511026010914", name: "S AHAMED THALHA" },
  { roll: "RA2511026010915", name: "PARTH SINGH" },
  { roll: "RA2511026010916", name: "THIRISHA M" },
  { roll: "RA2511026010917", name: "MOHITHA SK" },
  { roll: "RA2511026010918", name: "SHAGUN" },
  { roll: "RA2511026010919", name: "AARON LOW" },
  { roll: "RA2511026010920", name: "KRISH SHARMA" },
  { roll: "RA2511026010921", name: "M SARVESH" },
  { roll: "RA2511026010922", name: "KUNSH KAKKAR" },
  { roll: "RA2511026010923", name: "PASALA GHANA CHARAN NARAYANA" },
  { roll: "RA2511026010924", name: "DIKSHA GULATI" },
  { roll: "RA2511026010925", name: "NOORUL ARFIN S" },
  { roll: "RA2511026010926", name: "ARNAV SINGH" },
  { roll: "RA2511026010927", name: "M MANUSREE" },
  { roll: "RA2511026010928", name: "SHAURYA SINGLA" },
  { roll: "RA2511026010929", name: "SUBHANKAR BISWAL" },
  { roll: "RA2511026010930", name: "DHANUNJAY DAS" },
  { roll: "RA2511026010931", name: "AANJNAY SAROHA" },
  { roll: "RA2511026010932", name: "NAGULESH R" },
  { roll: "RA2511026010933", name: "EPURI NITHIN" },
  { roll: "RA2511026010934", name: "SAYED AYESHA" },
  { roll: "RA2511026010935", name: "K ARAVIND" },
  { roll: "RA2511026010936", name: "DEVA PRIYA DARSINI PINNAMANENI" },
  { roll: "RA2511026010937", name: "KATEPALLI RAJESH" },
  { roll: "RA2511026010938", name: "GOLI THANMAYE" },
  { roll: "RA2511026010939", name: "YALLAPU VIHAS" },
  { roll: "RA2511026010940", name: "AQIB SHAFEEQUE" },
  { roll: "RA2511026010603", name: "YESHVANTHKRITHIK" },
  { roll: "SV3824", name: "Student with email sv3824@srmist.edu.in" }
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

      // For Google sign-in, automatically create/update student profile
      if (account?.provider === "google") {
        // Extract name from user object
        const name = user.name || "Unknown Student";
        
        try {
          // Create or update student record
          const student = await prisma.student.upsert({
            where: { email: email },
            update: { 
              name: name,
            },
            create: {
              email: email,
              name: name,
              registerNo: `TEMP_${Date.now()}`, // Temporary register number
            },
          });
          
          // We'll handle the redirect to complete profile on the client side
          return true;
        } catch (error) {
          console.error("Error creating student profile:", error);
          return false;
        }
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
        
        // Check if this is a temporary register number
        if (student.registerNo.startsWith("TEMP_")) {
          (session.user as any).needsProfileCompletion = true;
        }
      }

      return session;
    },

    async redirect({ url, baseUrl }) {
      // After Google Sign-In, check if the user needs to complete their profile
      // This will be handled client-side since we can't access session in redirect callback
      return url.startsWith(baseUrl) ? url : baseUrl;
    }
  },
};

const handler = NextAuth(authOptions);

export { handler as GET, handler as POST };