import "server-only";

import crypto from "node:crypto";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";

const SESSION_COOKIE = "enfant_prodige_admin";
const SESSION_TTL_SECONDS = 60 * 60 * 8;

type SessionPayload = {
  role: "admin";
  iat: number;
  exp: number;
};

function base64url(input: Buffer | string) {
  return Buffer.from(input).toString("base64url");
}

function getSessionSecret() {
  const secret = process.env.ADMIN_SESSION_SECRET;
  if (!secret || secret.length < 32) {
    throw new Error("ADMIN_SESSION_SECRET must be set and contain at least 32 characters.");
  }
  return secret;
}

function hasTemporaryAdminBypass() {
  return process.env.ADMIN_PASSWORD_BYPASS === "true";
}

function sign(value: string) {
  return crypto.createHmac("sha256", getSessionSecret()).update(value).digest("base64url");
}

function timingSafeEqualText(left: string, right: string) {
  const leftBuffer = Buffer.from(left);
  const rightBuffer = Buffer.from(right);
  if (leftBuffer.length !== rightBuffer.length) return false;
  return crypto.timingSafeEqual(leftBuffer, rightBuffer);
}

export function hashAdminPassword(password: string, salt = crypto.randomBytes(16).toString("base64url")) {
  const params = { n: 16384, r: 8, p: 1, keylen: 64 };
  const key = crypto.scryptSync(password, salt, params.keylen, {
    N: params.n,
    r: params.r,
    p: params.p,
  });

  return `scrypt:${params.n}:${params.r}:${params.p}:${salt}:${key.toString("base64url")}`;
}

export function verifyAdminPassword(password: string) {
  const storedHash = process.env.ADMIN_PASSWORD_HASH;
  if (!storedHash) throw new Error("ADMIN_PASSWORD_HASH is not configured.");

  const [algorithm, nText, rText, pText, salt, expectedKey] = storedHash.split(":");
  if (algorithm !== "scrypt" || !nText || !rText || !pText || !salt || !expectedKey) {
    throw new Error("ADMIN_PASSWORD_HASH must use the scrypt:N:r:p:salt:key format.");
  }

  const key = crypto.scryptSync(password, salt, Buffer.from(expectedKey, "base64url").length, {
    N: Number(nText),
    r: Number(rText),
    p: Number(pText),
  });

  return crypto.timingSafeEqual(key, Buffer.from(expectedKey, "base64url"));
}

export async function createAdminSession() {
  const now = Math.floor(Date.now() / 1000);
  const payload: SessionPayload = {
    role: "admin",
    iat: now,
    exp: now + SESSION_TTL_SECONDS,
  };
  const encodedPayload = base64url(JSON.stringify(payload));
  const token = `${encodedPayload}.${sign(encodedPayload)}`;
  const cookieStore = await cookies();

  cookieStore.set(SESSION_COOKIE, token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge: SESSION_TTL_SECONDS,
  });
}

export async function clearAdminSession() {
  const cookieStore = await cookies();
  cookieStore.delete(SESSION_COOKIE);
}

export async function isAdminAuthenticated() {
  if (hasTemporaryAdminBypass()) return true;

  const cookieStore = await cookies();
  const token = cookieStore.get(SESSION_COOKIE)?.value;
  if (!token) return false;

  const [payload, signature] = token.split(".");
  if (!payload || !signature) return false;

  const expectedSignature = sign(payload);
  if (!timingSafeEqualText(signature, expectedSignature)) return false;

  try {
    const parsed = JSON.parse(Buffer.from(payload, "base64url").toString("utf8")) as SessionPayload;
    return parsed.role === "admin" && parsed.exp > Math.floor(Date.now() / 1000);
  } catch {
    return false;
  }
}

export async function requireAdminPage() {
  if (!(await isAdminAuthenticated())) redirect("/admin/login");
}

export async function assertAdminAction() {
  if (!(await isAdminAuthenticated())) {
    throw new Error("Unauthorized admin action.");
  }
}
