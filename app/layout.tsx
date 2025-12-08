import "./globals.css";
import type { Metadata } from "next";
import Providers from "./providers";

export const metadata: Metadata = {
  title: "SRM Student Portal",
  description: "Student marks, timetable, and analytics",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <head>
        <link rel="manifest" href="/manifest.webmanifest" />
        <meta name="theme-color" content="#0f172a" />
      </head>
      <body className="bg-slate-50">
        {/* ✅ Now all pages (including Home) are wrapped in SessionProvider */}
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
