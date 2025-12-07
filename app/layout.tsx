import "./globals.css";
import AuthSessionProvider from "@/components/SessionProvider";

export const metadata = {
  title: "S2 Portal",
  description: "Class portal for S2",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body>
        <AuthSessionProvider>{children}</AuthSessionProvider>
      </body>
    </html>
  );
}
