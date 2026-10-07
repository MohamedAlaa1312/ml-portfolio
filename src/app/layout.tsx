import type { Metadata, Viewport } from "next";
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

export const viewport: Viewport = {
  themeColor: "#080B11",
  width: "device-width",
  initialScale: 1,
};

const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://mohamedkhaled.dev';
const validBaseUrl = siteUrl.startsWith('http') ? siteUrl : `https://${siteUrl}`;

export const metadata: Metadata = {
  metadataBase: new URL(validBaseUrl),
  title: "Mohamed Khaled | Machine Learning Engineer",
  description:
    "Production-grade Machine Learning Engineer portfolio showcasing AI architectures, deep learning models, scalable data pipelines, and verified credentials.",
  keywords: [
    "Machine Learning Engineer",
    "Artificial Intelligence",
    "Deep Learning",
    "Data Science",
    "Python",
    "PyTorch",
    "TensorFlow",
    "Mohamed Khaled",
  ],
  authors: [{ name: "Mohamed Khaled" }],
  creator: "Mohamed Khaled",
  openGraph: {
    title: "Mohamed Khaled | Machine Learning Engineer",
    description:
      "Production-grade Machine Learning Engineer portfolio showcasing AI architectures, deep learning models, scalable data pipelines, and verified credentials.",
    url: validBaseUrl,
    siteName: "Mohamed Khaled Portfolio",
    images: [
      {
        url: "/images/profile.jpg",
        width: 800,
        height: 1000,
        alt: "Mohamed Khaled — Machine Learning Engineer",
      },
    ],
    locale: "en_US",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "Mohamed Khaled | Machine Learning Engineer",
    description:
      "Machine Learning Engineer portfolio showcasing AI architectures, deep learning models, and scalable data pipelines.",
    images: ["/images/profile.jpg"],
  },
  robots: {
    index: true,
    follow: true,
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html
      lang="en"
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased scroll-smooth`}
    >
      <body className="min-h-full flex flex-col bg-[#080B11] text-slate-100">{children}</body>
    </html>
  );
}
