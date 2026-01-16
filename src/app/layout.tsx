import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import VantaBackground from "@/components/VantaBackground"; 

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "X-OS",
  description: "Track your consistency",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className={inter.className}>
        <VantaBackground>{children}</VantaBackground>
      </body>
    </html>
  );
}
