// app/api/auth/[...nextauth]/route.ts

import NextAuth, { type NextAuthOptions } from "next-auth";
import GoogleProvider from "next-auth/providers/google";

// ✅ This is what other files are importing
export const authOptions: NextAuthOptions = {
  providers: [
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID!,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
    }),
  ],
  session: {
    strategy: "jwt",
  },
  // callbacks, pages etc can go here
  // callbacks: { ... },
  // pages: { signIn: "/auth/signin" },
};

// ✅ Create the handler from authOptions
const handler = NextAuth(authOptions);

// ✅ Export GET and POST for the App Router
export { handler as GET, handler as POST };
