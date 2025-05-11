import type {Metadata} from 'next';
import { Geist, Geist_Mono } from 'next/font/google';
import './globals.css';
import { Toaster } from "@/components/ui/toaster";

const geistSans = Geist({
  variable: '--font-geist-sans',
  subsets: ['latin'],
});

const geistMono = Geist_Mono({
  variable: '--font-geist-mono',
  subsets: ['latin'],
});

export const metadata: Metadata = {
  title: 'RoamFree – Discover the World',
  description: 'Plan, explore, and dream. Your personal travel bucket list starts here with RoamFree.',
  icons: {
    icon: '/favicon.ico',
  },
  openGraph: {
    title: 'RoamFree – Discover the World',
    description: 'Plan, explore, and dream. Your personal travel bucket list starts here with RoamFree.',
    url: 'https://roamfree-travel-app.onrender.com', // change to your real domain
    siteName: 'RoamFree',
    images: [
      {
        url: '/og-image.png', // path inside /public
        width: 1200,
        height: 630,
        alt: 'RoamFree App Preview',
      },
    ],
    locale: 'en_US',
    type: 'website',
  },
};


export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className={`${geistSans.variable} ${geistMono.variable} antialiased font-sans`}>
        {children}
        <Toaster />
      </body>
    </html>
  );
}