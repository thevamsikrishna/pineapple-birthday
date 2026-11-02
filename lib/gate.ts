import { createHmac, timingSafeEqual } from "node:crypto";

/**
 * Password gate helpers (server only). The password never lives in the repo:
 * set BIRTHDAY_PASSWORD in .env.local (local) or in the host's environment variables (Vercel).
 */
export const UNLOCK_COOKIE = "pb_unlock";
const COOKIE_DAYS = 30;

export function configuredPassword(): string | null {
  const p = process.env.BIRTHDAY_PASSWORD;
  return p && p.length > 0 ? p : null;
}

/** Cookie value: HMAC of a fixed label keyed by the password, so changing the password locks everyone out. */
export function unlockToken(password: string): string {
  return createHmac("sha256", password)
    .update("pineapple-birthday-unlock-v1")
    .digest("hex");
}

export function passwordMatches(candidate: string, actual: string): boolean {
  const a = Buffer.from(candidate.normalize("NFKC"));
  const b = Buffer.from(actual.normalize("NFKC"));
  return a.length === b.length && timingSafeEqual(a, b);
}

export function tokenIsValid(
  token: string | undefined,
  password: string,
): boolean {
  if (!token) return false;
  const expected = unlockToken(password);
  const a = Buffer.from(token);
  const b = Buffer.from(expected);
  return a.length === b.length && timingSafeEqual(a, b);
}

export function cookieMaxAgeSeconds(): number {
  return COOKIE_DAYS * 24 * 60 * 60;
}
