import type { MetadataRoute } from "next";

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "lst — Meu App de Tudo",
    short_name: "lst",
    description: "Life OS pessoal: tarefas, treino, dieta, livros e mais.",
    start_url: "/",
    display: "standalone",
    background_color: "#E9E9E9",
    theme_color: "#0A0A0A",
    orientation: "portrait",
    icons: [
      { src: "/icon.svg", sizes: "any", type: "image/svg+xml", purpose: "any" },
    ],
  };
}
