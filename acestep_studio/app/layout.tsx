import type { Metadata } from "next";
import { Outfit, Inter } from "next/font/google"; // Upgrade to premium fonts
import "./globals.css";
import GlobalLayout from "@/components/GlobalLayout";

const outfit = Outfit({
  subsets: ["latin"],
  variable: "--font-heading",
  display: "swap",
});

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-sans",
  display: "swap",
});

export const metadata: Metadata = {
  title: "Opentunes Studio",
  description: "AI Music Generation Platform",
  icons: {
    icon: '/logo.png',
  },
  manifest: '/manifest.json'
};

export const viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  userScalable: false, // Prevent zooming in PWA mode
  themeColor: "#000000",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body
        className={`${outfit.variable} ${inter.variable} antialiased font-sans`}
        suppressHydrationWarning
      >
        {children}
      </body>
    </html>
  );
}
