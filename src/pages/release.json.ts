// Republie le manifeste à la même adresse qu'avant la migration vers Astro.
import { manifestJson } from "../lib/release";

export const GET = () =>
  new Response(`${JSON.stringify(manifestJson)}\n`, {
    headers: { "Content-Type": "application/json; charset=utf-8" },
  });
