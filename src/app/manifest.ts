import type { MetadataRoute } from "next";

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "Morrow",
    short_name: "Morrow",
    description: "JRB executive workspace.",
    start_url: "/dashboard",
    display: "standalone",
    background_color: "#0a0a0f",
    theme_color: "#17171b",
    icons: [
      {
        src: "/morrow-mark.svg",
        sizes: "any",
        type: "image/svg+xml",
        purpose: "maskable",
      },
    ],
  };
}
