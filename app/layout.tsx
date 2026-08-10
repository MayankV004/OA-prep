import type { Metadata } from "next";
import { Barlow } from "next/font/google";
import "./globals.css";
import { Providers } from "@/components/Providers";
import { ThemeProvider } from "next-themes";
import { TooltipProvider } from "@/components/ui/tooltip";

const barlow = Barlow({
  variable: "--font-sans",
  subsets: ["latin"],
  weight: ["300", "400", "500", "600", "700"],
});

export const metadata: Metadata = {
  title: "PlacementDeck",
  description: "Track your placement preparation progress",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body
        className={`${barlow.variable} font-sans antialiased min-h-screen bg-background text-foreground`}
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
