import type { Metadata, Viewport } from "next";
import "./globals.css";
import { Providers } from "./providers";
import BottomNav from "@/components/BottomNav";

export const metadata: Metadata = {
  title: "Nam Tindivanam - Rural Groceries",
  description: "Order fresh groceries from local shops in Tindivanam",
  manifest: "/manifest.json",
  appleWebApp: {
    capable: true,
    statusBarStyle: "default",
    title: "Nam Tindivanam",
  },
  formatDetection: {
    telephone: false,
  },
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
  themeColor: "#6366f1",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
      </head>
      <body className="antialiased min-h-screen">
        <Providers>
          <main className="max-w-lg mx-auto min-h-screen relative">
            {children}
          </main>
          <BottomNav />
        </Providers>
      </body>
    </html>
  );
}
