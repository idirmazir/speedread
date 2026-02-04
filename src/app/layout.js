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

export const metadata = {
  title: "SpeedRead — Speed Reading for Students",
  description: "Read 2-3x faster with RSVP technology. Upload PDFs, DOCX files, or paste any text. Built for law, medicine, and university students.",
  keywords: ["speed reading", "RSVP", "study tool", "PDF reader", "university", "law student", "medical student"],
  authors: [{ name: "SpeedRead" }],
  openGraph: {
    title: "SpeedRead — Speed Reading for Students",
    description: "Read 2-3x faster with RSVP technology. Upload PDFs, DOCX files, or paste any text.",
    siteName: "SpeedRead",
    type: "website",
    locale: "en_AU",
  },
  twitter: {
    card: "summary_large_image",
    title: "SpeedRead — Speed Reading for Students",
    description: "Read 2-3x faster with RSVP technology. Upload PDFs, DOCX files, or paste any text.",
  },
  icons: {
    icon: "/favicon.ico",
  },
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        {children}
      </body>
    </html>
  );
}