import crypto from "node:crypto";

export const SESSION_COOKIE_NAME = "leviq_session";
export const SESSION_MAX_AGE_SECONDS = 60 * 60 * 12; // 12 jam (kira-kira 1 shift)

function getSecret(): string {
  const secret = process.env.SESSION_SECRET;
  if (!secret) {
    throw new Error("SESSION_SECRET belum diset di environment variables.");
  }
  return secret;
}

function sign(payload: string): string {
  return crypto.createHmac("sha256", getSecret()).update(payload).digest("hex");
}

export function createSessionToken(issuedAt: number = Date.now()): string {
  const payload = String(issuedAt);
  return `${payload}.${sign(payload)}`;
}

export function isSessionTokenValid(token: string | undefined | null): boolean {
  if (!token) return false;

  const [payload, signature] = token.split(".");
  if (!payload || !signature) return false;

  const expected = sign(payload);
  const provided = Buffer.from(signature);
  const wanted = Buffer.from(expected);
  if (provided.length !== wanted.length || !crypto.timingSafeEqual(provided, wanted)) {
    return false;
  }

  const issuedAt = Number(payload);
  if (!Number.isFinite(issuedAt)) return false;

  return Date.now() - issuedAt <= SESSION_MAX_AGE_SECONDS * 1000;
}
