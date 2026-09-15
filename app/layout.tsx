import type { Metadata } from "next";
import { Plus_Jakarta_Sans, JetBrains_Mono } from "next/font/google";
import "./globals.css";
import { Providers } from "@/components/Providers";
import { ThemeProvider } from "next-themes";
import { TooltipProvider } from "@/components/ui/tooltip";

const plusJakartaSans = Plus_Jakarta_Sans({
  variable: "--font-sans",
  subsets: ["latin"],
  weight: ["400", "500", "600", "700", "800"],
  display: "swap",
});

const jetbrainsMono = JetBrains_Mono({
  variable: "--font-mono",
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
  display: "swap",
});

const siteUrl = process.env.NEXT_PUBLIC_APP_URL || 'https://bigoprep.tech';

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl),
  title: {
    default: 'BigO - Master DSA Patterns & Technical Online Assessments',
    template: '%s | BigO',
  },
  description:
    'Master algorithms, DSA patterns, and core Computer Science subjects for top tech interviews. Zero-distraction roadmaps, timed OA simulations, and spaced-repetition flashcards.',
  applicationName: 'BigO',
  authors: [{ name: 'BigO Team' }],
  creator: 'BigO',
  publisher: 'BigO',
  keywords: [
    'DSA Patterns',
    'Online Assessment Prep',
    'Coding Interview Preparation',
    'Data Structures and Algorithms',
    'Computer Science Core Subjects',
    'Operating Systems',
    'DBMS',
    'Computer Networks',
    'System Design',
    'Competitive Programming',
    'Mock OA Tests',
  ],
  alternates: {
    canonical: '/',
  },
  openGraph: {
    type: 'website',
    locale: 'en_US',
    url: siteUrl,
    siteName: 'BigO',
    title: 'BigO - Master DSA Patterns & Technical Online Assessments',
    description:
      'Master algorithms, DSA patterns, and core Computer Science subjects for top tech interviews. Zero-distraction roadmaps, timed OA simulations, and spaced-repetition flashcards.',
    images: [
      {
        url: '/icon.png',
        width: 512,
        height: 512,
        alt: 'BigO - Master DSA Patterns & Core CS',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'BigO - Master DSA Patterns & Technical Online Assessments',
    description:
      'Master algorithms, DSA patterns, and core Computer Science subjects for top tech interviews.',
    images: ['/icon.png'],
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      'max-video-preview': -1,
      'max-image-preview': 'large',
      'max-snippet': -1,
    },
  },
  icons: {
    icon: [
      { url: '/favicon.ico' },
      { url: '/icon.png', type: 'image/png' },
      { url: '/icon.svg', type: 'image/svg+xml' },
    ],
    shortcut: '/favicon.ico',
    apple: '/icon.png',
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body
        className={`${plusJakartaSans.variable} ${jetbrainsMono.variable} font-sans antialiased min-h-screen bg-background text-foreground`}
      >
        <ThemeProvider attribute="class" defaultTheme="system" enableSystem disableTransitionOnChange>
          <TooltipProvider>
            <Providers>
              {children}
            </Providers>
          </TooltipProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
