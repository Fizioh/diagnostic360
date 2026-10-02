import { readFileSync, readdirSync, statSync } from "node:fs";
import { join } from "node:path";

const distAssets = join(process.cwd(), "dist", "assets");
const forbidden = [
  /NOTION_TOKEN/i,
  /NOTION_API/i,
  /VITE_ACCESS/i,
  /PASSPHRASE_HASH/i,
  /SESSION_SECRET/i,
  /ghp_[a-zA-Z0-9]{20,}/,
  /github_pat_/,
  /sk-[a-zA-Z0-9]{20,}/,
];

function walk(dir) {
  for (const name of readdirSync(dir)) {
    const p = join(dir, name);
    if (statSync(p).isDirectory()) walk(p);
    else if (name.endsWith(".js")) {
      const text = readFileSync(p, "utf8");
      for (const re of forbidden) {
        if (re.test(text)) {
          console.error(`Forbidden pattern ${re} found in ${p}`);
          process.exit(1);
        }
      }
    }
  }
}

if (!statSync(join(process.cwd(), "dist")).isDirectory()) {
  console.error("dist/ missing");
  process.exit(1);
}

walk(distAssets);
console.log("Bundle secret scan passed");
