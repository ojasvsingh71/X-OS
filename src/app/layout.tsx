import type { Metadata, Viewport } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import VantaBackground from "@/components/VantaBackground"; 
import PWARegistration from "@/components/PWARegistration";

const inter = Inter({ subsets: ["latin"] });

export const viewport: Viewport = {
  themeColor: "#000000",
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
};

export const metadata: Metadata = {
  title: "X-OS",
  description: "Track your consistency",
  appleWebApp: {
    capable: true,
    title: "X-OS",
    statusBarStyle: "black-translucent",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className={inter.className}>
        <PWARegistration />
        <VantaBackground>{children}</VantaBackground>
      </body>
    </html>
  );
}
