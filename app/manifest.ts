import type { MetadataRoute } from "next";

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "insai",
    short_name: "insai",
    description:
      "글로벌 커뮤니티를 기반으로 새로운 관계를 만드는 플랫폼, insai",
    start_url: "/",
    display: "standalone",
    background_color: "#ffffff",
    theme_color: "#6757d9",
    icons: [
      {
        src: "/insai-logo.png",
        sizes: "1024x1024",
        type: "image/png",
      },
    ],
  };
}
