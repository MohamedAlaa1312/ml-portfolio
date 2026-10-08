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

import { CmsService } from "@/services/cms.service";

export async function generateMetadata(): Promise<Metadata> {
  const settings = await CmsService.getSiteSettings().catch(() => null);
  const siteName = settings?.site_name || settings?.name || "Mohamed Alaa";
  const title = settings?.seo_title || `${siteName} | Machine Learning Engineer Portfolio`;
  const description =
    settings?.seo_description ||
    settings?.site_description ||
    "Machine Learning Engineer portfolio showcasing AI architectures, deep learning models, data science pipelines, and verified certifications.";

  const productionOrigin =
    process.env.NEXT_PUBLIC_SITE_URL ||
    (process.env.VERCEL_PROJECT_PRODUCTION_URL ? `https://${process.env.VERCEL_PROJECT_PRODUCTION_URL}` : null) ||
    (process.env.VERCEL_URL ? `https://${process.env.VERCEL_URL}` : null) ||
    'https://ml-portfolio-theta.vercel.app';

  const rawOg = settings?.og_image_url || settings?.og_image || '/images/og-preview.jpg';
  const ogImageUrl = rawOg.startsWith('http')
    ? rawOg
    : `${productionOrigin}${rawOg.startsWith('/') ? '' : '/'}${rawOg}`;

  return {
    metadataBase: new URL(productionOrigin),
    title,
    description,
    keywords: [
      "Machine Learning Engineer",
      "Artificial Intelligence",
      "Deep Learning",
      "Data Science",
      "Python",
      "PyTorch",
      "TensorFlow",
      siteName,
      "Mohamed Alaa",
    ],
    authors: [{ name: siteName }],
    creator: siteName,
    openGraph: {
      title,
      description,
      url: productionOrigin,
      siteName: settings?.site_name || `${siteName} Portfolio`,
      images: [
        {
          url: ogImageUrl,
          width: 1200,
          height: 630,
          alt: `${siteName} — Machine Learning Engineer Portfolio`,
          type: 'image/jpeg',
        },
      ],
      locale: "en_US",
      type: "website",
    },
    twitter: {
      card: "summary_large_image",
      title,
      description,
      images: [ogImageUrl],
      creator: "@MohamedAlaa",
    },
    robots: {
      index: settings?.allow_indexing !== false,
      follow: settings?.allow_indexing !== false,
    },
  };
}

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
