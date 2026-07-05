import type { Metadata } from "next";
import { Geist, Geist_Mono, Inter } from "next/font/google";
import "./globals.css";
import { cn } from "@/lib/utils";

const inter = Inter({ subsets: ["latin"], variable: "--font-sans" });

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "HireHeaven — Find Your Dream Job",
  description: "Connect with top employers and discover opportunities that match your skills.",
};

import { TooltipProvider } from "@/components/ui/tooltip";
import Navbar from "@/components/navbar";
import { ReduxProvider } from "@/providers/ReduxProvider";
import { ThemeProvider, ThemeAwareToast } from "@/components/theme-provider";

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={cn(
        "h-full antialiased",
        geistSans.variable,
        geistMono.variable,
        "font-sans",
        inter.variable
      )}
      suppressHydrationWarning
    >
      {/* Blocking script: apply theme class before first paint to avoid FOUC */}
      <head>
        <script
          dangerouslySetInnerHTML={{
            __html: `(function(){try{var t=localStorage.getItem('theme')||'system';var d=window.matchMedia('(prefers-color-scheme: dark)').matches;document.documentElement.classList.add(t==='system'?(d?'dark':'light'):t);}catch(e){}})();`,
          }}
        />
      </head>
      <body className="min-h-full bg-background text-foreground transition-colors duration-200">
        <ReduxProvider>
          <ThemeProvider>
            <TooltipProvider>
              <Navbar />
              <main className="max-w-7xl mx-auto">{children}</main>
              <ThemeAwareToast />
            </TooltipProvider>
          </ThemeProvider>
        </ReduxProvider>
      </body>
    </html>
  );
}
