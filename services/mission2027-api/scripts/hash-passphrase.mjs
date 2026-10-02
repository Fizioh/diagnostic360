import crypto from "node:crypto";

const passphrase = process.argv[2];
if (!passphrase) {
  console.error("Usage: npm run hash-passphrase -- \"your-passphrase\"");
  process.exit(1);
}

const salt = crypto.randomBytes(16);
const hash = crypto.pbkdf2Sync(passphrase, salt, 100_000, 32, "sha256");
console.log("Set these Wrangler secrets (server-side only):");
console.log(`PASSPHRASE_SALT=${salt.toString("base64url")}`);
console.log(`PASSPHRASE_HASH=${hash.toString("base64url")}`);
