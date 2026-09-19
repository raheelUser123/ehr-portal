import type { MetadataRoute } from "next";
export default function sitemap(): MetadataRoute.Sitemap {
  const base=(process.env.NEXT_PUBLIC_SITE_URL||"https://example.com").replace(/\/$/,"");
  return [
    {url:`${base}/login`,changeFrequency:"monthly",priority:1},
    {url:`${base}/forgot-password`,changeFrequency:"yearly",priority:.3},
  ];
}
