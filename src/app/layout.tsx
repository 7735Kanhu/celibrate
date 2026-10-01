import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import Header from "@/components/layout/Header";
import AppChrome from "@/components/layout/AppChrome";

const inter = Inter({ subsets: ["latin"], variable: "--font-inter" });

export const metadata: Metadata = {
  title: "Celibrate - Find the Perfect Place for Every Celebration",
  description: "Discover beautiful venues for weddings, birthdays, parties, corporate events and every special moment.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className={`${inter.variable} font-sans min-h-screen flex flex-col bg-lightBg text-gray-900`}>
        <AppChrome header={<Header />}>
          {children}
        </AppChrome>
      </body>
    </html>
  );
}
