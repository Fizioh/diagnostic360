import crypto from "node:crypto";
import { execSync } from "node:child_process";
import { writeFileSync, mkdirSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const __dir = dirname(fileURLToPath(import.meta.url));
const repoRoot = join(__dir, "..", "..", "..");

function ghSecretSet(name, value) {
  execSync(`gh secret set ${name} --repo Fizioh/diagnostic360`, {
    input: value,
    stdio: ["pipe", "inherit", "inherit"],
  });
}

const passphrase = crypto.randomBytes(24).toString("base64url");
const salt = crypto.randomBytes(16);
const hash = crypto.pbkdf2Sync(passphrase, salt, 100_000, 32, "sha256");
const sessionSecret = crypto.randomBytes(32).toString("base64url");

const payload = {
  createdAt: new Date().toISOString(),
  note: "Local only — gitignored. Store passphrase in your password manager then delete this file.",
  workerSecrets: {
    PASSPHRASE_SALT: salt.toString("base64url"),
    PASSPHRASE_HASH: hash.toString("base64url"),
    SESSION_SECRET: sessionSecret,
  },
  accessPassphrase: passphrase,
};

const localDir = join(repoRoot, ".provision");
mkdirSync(localDir, { recursive: true });
const localPath = join(localDir, "mission2027-auth-one-time.json");
writeFileSync(localPath, JSON.stringify(payload, null, 2), { mode: 0o600 });

console.log("Setting GitHub Actions secrets (values not printed)...");
ghSecretSet("SESSION_SECRET", sessionSecret);
ghSecretSet("PASSPHRASE_SALT", payload.workerSecrets.PASSPHRASE_SALT);
ghSecretSet("PASSPHRASE_HASH", payload.workerSecrets.PASSPHRASE_HASH);
console.log(`One-time access passphrase written to: ${localPath}`);
console.log("Add CLOUDFLARE_API_TOKEN and CLOUDFLARE_ACCOUNT_ID via GitHub repo secrets manually.");
