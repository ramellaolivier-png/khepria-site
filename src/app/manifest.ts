import type { MetadataRoute } from "next";

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "kheprIA",
    short_name: "kheprIA",
    start_url: "/",
    display: "standalone",
    background_color: "#F5F1EA",
    theme_color: "#1F3D34",
  };
}
