import { createHash, randomInt } from "crypto";

type CodeState = {
  codeHash: string;
  expiresAt: number;
  attempts: number;
  lastSentAt: number;
  windowStart: number;
  windowCount: number;
};

const CODE_TTL_MS = 3 * 60 * 1000;
const MIN_SECONDS_BETWEEN_SENDS = 120;
const WINDOW_MS = 60 * 60 * 1000;
const MAX_SENDS_PER_WINDOW = 5;
const MAX_VERIFY_ATTEMPTS = 5;

const stateByEmail = new Map<string, CodeState>();

function hashCode(code: string) {
  return createHash("sha256").update(code).digest("hex");
}

function generateCode() {
  const value = randomInt(100000, 1000000);
  return String(value);
}

export function requestSendCode(email: string) {
  const now = Date.now();
  const key = email.toLowerCase();
  const existing = stateByEmail.get(key);

  if (existing) {
    const secondsSinceLast = (now - existing.lastSentAt) / 1000;

    if (secondsSinceLast < MIN_SECONDS_BETWEEN_SENDS) {
      const retryAfterSeconds = Math.ceil(MIN_SECONDS_BETWEEN_SENDS - secondsSinceLast);

      return {
        ok: false as const,
        reason: "cooldown" as const,
        retryAfterSeconds,
      };
    }

    const windowElapsed = now - existing.windowStart;
    const windowStart =
      windowElapsed > WINDOW_MS ? now : existing.windowStart;
    const windowCount =
      windowElapsed > WINDOW_MS ? 0 : existing.windowCount;

    if (windowCount >= MAX_SENDS_PER_WINDOW) {
      const retryAfterSeconds = Math.ceil(
        (existing.windowStart + WINDOW_MS - now) / 1000,
      );

      return {
        ok: false as const,
        reason: "too_many_sends" as const,
        retryAfterSeconds: Math.max(retryAfterSeconds, 1),
      };
    }

    const code = generateCode();
    const codeHash = hashCode(code);

    stateByEmail.set(key, {
      codeHash,
      expiresAt: now + CODE_TTL_MS,
      attempts: 0,
      lastSentAt: now,
      windowStart,
      windowCount: windowCount + 1,
    });

    return {
      ok: true as const,
      code,
    };
  }

  const code = generateCode();
  const codeHash = hashCode(code);

  stateByEmail.set(key, {
    codeHash,
    expiresAt: now + CODE_TTL_MS,
    attempts: 0,
    lastSentAt: now,
    windowStart: now,
    windowCount: 1,
  });

  return {
    ok: true as const,
    code,
  };
}

export function verifyCode(email: string, code: string) {
  const now = Date.now();
  const key = email.toLowerCase();
  const existing = stateByEmail.get(key);

  if (!existing) {
    return {
      ok: false as const,
      reason: "not_found" as const,
    };
  }

  if (now > existing.expiresAt) {
    stateByEmail.delete(key);

    return {
      ok: false as const,
      reason: "expired" as const,
    };
  }

  if (existing.attempts >= MAX_VERIFY_ATTEMPTS) {
    return {
      ok: false as const,
      reason: "too_many_attempts" as const,
    };
  }

  const expectedHash = existing.codeHash;
  const actualHash = hashCode(code);

  const matches = expectedHash === actualHash;
  const nextAttempts = existing.attempts + 1;

  if (!matches) {
    stateByEmail.set(key, {
      ...existing,
      attempts: nextAttempts,
    });

    return {
      ok: false as const,
      reason: "invalid_code" as const,
      remainingAttempts: Math.max(MAX_VERIFY_ATTEMPTS - nextAttempts, 0),
    };
  }

  stateByEmail.delete(key);

  return {
    ok: true as const,
  };
}
