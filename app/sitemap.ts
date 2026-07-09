import type { MetadataRoute } from "next";

const siteUrl = "https://insai-web-ii3h.vercel.app";

export default function sitemap(): MetadataRoute.Sitemap {
  const routes = [
    "",
    "/support",
    "/contact",
    "/terms",
    "/privacy",
    "/safety",
    "/child-safety",
    "/account-deletion",
    "/login",
  ];

  return routes.map((route) => ({
    url: `${siteUrl}${route}`,
    lastModified: new Date(),
    changeFrequency: route === "" ? "daily" : "weekly",
    priority: route === "" ? 1 : 0.7,
  }));
}
