/* ── Centralized secret store (WS2 · #167 sub-task 2) ────────────────────
   The one module that seals and opens connector credentials (e.g. a tenant's
   Veris Enforce gateway token). A credential is NEVER stored raw in an ordinary
   application table and NEVER returned from an API: callers persist only the
   sealed string this module produces (an encrypted reference), and open it
   server-side, at point of use, through `openSecret`.

   Backing: AES-256-GCM with a master key from `VZ_SECRETS_KEY` (base64, 32
   bytes), held in the environment / secret store and never committed. This is
   the seam — the same interface can later front a managed secret manager (KMS,
   Vault) without changing any caller. When no key is configured the store is
   OFF: sealing refuses (returns null) so nothing is ever written in the clear,
   and opening returns null so a surface degrades honestly rather than guessing.

   Node runtime only (uses node:crypto). */
import { createCipheriv, createDecipheriv, createHash, randomBytes, timingSafeEqual } from "node:crypto";

const SCHEME = "v1"; // sealed envelope version: v1:<iv>:<tag>:<ciphertext>, each base64

/* The 32-byte master key, or null when unconfigured/invalid. No literal
   fallback — an unset key means the store is off, never a shipped default. */
function masterKey(): Buffer | null {
  const b64 = process.env.VZ_SECRETS_KEY;
  if (!b64) return null;
  try {
    const key = Buffer.from(b64, "base64");
    return key.length === 32 ? key : null;
  } catch {
    return null;
  }
}

/* True when a valid master key is configured (the store can seal/open). */
export function secretsConfigured(): boolean {
  return masterKey() !== null;
}

/* Seal a plaintext credential into an opaque, authenticated envelope safe to
   persist as an encrypted reference. Returns null when the store is off or the
   input is empty — the caller must then refuse to persist a credential. */
export function sealSecret(plaintext: string): string | null {
  const key = masterKey();
  if (!key || !plaintext) return null;
  const iv = randomBytes(12);
  const cipher = createCipheriv("aes-256-gcm", key, iv);
  const ct = Buffer.concat([cipher.update(plaintext, "utf8"), cipher.final()]);
  const tag = cipher.getAuthTag();
  return `${SCHEME}:${iv.toString("base64")}:${tag.toString("base64")}:${ct.toString("base64")}`;
}

/* Open a sealed envelope back to plaintext for use at the egress boundary.
   Returns null on any failure (wrong/absent key, tamper, malformed) — callers
   treat null as "credential unavailable" and degrade, never throw to the user. */
export function openSecret(sealed: string | null | undefined): string | null {
  const key = masterKey();
  if (!key || !sealed) return null;
  const parts = sealed.split(":");
  if (parts.length !== 4 || parts[0] !== SCHEME) return null;
  try {
    const iv = Buffer.from(parts[1], "base64");
    const tag = Buffer.from(parts[2], "base64");
    const ct = Buffer.from(parts[3], "base64");
    if (iv.length !== 12 || tag.length !== 16) return null;
    const decipher = createDecipheriv("aes-256-gcm", key, iv);
    decipher.setAuthTag(tag);
    const pt = Buffer.concat([decipher.update(ct), decipher.final()]);
    return pt.toString("utf8");
  } catch {
    return null;
  }
}

/* A non-secret, stable fingerprint of a credential — a short hash prefix, NOT
   any part of the value. Lets an operator confirm which credential is set
   (and detect a change) without the plaintext ever being revealed. Keyed by the
   master key so a fingerprint cannot be matched against a value across tenants
   without it. */
export function secretFingerprint(plaintext: string): string {
  const key = masterKey();
  const salt = key ? key.toString("base64") : "";
  return createHash("sha256").update(salt + "|" + plaintext).digest("hex").slice(0, 12);
}

/* Constant-time compare of two sealed-or-plain strings of equal length. */
export function secretsEqual(a: string, b: string): boolean {
  const ab = Buffer.from(a), bb = Buffer.from(b);
  if (ab.length !== bb.length) return false;
  return timingSafeEqual(ab, bb);
}
