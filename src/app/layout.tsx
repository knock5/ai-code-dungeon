import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { cn } from "@/lib/utils";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "AI Code Dungeon — Belajar Coding Lewat Petualangan RPG",
  description:
    "Platform gamifikasi belajar coding. Jelajahi dungeon, selesaikan quest coding, dan naiki level sebagai Code Hero bersama AI Mentor!",
  icons: { icon: "/favicon.ico" },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html
      lang="id"
      className={cn(
        "h-full dark antialiased",
        geistSans.variable,
        geistMono.variable
      )}
    >
      <body className="min-h-full flex flex-col bg-dungeon text-foreground font-sans">
        {children}
      </body>
    </html>
  );
}
