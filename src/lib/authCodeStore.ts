import { createHash } from "crypto";

const CODE_TTL_MS = 3 * 60 * 1000;
const REQUEST_COOLDOWN_MS = 30 * 1000;
const REQUEST_WINDOW_MS = 5 * 60 * 1000;
const MAX_REQUESTS_PER_WINDOW = 5;

type RequestHistory = {
  lastRequestedAt: number;
  windowStart: number;
  windowCount: number;
};

const requestHistory = new Map<string, RequestHistory>();

function getSecret() {
  const explicitSecret = process.env.AUTH_CODE_SECRET;

  if (explicitSecret && explicitSecret.trim().length > 0) {
    return explicitSecret;
  }

  const resendKey = process.env.RESEND_API_KEY;

  if (resendKey && resendKey.trim().length > 0) {
    return resendKey;
  }

  return "zanari-default-secret";
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
  const key = email.toLowerCase();
  const previous = requestHistory.get(key);

  if (previous) {
    const sinceLast = now - previous.lastRequestedAt;

    if (sinceLast < REQUEST_COOLDOWN_MS) {
      return {
        ok: false as const,
        reason: "cooldown" as const,
        retryAfterSeconds: Math.ceil((REQUEST_COOLDOWN_MS - sinceLast) / 1000),
      };
    }

    let windowStart = previous.windowStart;
    let windowCount = previous.windowCount;

    if (now - windowStart > REQUEST_WINDOW_MS) {
      windowStart = now;
      windowCount = 0;
    }

    if (windowCount >= MAX_REQUESTS_PER_WINDOW) {
      return {
        ok: false as const,
        reason: "rate_limit" as const,
        retryAfterSeconds: Math.ceil(
          (REQUEST_WINDOW_MS - (now - windowStart)) / 1000,
        ),
      };
    }

    requestHistory.set(key, {
      lastRequestedAt: now,
      windowStart,
      windowCount: windowCount + 1,
    });
  } else {
    requestHistory.set(key, {
      lastRequestedAt: now,
      windowStart: now,
      windowCount: 1,
    });
  }

  const bucket = getBucket(now);
  const code = generateDeterministicCode(key, bucket);

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
