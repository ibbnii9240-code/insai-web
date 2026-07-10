import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      // Google profile images
      {
        protocol: "https",
        hostname: "lh3.googleusercontent.com",
      },
      {
        protocol: "https",
        hostname: "lh4.googleusercontent.com",
      },
      {
        protocol: "https",
        hostname: "lh5.googleusercontent.com",
      },
      {
        protocol: "https",
        hostname: "lh6.googleusercontent.com",
      },

      // Cloudflare R2 public images
      {
        protocol: "https",
        hostname: "*.r2.dev",
      },
      {
        protocol: "https",
        hostname: "*.cloudflarestorage.com",
      },

      // Vercel hosted images
      {
        protocol: "https",
        hostname: "*.vercel.app",
      },

      // 임시 안전망: 앱 DB에 저장된 외부 프로필 이미지가 다른 도메인일 때도 표시
      // 나중에 실제 이미지 도메인을 확인하면 이 부분은 특정 도메인으로 줄여도 됩니다.
      {
        protocol: "https",
        hostname: "**",
      },
    ],
  },
};

export default nextConfig;