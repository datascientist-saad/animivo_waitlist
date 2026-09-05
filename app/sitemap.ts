import type { MetadataRoute } from "next";

export default function sitemap(): MetadataRoute.Sitemap {
  const site = process.env.NEXT_PUBLIC_SITE_URL?.replace(/\/$/, "");
  if (!site) {
    return [];
  }

  return [
    { url: site, lastModified: new Date(), changeFrequency: "weekly", priority: 1 },
    { url: `${site}/privacy`, lastModified: new Date(), changeFrequency: "yearly", priority: 0.3 },
    { url: `${site}/terms`, lastModified: new Date(), changeFrequency: "yearly", priority: 0.3 },
  ];
}
