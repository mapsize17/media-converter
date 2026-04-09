import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Media Converter | Free Local Video & Image Converter",
  description: "Convert videos and images instantly in your browser. 100% private, no server uploads, free to use. Supports MP4, WEBM, GIF, JPG, PNG, and WEBP.",
  keywords: "free video converter, image converter, webm to mp4, mp4 to gif, png to webp, private media converter, browser based converter",
  openGraph: {
    title: "Free Browser-Based Media Converter",
    description: "Convert videos and images instantly and privately in your browser. Zero uploads, zero cost.",
    type: "website",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <head>
        <script async src="https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=ca-pub-6382699321234354" crossOrigin="anonymous"></script>
      </head>
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        {children}
      </body>
    </html>
  );
}
