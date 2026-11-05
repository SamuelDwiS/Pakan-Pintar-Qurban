import type { MetadataRoute } from "next";

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "Pakan Pintar Qurban — Asisten Penggemukan Sapi Presisi",
    short_name: "PakanPintar",
    description:
      "Aplikasi AI & Linear Programming untuk optimasi ransum pakan lokal biaya minimum, target PBBH kurban, dan deteksi dini PMK.",
    start_url: "/",
    display: "standalone",
    background_color: "#f8fafc",
    theme_color: "#047857",
    lang: "id-ID",
    icons: [
      {
        src: "/logo.png",
        sizes: "512x512",
        type: "image/png",
      },
    ],
  };
}
