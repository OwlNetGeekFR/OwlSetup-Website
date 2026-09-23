// @ts-check
import { defineConfig } from "astro/config";

export default defineConfig({
  site: "https://owlsetup.owlnetgeek.fr",
  trailingSlash: "always",
  build: {
    format: "directory",
  },
  devToolbar: {
    enabled: false,
  },
  // Shiki injecte des styles en ligne incompatibles avec la CSP ; le site n'a
  // pas de blocs de code Markdown.
  markdown: {
    syntaxHighlight: false,
  },
  security: {
    // Astro calcule l'empreinte de chaque script et style en ligne : la
    // politique n'a plus besoin de 'unsafe-inline' pour les scripts.
    csp: {
      directives: [
        "default-src 'self'",
        "base-uri 'self'",
        "object-src 'none'",
        "form-action 'self'",
        "img-src 'self' data:",
        "font-src 'self' data:",
        "connect-src 'self'",
        "manifest-src 'self'",
        "frame-src 'none'",
        "upgrade-insecure-requests",
      ],
      scriptDirective: { resources: ["'self'"] },
      styleDirective: { resources: ["'self'"] },
    },
  },
});
