import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";

import ClientAuthProvider from "@/components/AuthProvider";

const SITE_URL = "https://insai-web-ii3h.vercel.app";
const SITE_NAME = "insai";
const SITE_DESCRIPTION =
  "insai는 전 세계 사람들과 소통하고, 관심사와 가치관을 공유하며 자연스럽게 관계를 만들어가는 글로벌 커뮤니티 플랫폼입니다.";

const siteStructuredData = {
  "@context": "https://schema.org",
  "@graph": [
    {
      "@type": "WebSite",
      "@id": `${SITE_URL}/#website`,
      url: `${SITE_URL}/`,
      name: SITE_NAME,
      alternateName: ["인사이", "insai app"],
      description: SITE_DESCRIPTION,
      inLanguage: "ko-KR",
    },
    {
      "@type": "Organization",
      "@id": `${SITE_URL}/#organization`,
      name: SITE_NAME,
      alternateName: "인사이",
      url: `${SITE_URL}/`,
      logo: {
        "@type": "ImageObject",
        url: `${SITE_URL}/insai-logo.png`,
        width: 1024,
        height: 1024,
      },
    },
  ],
};

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: {
    default: "insai | 글로벌 커뮤니티 플랫폼",
    template: "%s | insai",
  },
  description: SITE_DESCRIPTION,
  keywords: [
    "insai",
    "인사이",
    "글로벌 커뮤니티",
    "친구 만들기",
    "소셜 앱",
    "커뮤니티 앱",
    "global community",
    "social app",
  ],
  applicationName: "insai",
  authors: [{ name: "insai" }],
  creator: "insai",
  publisher: "insai",
  icons: {
    icon: [
      {
        url: "/insai-logo.png",
        type: "image/png",
        sizes: "1024x1024",
      },
    ],
    shortcut: "/insai-logo.png",
    apple: [
      {
        url: "/insai-logo.png",
        type: "image/png",
        sizes: "1024x1024",
      },
    ],
  },
  manifest: "/manifest.webmanifest",
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
    },
  },
  openGraph: {
    title: "insai | 글로벌 커뮤니티 플랫폼",
    description:
      "전 세계 사람들과 소통하고, 관심사와 가치관을 공유하며 자연스럽게 관계를 만들어가는 글로벌 커뮤니티 플랫폼입니다.",
    url: SITE_URL,
    siteName: "insai",
    locale: "ko_KR",
    type: "website",
  },
  twitter: {
    card: "summary",
    title: "insai | 글로벌 커뮤니티 플랫폼",
    description:
      "전 세계 사람들과 소통하고, 관심사와 가치관을 공유하며 자연스럽게 관계를 만들어가는 글로벌 커뮤니티 플랫폼입니다.",
  },
  verification: {
    google: "EgQWsOhapRd63iLXbWcKg6AQcdDFJmQf0iwaYaJETc8",
    other: {
      "naver-site-verification": "ca122d86428a7a6e9221a37c2fee73252c3c43f9",
    },
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="ko"
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
    >
      <head>
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify(siteStructuredData).replace(/</g, "\\u003c"),
          }}
        />
      </head>
      <body className="min-h-full flex flex-col">
        <ClientAuthProvider>
          {children}
        </ClientAuthProvider>
      </body>
    </html>
  );
}
