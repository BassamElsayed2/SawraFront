import type { MetadataRoute } from "next";

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "مطعم الثورة",
    short_name: "الثورة",
    description: "استمتع بأفضل تجربة طعام مع مأكولاتنا الأصيلة",
    start_url: "/ar",
    scope: "/",
    display: "standalone",
    orientation: "portrait",
    theme_color: "#DC2626",
    background_color: "#FFFFFF",
    lang: "ar",
    dir: "rtl",
    icons: [
      {
        src: "/icons/icon.svg",
        sizes: "any",
        type: "image/svg+xml",
        purpose: "any",
      },
      {
        src: "/icons/icon.svg",
        sizes: "any",
        type: "image/svg+xml",
        purpose: "maskable",
      },
    ],
  };
}
