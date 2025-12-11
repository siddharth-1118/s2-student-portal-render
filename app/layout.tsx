import './globals.css';
import { Inter } from 'next/font/google';
import Providers from './providers'; // Assuming you have this
import NotificationReminder from '@/components/NotificationReminder'; // 👈 IMPORT THIS

const inter = Inter({ subsets: ['latin'] });

export const metadata = {
  title: 'Student Portal',
  description: 'Manage marks and timetable',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className={inter.className}>
        <Providers>
          {children}
          <NotificationReminder /> {/* 👈 ADD THIS HERE */}
        </Providers>
      </body>
    </html>
  );
}