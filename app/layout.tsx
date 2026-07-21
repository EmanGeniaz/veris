import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "VerisZone - Govern with certainty.",
  description: "VerisZone enterprise AI governance operating system.",
  icons: {
    icon: "/brand/veriszone-dark-app-icon.png",
    shortcut: "/brand/veriszone-dark-app-icon.png",
    apple: "/brand/veriszone-dark-app-icon.png"
  }
};

export default function RootLayout({
  children
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="dark">
      <body>{children}</body>
    </html>
  );
}
