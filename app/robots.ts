import type { MetadataRoute } from "next";
export default function robots(): MetadataRoute.Robots {
  const base=(process.env.NEXT_PUBLIC_SITE_URL||"https://example.com").replace(/\/$/,"");
  return {
    rules:[{userAgent:"*",allow:["/login","/forgot-password"],disallow:["/dashboard","/residents","/appointments","/resident-chart","/resident-vitals","/resident-tracking","/re-assessment","/medications","/therapy-progress-notes","/mileage-log","/employee","/admin","/settings","/notifications","/form-builder","/api/"]}],
    sitemap:`${base}/sitemap.xml`,
  };
}
