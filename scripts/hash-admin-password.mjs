import crypto from "node:crypto";

const password = process.argv[2];

if (!password) {
  console.error("Usage: node scripts/hash-admin-password.mjs <password>");
  process.exit(1);
}

const salt = crypto.randomBytes(16).toString("base64url");
const params = { n: 16384, r: 8, p: 1, keylen: 64 };
const key = crypto.scryptSync(password, salt, params.keylen, {
  N: params.n,
  r: params.r,
  p: params.p,
});

console.log(`scrypt:${params.n}:${params.r}:${params.p}:${salt}:${key.toString("base64url")}`);
