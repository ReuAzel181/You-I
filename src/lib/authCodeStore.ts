import { createHash } from "crypto";

const CODE_TTL_MS = 3 * 60 * 1000;

function getSecret() {
  const explicitSecret = process.env.AUTH_CODE_SECRET;

  if (explicitSecret && explicitSecret.trim().length > 0) {
    return explicitSecret;
  }

  const resendKey = process.env.RESEND_API_KEY;

  if (resendKey && resendKey.trim().length > 0) {
    return resendKey;
  }

  return "you-i-default-secret";
}

function getBucket(timestamp: number) {
  return Math.floor(timestamp / CODE_TTL_MS);
}

function generateDeterministicCode(email: string, bucket: number) {
  const key = email.toLowerCase();
  const secret = getSecret();

  const hash = createHash("sha256")
    .update(`${secret}:${key}:${bucket}`)
    .digest("hex");

  const numeric = parseInt(hash.slice(0, 8), 16) % 1_000_000;

  return String(numeric).padStart(6, "0");
}

export function requestSendCode(email: string) {
  const now = Date.now();
  const bucket = getBucket(now);
  const code = generateDeterministicCode(email, bucket);

  return {
    ok: true as const,
    code,
  };
}

export function verifyCode(email: string, code: string) {
  const now = Date.now();
  const currentBucket = getBucket(now);
  const currentCode = generateDeterministicCode(email, currentBucket);

  if (code === currentCode) {
    return {
      ok: true as const,
    };
  }

  const previousBucket = currentBucket - 1;
  const previousCode = generateDeterministicCode(email, previousBucket);

  if (code === previousCode) {
    return {
      ok: false as const,
      reason: "expired" as const,
    };
  }

  return {
    ok: false as const,
    reason: "invalid_code" as const,
    remainingAttempts: 0,
  };
}
