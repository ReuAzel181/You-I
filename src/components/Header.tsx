"use client";

import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useMemo, useRef, useState } from "react";
import { useAuth } from "@/providers/AuthProvider";
import { PageTransitionLink } from "@/components/PageTransitionLink";

const navItems = [
  { label: "Workspace", href: "/pinned-tools" },
  { label: "Solutions", href: "#" },
  { label: "Resources", href: "#" },
  { label: "Pricing", href: "/pricing" },
];

export function Header() {
  const pathname = usePathname();
  const {
    user,
    isLoading,
    signUpWithEmail,
    signInWithEmail,
    signInWithGoogle,
    authError,
    authMessage,
  } = useAuth();
  const [isAuthOpen, setIsAuthOpen] = useState(false);
  const [isAuthClosing, setIsAuthClosing] = useState(false);
  const [isCelebrateOpen, setIsCelebrateOpen] = useState(false);
  const [authMode, setAuthMode] = useState<"login" | "signup">("login");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isPasswordVisible, setIsPasswordVisible] = useState(false);
  const [visibleError, setVisibleError] = useState<string | null>(null);
  const [authStep, setAuthStep] = useState<"login" | "signup" | "verify">("login");
  const [codeDigits, setCodeDigits] = useState<string[]>(["", "", "", "", "", ""]);
  const [codeExpiresAt, setCodeExpiresAt] = useState<number | null>(null);
  const [codeRemainingSeconds, setCodeRemainingSeconds] = useState(0);
  const [captchaChecked, setCaptchaChecked] = useState(false);
  const [hasCompletedCaptcha, setHasCompletedCaptcha] = useState(false);
  const codeInputRefs = useRef<Array<HTMLInputElement | null>>([]);

  const displayName = useMemo(() => {
    if (!user) {
      return "";
    }

    const metadata = (user as { user_metadata?: Record<string, unknown> }).user_metadata ?? {};
    const metaName =
      (metadata.name as string | undefined) ||
      (metadata.full_name as string | undefined) ||
      (metadata.username as string | undefined);

    if (metaName && metaName.trim().length > 0) {
      return metaName;
    }

    return user.email ?? "Account";
  }, [user]);

  useEffect(() => {
    if (!authError) {
      const timeoutId = window.setTimeout(() => {
        setVisibleError(null);
      }, 0);

      return () => {
        window.clearTimeout(timeoutId);
      };
    }

    const showTimeoutId = window.setTimeout(() => {
      setVisibleError("No account found");
    }, 0);

    const hideTimeoutId = window.setTimeout(() => {
      setVisibleError(null);
    }, 2600);

    return () => {
      window.clearTimeout(showTimeoutId);
      window.clearTimeout(hideTimeoutId);
    };
  }, [authError]);

  useEffect(() => {
    if (!codeExpiresAt) {
      return;
    }

    const updateRemaining = () => {
      const now = Date.now();
      const remaining = Math.max(0, Math.floor((codeExpiresAt - now) / 1000));
      setCodeRemainingSeconds(remaining);
    };

    updateRemaining();

    const intervalId = window.setInterval(updateRemaining, 1000);

    return () => {
      window.clearInterval(intervalId);
    };
  }, [codeExpiresAt]);

  function openAuth(mode: "login" | "signup") {
    setAuthMode(mode);
    setAuthStep(mode);
    setCodeDigits(["", "", "", "", "", ""]);
    setCodeExpiresAt(null);
    setCodeRemainingSeconds(0);
    setCaptchaChecked(false);
    setHasCompletedCaptcha(false);
    setVisibleError(null);
    setIsAuthClosing(false);
    setIsAuthOpen(true);
  }

  function closeAuth() {
    setIsAuthClosing(true);
    setTimeout(() => {
      setIsAuthOpen(false);
      setIsAuthClosing(false);
      setEmail("");
      setPassword("");
      setIsPasswordVisible(false);
      setAuthStep("login");
      setCaptchaChecked(false);
      setHasCompletedCaptcha(false);
      setCodeDigits(["", "", "", "", "", ""]);
      setCodeExpiresAt(null);
      setCodeRemainingSeconds(0);
      setVisibleError(null);
    }, 180);
  }

  function handleCodeChange(index: number, rawValue: string) {
    const value = rawValue.replace(/\D/g, "").slice(0, 1);
    const next = [...codeDigits];

    next[index] = value;
    setCodeDigits(next);

    if (value && index < codeDigits.length - 1) {
      const nextInput = codeInputRefs.current[index + 1];

      if (nextInput) {
        nextInput.focus();
      }
    }
  }

  function handleCodeKeyDown(index: number, event: React.KeyboardEvent<HTMLInputElement>) {
    if (event.key === "Backspace" && !codeDigits[index] && index > 0) {
      event.preventDefault();
      const prevInput = codeInputRefs.current[index - 1];

      if (prevInput) {
        prevInput.focus();
      }

      return;
    }

    if (event.key === "Enter") {
      event.preventDefault();

      if (index < codeDigits.length - 1) {
        const nextInput = codeInputRefs.current[index + 1];

        if (nextInput) {
          nextInput.focus();
        }

        return;
      }

      const code = codeDigits.join("");

      if (code.length === codeDigits.length) {
        const form = event.currentTarget.form;

        if (form) {
          form.requestSubmit();
        }
      }
    }
  }

  async function handleAuthSubmit(event: React.FormEvent) {
    event.preventDefault();

    setVisibleError(null);

    if (authMode === "signup" && authStep === "verify") {
      if (codeExpiresAt && Date.now() > codeExpiresAt) {
        setVisibleError("Code has expired. Request a new one.");
        return;
      }
      const code = codeDigits.join("");

      if (code.length !== codeDigits.length) {
        return;
      }

      const response = await fetch("/api/auth/verify-code", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, code }),
      });

      if (!response.ok) {
        let message = "Incorrect code. Try again.";

        try {
          const payload = (await response.json()) as { error?: string };

          if (typeof payload.error === "string" && payload.error.trim().length > 0) {
            message = payload.error;
          }
        } catch {
        }

        setVisibleError(message);

        return;
      }

      await signUpWithEmail(email, password);

      closeAuth();
      setIsCelebrateOpen(true);

      return;
    }

    if (!email || !password) {
      return;
    }

    if (authMode === "login") {
      await signInWithEmail(email, password);

      return;
    }

    if (authMode === "signup" && authStep === "signup") {
      const response = await fetch("/api/auth/send-code", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      });

      if (!response.ok) {
        let message = "Unable to send code. Please try again soon.";

        try {
          const payload = (await response.json()) as {
            error?: string;
            retryAfterSeconds?: number;
          };

          if (payload.retryAfterSeconds && response.status === 429) {
            message = `Please wait ${payload.retryAfterSeconds} seconds before requesting another code.`;
          } else if (typeof payload.error === "string" && payload.error.trim().length > 0) {
            message = payload.error;
          }
        } catch {
        }

        setVisibleError(message);

        return;
      }

      setAuthStep("verify");
      setCodeDigits(["", "", "", "", "", ""]);
      const now = Date.now();
      const ttlMs = 3 * 60 * 1000;
      setCodeExpiresAt(now + ttlMs);
      setCodeRemainingSeconds(Math.floor(ttlMs / 1000));
      const firstInput = codeInputRefs.current[0];

      if (firstInput) {
        firstInput.focus();
      }
    }
  }

  const hasFullCode =
    codeDigits.join("").length === codeDigits.length &&
    codeDigits.every((digit) => digit.length === 1);

  const isVerifyStep = authMode === "signup" && authStep === "verify";
  const isCodeExpired = codeRemainingSeconds === 0 && Boolean(codeExpiresAt);

  return (
    <>
      <header className="sticky top-0 z-40 border-b border-zinc-200 bg-white/80 backdrop-blur">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-4 py-4 md:px-8">
          <PageTransitionLink href="/" className="flex items-center gap-2">
            <div className="flex h-8 w-8 items-center justify-center rounded-md bg-red-500 text-sm font-semibold text-white">
              UI
            </div>
            <div className="flex flex-col leading-tight">
              <span className="text-sm font-semibold tracking-tight text-zinc-900">
                YOU-I
              </span>
            </div>
          </PageTransitionLink>
          <nav className="hidden items-center gap-6 md:flex">
            {navItems.map((item) => {
              const isActive =
                item.href !== "#" && pathname && pathname.startsWith(item.href);

              if (item.href === "#") {
                return (
                  <button
                    key={item.label}
                    type="button"
                    className="relative inline-flex items-center gap-1 text-[13px] font-medium text-zinc-600"
                  >
                    {item.label}
                  </button>
                );
              }

              return (
                <PageTransitionLink
                  key={item.label}
                  href={item.href}
                  className={`relative inline-flex items-center gap-1 text-[13px] transition-colors after:absolute after:left-0 after:-bottom-1 after:h-0.5 after:w-full after:origin-left after:scale-x-0 after:rounded-full after:bg-red-500 after:transition-transform ${
                    isActive
                      ? "font-semibold text-red-600 after:scale-x-100"
                      : "font-medium text-zinc-600 hover:text-red-500 hover:after:scale-x-100"
                  }`}
                >
                  {item.label}
                </PageTransitionLink>
              );
            })}
          </nav>
          <div className="flex items-center gap-2">
            {user ? (
              <>
                <Link
                  href="/settings"
                  className="inline-flex items-center gap-2 rounded-full border border-zinc-200 bg-white px-3 py-1.5 text-xs font-medium text-zinc-700 shadow-sm transition-colors hover:border-red-200 hover:bg-red-50 hover:text-red-700"
                >
                  <span className="flex h-6 w-6 items-center justify-center rounded-full bg-red-500 text-[11px] font-semibold text-white">
                    {displayName.slice(0, 1).toUpperCase()}
                  </span>
                  <span className="hidden max-w-[120px] truncate text-left md:inline">
                    {displayName}
                  </span>
                  <span className="inline text-[11px] text-zinc-400 md:hidden">Settings</span>
                </Link>
              </>
            ) : (
              <>
                <button
                  type="button"
                  onClick={() => openAuth("login")}
                  className="hidden rounded-full border border-zinc-200 px-4 py-1.5 text-sm font-medium text-zinc-700 shadow-[0_0_0_0_rgba(0,0,0,0)] transition-colors transition-transform hover:-translate-y-0.5 hover:border-zinc-300 hover:bg-zinc-50 hover:shadow-sm active:translate-y-0 active:scale-95 md:inline-flex"
                >
                  {isLoading ? "Loading..." : "Log in"}
                </button>
                <button
                  type="button"
                  onClick={() => openAuth("signup")}
                  className="rounded-full bg-red-500 px-4 py-1.5 text-sm font-semibold text-white shadow-sm transition-colors transition-transform hover:-translate-y-0.5 hover:bg-red-600 hover:shadow-md active:translate-y-0 active:scale-95"
                >
                  Get started
                </button>
              </>
            )}
          </div>
        </div>
      </header>
      {isCelebrateOpen && (
        <div className="fixed inset-0 z-40 flex items-start justify-center bg-black/20 px-4 pt-24">
          <div className="w-full max-w-sm rounded-2xl border border-emerald-200 bg-white p-5 text-center shadow-lg">
            <p className="text-[11px] font-medium text-emerald-600">Account created</p>
            <h2 className="mt-1 text-sm font-semibold text-zinc-900">
              Welcome to YOU-I
            </h2>
            <p className="mt-2 text-[11px] text-zinc-600">
              You are now signed in. You can start using the tools or adjust your profile in
              settings.
            </p>
            <div className="mt-4 flex justify-center gap-2">
              <button
                type="button"
                onClick={() => setIsCelebrateOpen(false)}
                className="inline-flex items-center justify-center rounded-full border border-zinc-200 px-3 py-1.5 text-[11px] font-medium text-zinc-700 hover:border-zinc-300 hover:bg-zinc-50"
              >
                Close
              </button>
              <Link
                href="/settings"
                className="inline-flex items-center justify-center rounded-full bg-red-500 px-3 py-1.5 text-[11px] font-semibold text-white shadow-sm hover:bg-red-600"
              >
                Open settings
              </Link>
            </div>
          </div>
        </div>
      )}
      {(isAuthOpen || isAuthClosing) && (
        <div
          className={`fixed inset-0 z-50 flex items-center justify-center bg-black/30 px-4 ${
            isAuthClosing ? "modal-backdrop-leaving" : "modal-backdrop"
          }`}
          onClick={(event) => {
            if (event.target === event.currentTarget) {
              closeAuth();
            }
          }}
        >
          <div
            className={`w-full max-w-sm rounded-2xl border border-zinc-200 bg-white/95 p-6 shadow-lg backdrop-blur ${
              isAuthClosing ? "modal-panel-leaving" : "modal-panel"
            }`}
            onClick={(event) => {
              event.stopPropagation();
            }}
          >
            <div className="mb-4 flex items-top justify-between">
              <div className="space-y-1">
                <p className="text-[11px] font-medium text-red-600">
                  {authMode === "signup" ? "Get started" : "Welcome back"}
                </p>
                <h2 className="text-lg font-semibold text-zinc-900">
                  {authMode === "signup"
                    ? "Create your YOU-I account"
                    : "Log in to YOU-I"}
                </h2>
                <p className="text-[11px] text-zinc-500">
                  {authMode === "signup"
                    ? "Create an account to start using everything right away."
                    : "Glad to have you back. Enter your details to continue."}
                </p>
              </div>
              <button
                type="button"
                onClick={() => {
                  if (isVerifyStep) {
                    setAuthStep("signup");
                    setCodeDigits(["", "", "", "", "", ""]);
                    setCodeExpiresAt(null);
                    setCodeRemainingSeconds(0);
                    setVisibleError(null);
                  } else {
                    closeAuth();
                  }
                }}
                aria-label={isVerifyStep ? "Back to email entry" : "Close"}
                className="inline-flex h-7 w-7 items-center justify-center rounded-full border border-red-300 text-[11px] font-medium text-red-400 transition-colors hover:border-red-400 hover:bg-red-50 hover:text-red-600"
              >
                {isVerifyStep ? (
                  <Image
                    src="/icons/chevron.svg"
                    alt=""
                    width={10}
                    height={10}
                    className="h-3 w-3"
                  />
                ) : (
                  "×"
                )}
              </button>
            </div>
            <form className="space-y-4" onSubmit={handleAuthSubmit}>
              {!(authMode === "signup" && authStep === "verify") && (
                <>
                  <div className="space-y-1">
                    <label className="block text-xs font-medium text-zinc-700">
                      Email
                    </label>
                    <input
                      type="email"
                      value={email}
                      onChange={(event) => setEmail(event.target.value)}
                      placeholder="you@example.com"
                      className="w-full rounded-md border border-zinc-200 px-3 py-2 text-sm text-zinc-900 outline-none ring-red-100 placeholder:text-zinc-400 focus:border-red-400 focus:ring-2 focus:ring-offset-0"
                      required
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="block text-xs font-medium text-zinc-700">
                      Password
                    </label>
                    <div className="relative">
                      <input
                        type={isPasswordVisible ? "text" : "password"}
                        value={password}
                        onChange={(event) => setPassword(event.target.value)}
                        placeholder={
                          authMode === "signup" ? "Create a password" : "Enter your password"
                        }
                        className="w-full rounded-md border border-zinc-200 px-3 py-2 pr-9 text-sm text-zinc-900 outline-none ring-red-100 placeholder:text-zinc-400 focus:border-red-400 focus:ring-2 focus:ring-offset-0"
                        required
                      />
                      <button
                        type="button"
                        onClick={() => setIsPasswordVisible((current) => !current)}
                        className="absolute inset-y-0 right-2 flex items-center justify-center rounded-full p-1 text-zinc-400 transition-colors hover:text-zinc-700"
                        aria-label={isPasswordVisible ? "Hide password" : "Show password"}
                      >
                        <Image
                          src={isPasswordVisible ? "/icons/eye-off.svg" : "/icons/eye-on.svg"}
                          alt=""
                          width={16}
                          height={16}
                          className="h-4 w-4"
                        />
                      </button>
                    </div>
                  </div>
                  {authMode === "signup" && authStep === "signup" && !hasCompletedCaptcha && (
                    <label className="mt-1 flex items-center gap-2 rounded-md border border-zinc-200 bg-zinc-50 px-3 py-2 text-[11px] text-zinc-600">
                      <input
                        type="checkbox"
                        checked={captchaChecked}
                        onChange={(event) => {
                          const checked = event.target.checked;
                          setCaptchaChecked(checked);

                          if (checked) {
                            setHasCompletedCaptcha(true);
                          }
                        }}
                        className="h-3.5 w-3.5 rounded border-zinc-300 text-red-500 focus:ring-red-400"
                      />
                      <span>I am not a robot</span>
                    </label>
                  )}
                </>
              )}
              {authMode === "signup" && authStep === "verify" && (
                <div className="space-y-2">
                  <label className="block text-xs font-medium text-zinc-700">
                    Enter 6-digit passcode
                  </label>
                  <p className="text-[10px] text-zinc-500">
                    Sent to <span className="font-medium text-zinc-800">{email}</span>. Make sure
                    this is the email you want to use.
                  </p>
                  <div className="flex justify-center gap-1">
                    {codeDigits.map((digit, index) => (
                      <input
                        key={index}
                        ref={(element) => {
                          codeInputRefs.current[index] = element;
                        }}
                        type="text"
                        inputMode="numeric"
                        maxLength={1}
                        value={digit}
                        onChange={(event) => handleCodeChange(index, event.target.value)}
                        onKeyDown={(event) => handleCodeKeyDown(index, event)}
                        className="h-9 w-9 rounded-md border border-zinc-200 text-center text-sm text-zinc-900 outline-none ring-red-100 placeholder:text-zinc-400 focus:border-red-400 focus:ring-2 focus:ring-offset-0"
                      />
                    ))}
                  </div>
                  <p className="text-center text-[10px] text-zinc-500">
                    {isCodeExpired
                      ? "Code expired. Go back and request a new code."
                      : codeRemainingSeconds > 0
                        ? `Code expires in ${Math.floor(codeRemainingSeconds / 60)
                          .toString()
                          .padStart(1, "0")}:${(codeRemainingSeconds % 60)
                          .toString()
                          .padStart(2, "0")}`
                        : null}
                  </p>
                </div>
              )}
              {authMode === "login" && (
                <div className="flex items-center justify-between text-[11px] text-zinc-600">
                  <label className="inline-flex items-center gap-2">
                    <input
                      type="checkbox"
                      className="h-3.5 w-3.5 rounded border-zinc-300 text-red-500 focus:ring-red-400"
                    />
                    <span>Remember me</span>
                  </label>
                  <button
                    type="button"
                    className="font-medium text-zinc-500 hover:text-red-600 hover:underline"
                  >
                    Forgot password?
                  </button>
                </div>
              )}
              {visibleError && (
                <p className="rounded-md bg-red-50 px-3 py-2 text-[11px] text-red-700">
                  {visibleError}
                </p>
              )}
              {!visibleError && authMessage && (
                <p className="rounded-md bg-emerald-50 px-3 py-2 text-[11px] text-emerald-700">
                  {authMessage}
                </p>
              )}
              <div className="mt-2 flex items-center justify-between gap-3">
                <button
                  type="submit"
                  disabled={
                    isLoading ||
                    (authMode === "signup" &&
                      authStep === "verify" &&
                      (!hasFullCode || isCodeExpired))
                  }
                  className="inline-flex w-full items-center justify-center rounded-full bg-red-500 px-5 py-2.5 text-xs font-semibold text-white shadow-sm transition-colors hover:bg-red-600 disabled:opacity-60"
                >
                  {isLoading
                    ? "Please wait..."
                    : authMode === "signup"
                      ? authStep === "signup"
                        ? "Send code"
                        : "Create account"
                      : "Log in"}
                </button>
              </div>
              {authMode === "login" && (
                <p className="mt-3 text-center text-[11px] text-zinc-500">
                  Need an account?{" "}
                  <button
                    type="button"
                    className="font-medium text-red-600 hover:underline"
                    onClick={() => {
                      setAuthMode("signup");
                      setAuthStep("signup");
                      setVisibleError(null);
                    }}
                  >
                    Get started
                  </button>
                </p>
              )}
              {authMode === "signup" && (
                <div className="mt-4 space-y-3">
                  <div className="flex items-center gap-2 text-[10px] text-zinc-400">
                    <span className="h-px flex-1 bg-zinc-200" />
                    <span>or continue with</span>
                    <span className="h-px flex-1 bg-zinc-200" />
                  </div>
                  <button
                    type="button"
                    onClick={() => signInWithGoogle()}
                    disabled={isLoading}
                    className="inline-flex w-full items-center justify-center gap-2 rounded-full border border-zinc-200 bg-white px-4 py-2 text-xs font-medium text-zinc-700 shadow-sm transition-colors hover:border-zinc-300 hover:bg-zinc-50 disabled:opacity-60"
                  >
                    <span className="flex h-5 w-5 items-center justify-center rounded-full bg-white">
                      <span className="text-[12px] font-semibold text-red-500">
                        G
                      </span>
                    </span>
                    <span>{isLoading ? "Connecting..." : "Continue with Google"}</span>
                  </button>
                </div>
              )}
            </form>
          </div>
        </div>
      )}
    </>
  );
}
