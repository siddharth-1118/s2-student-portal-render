import NextAuth from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import { PrismaAdapter } from "@next-auth/prisma-adapter"; // You might need to install this
import { prisma } from "@/lib/prisma";

const handler = NextAuth({
  // FIX 1: Explicitly tell NextAuth to use the secret
  secret: process.env.NEXTAUTH_SECRET,
  
  // FIX 2: Connect NextAuth to your Vercel Postgres database
  adapter: PrismaAdapter(prisma),

  session: {
    strategy: "jwt", // Use JWT to avoid database session lookup costs on Vercel
  },
  
  providers: [
    // Keep your existing Credential provider or Google provider here.
    // Since I don't see your original code, I'll add a standard Credentials placeholder.
    // REPLACE THIS with your actual providers if they are different!
    CredentialsProvider({
      name: "Credentials",
      credentials: {
        username: { label: "Username", type: "text" },
        password: { label: "Password", type: "password" }
      },
      async authorize(credentials) {
        // Simple check to allow sign in (Update logic as needed)
        if (credentials?.username) {
           return { id: "1", name: credentials.username, email: "user@example.com" }
        }
        return null;
      }
    })
  ],
});

export { handler as GET, handler as POST };