import type { Metadata, Viewport } from "next";
import "./globals.css";
import { Providers } from "./providers";
import BottomNav from "@/components/BottomNav";

export const metadata: Metadata = {
  title: "Nam Tindivanam - Shop Owner",
  description: "Manage your shop on Nam Tindivanam",
  manifest: "/manifest.json",
  appleWebApp: {
    capable: true,
    statusBarStyle: "default",
    title: "NT Shop",
  },
  formatDetection: {
    telephone: false,
  },
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  themeColor: "#27ae60",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className="antialiased bg-gray-50 min-h-screen">
        <Providers>
          <main className="max-w-lg mx-auto min-h-screen bg-gray-50">
            {children}
          </main>
          <BottomNav />
        </Providers>
      </body>
    </html>
  );
}
