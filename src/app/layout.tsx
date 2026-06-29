import type { Metadata } from 'next';
import { Geist } from 'next/font/google';
import './globals.css';
import { AuthProvider } from '@/context/AuthContext';
import Navbar from '@/components/Navbar';
import { Toaster } from 'react-hot-toast';

const geist = Geist({ variable: '--font-geist-sans', subsets: ['latin'] });

export const metadata: Metadata = {
  title: 'QuickCourt',
  description: 'Find and join sports events near you',
  icons: { icon: '/logo.png' },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={`${geist.variable} h-full antialiased`}>
      <body className="min-h-full flex flex-col bg-gray-50">
        <AuthProvider>
          <Navbar />
          <main className="flex-1">{children}</main>
          <Toaster position="top-right" />
        </AuthProvider>
      </body>
    </html>
  );
}
