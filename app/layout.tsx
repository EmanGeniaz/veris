import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "GenVeris - Govern AI with certainty.",
  description: "GenVeris enterprise AI governance operating system.",
  icons: {
    icon: "/brand/genveris-dark-app-icon.png",
    shortcut: "/brand/genveris-dark-app-icon.png",
    apple: "/brand/genveris-dark-app-icon.png"
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
