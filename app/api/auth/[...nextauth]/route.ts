import NextAuth from "next-auth"
import CredentialsProvider from "next-auth/providers/credentials"
import { prisma } from "@/lib/prisma"

const handler = NextAuth({
  secret: process.env.NEXTAUTH_SECRET,
  session: { strategy: "jwt" },

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
          // FIX: Convert ID to string and cast to 'any' to stop TypeScript errors
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
})

export { handler as GET, handler as POST }