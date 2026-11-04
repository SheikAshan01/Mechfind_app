import type { Metadata, Viewport } from 'next';
import './globals.css';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';

export const metadata: Metadata = {
  title: 'MECHFIND – Your Mechanic, Just Around the Corner | 24/7 Roadside Assistance',
  description:
    'On-demand emergency breakdown assistance and nearby mechanic discovery platform. Flat tyre, battery jumpstart, fuel delivery, towing, and engine diagnostics in 15 minutes.',
  keywords: [
    'breakdown assistance',
    'mechanic near me',
    'car repair',
    'bike puncture',
    'battery jumpstart',
    'towing service',
    'emergency roadside assistance',
  ],
  icons: {
    icon: '/favicon.png',
    apple: '/logo.png',
  },
};

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  maximumScale: 1,
  themeColor: '#1769E8',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className="min-h-screen bg-[#F8FAFC] dark:bg-[#0B111E] text-[#172338] dark:text-[#F8FAFC] flex flex-col antialiased selection:bg-blue-100 selection:text-blue-900 transition-colors">
        <Navbar />
        <main className="flex-1">{children}</main>
        <Footer />
      </body>
    </html>
  );
}

