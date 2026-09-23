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
});
