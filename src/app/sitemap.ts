import type { MetadataRoute } from "next";
import { SITE } from "@/lib/site";

export default function sitemap(): MetadataRoute.Sitemap {
  const routes = ["", "/services", "/a-propos", "/contact", "/mentions-legales", "/confidentialite"];
  return routes.map((r) => ({ url: `${SITE.domain}${r}`, lastModified: new Date("2026-06-15") }));
}
