import { copyFileSync, existsSync } from "node:fs";
import { join } from "node:path";

const distIndex = join(process.cwd(), "dist", "index.html");
const dist404 = join(process.cwd(), "dist", "404.html");

if (!existsSync(distIndex)) {
  console.error("dist/index.html missing — run vite build first");
  process.exit(1);
}

copyFileSync(distIndex, dist404);
console.log("Copied dist/index.html → dist/404.html for GitHub Pages SPA routing");
