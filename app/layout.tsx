import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "GenVeris - Govern AI with certainty.",
  description: "GenVeris enterprise AI governance operating system.",
  icons: {
    icon: [
      { url: "/favicon.ico", sizes: "any" },
      { url: "/brand/genveris-favicon-16.png", type: "image/png", sizes: "16x16" },
      { url: "/brand/genveris-favicon-32.png", type: "image/png", sizes: "32x32" },
      { url: "/brand/genveris-favicon-48.png", type: "image/png", sizes: "48x48" },
      { url: "/brand/genveris-icon-192.png", type: "image/png", sizes: "192x192" },
      { url: "/brand/genveris-icon-512.png", type: "image/png", sizes: "512x512" }
    ],
    shortcut: "/favicon.ico",
    apple: "/brand/genveris-apple-touch-180.png"
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
