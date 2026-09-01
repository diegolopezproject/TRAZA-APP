import type { MetadataRoute } from "next";

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "TRAZA",
    short_name: "TRAZA",
    description: "Tu viaje, por capas.",
    start_url: "/",
    scope: "/",
    display: "standalone",
    background_color: "#f4f1ea",
    theme_color: "#161616",
    lang: "es",
    icons: [
      { src: "/icons/traza-192.png", sizes: "192x192", type: "image/png", purpose: "any" },
      { src: "/icons/traza-512.png", sizes: "512x512", type: "image/png", purpose: "any" },
      {
        src: "/icons/traza-maskable-512.png",
        sizes: "512x512",
        type: "image/png",
        purpose: "maskable",
      },
    ],
    share_target: {
      action: "/share",
      method: "POST",
      enctype: "multipart/form-data",
      params: { title: "title", text: "text", url: "url" },
    },
  };
}
