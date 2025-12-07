import NextAuth, { NextAuthOptions } from "next-auth";
import GoogleProvider from "next-auth/providers/google";

export const authOptions: NextAuthOptions = {
  providers: [
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID ?? "",
      clientSecret: process.env.GOOGLE_CLIENT_SECRET ?? "",
    }),
  ],
  callbacks: {
    async signIn({ user }) {
      const email = user.email || "";
      
      // Only allow @srmist.edu.in or the 2 admin emails
      const adminEmails = [
        "saisiddharthvooka@gmail.com",
        "kothaig2@srmist.edu.in",
      ];
      
      if (adminEmails.includes(email)) {
        return true; // Admin can log in
      }
      
      if (email.endsWith("@srmist.edu.in")) {
        return true; // SRM students can log in
      }
      
      return false; // Block others
    },
    async session({ session }) {
      const adminEmails = [
        "saisiddharthvooka@gmail.com",
        "kothaig2@srmist.edu.in",
      ];
      
      if (session.user && adminEmails.includes(session.user.email ?? "")) {
        (session.user as any).role = "ADMIN";
      } else {
        (session.user as any).role = "STUDENT";
      }
      
      return session;
    },
  },
};

const handler = NextAuth(authOptions);
export { handler as GET, handler as POST };
