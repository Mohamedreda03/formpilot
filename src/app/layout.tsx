import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import QueryProvider from "@/components/providers/QueryProvider";
import { Toaster } from "sonner";
import "./globals.css";
import { AuthProvider } from "@/contexts/AuthContext";
import { ErrorBoundary } from "@/components/ErrorBoundary";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "FormPilot SaaS - AI Website Builder",
  description: "Build beautiful websites with AI-powered forms and automation",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
        suppressHydrationWarning={true}
      >
        <ErrorBoundary>
          <AuthProvider>
            <QueryProvider>
              {children}
              <Toaster />
            </QueryProvider>
          </AuthProvider>
        </ErrorBoundary>
      </body>
    </html>
  );
}
