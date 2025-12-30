"use client";

import Image from "next/image";
import { usePathname } from "next/navigation";
import { useEffect, useMemo, useRef, useState } from "react";
import { useAuth } from "@/providers/AuthProvider";
import { PageTransitionLink } from "@/components/PageTransitionLink";
import { getSupabaseClient } from "@/lib/supabaseClient";
import { useSettings } from "@/providers/SettingsProvider";

const navItems = [
  { label: "Home", href: "/" },
  { label: "Workspace", href: "/pinned-tools" },
  { label: "Guide", href: "/resources" },
  { label: "Pricing", href: "/pricing" },
  { label: "Contact", href: "/contact" },
  { label: "Admin", href: "/admin", requiresAdmin: true },
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
  const [isNavOpen, setIsNavOpen] = useState(false);
  const [authMode, setAuthMode] = useState<"login" | "signup">("login");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isPasswordVisible, setIsPasswordVisible] = useState(false);
  const [visibleError, setVisibleError] = useState<string | null>(null);
  const [authStep, setAuthStep] = useState<"login" | "signup" | "verify">("login");
  const [codeDigits, setCodeDigits] = useState<string[]>(["", "", "", "", "", ""]);
  const [codeExpiresAt, setCodeExpiresAt] = useState<number | null>(null);
  const [codeRemainingSeconds, setCodeRemainingSeconds] = useState(0);
  const [celebrateMode, setCelebrateMode] = useState<"signup" | "login">("signup");
  const [isGoogleConnecting, setIsGoogleConnecting] = useState(false);
  const [isCodeSending, setIsCodeSending] = useState(false);
  const [showLoginLinkInError, setShowLoginLinkInError] = useState(false);
  const codeInputRefs = useRef<Array<HTMLInputElement | null>>([]);
  const [isAdmin, setIsAdmin] = useState(false);
  const { adminUnreadInquiries } = useSettings();

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
    let isCancelled = false;

    const checkAdmin = async () => {
      if (!user) {
        if (!isCancelled) {
          setIsAdmin(false);
        }
        return;
      }

      try {
        const supabase = getSupabaseClient();
        const { data, error } = await supabase
          .from("users")
          .select("role")
          .eq("id", user.id)
          .maybeSingle();

        if (error) {
          if (!isCancelled) {
            setIsAdmin(false);
          }
          return;
        }

        if (!isCancelled) {
          setIsAdmin((data?.role as string | null) === "admin");
        }
      } catch {
        if (!isCancelled) {
          setIsAdmin(false);
        }
      }
    };

    void checkAdmin();

    return () => {
      isCancelled = true;
    };
  }, [user]);

  useEffect(() => {
    setIsNavOpen(false);
  }, [pathname]);

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
      setVisibleError(authError);
    }, 0);

    const hideTimeoutId = window.setTimeout(() => {
      setVisibleError(null);
    }, 2600);

    return () => {
      window.clearTimeout(showTimeoutId);
      window.clearTimeout(hideTimeoutId);
    };
  }, [authError]);

  function openAuth(mode: "login" | "signup") {
    setAuthMode(mode);
    setAuthStep(mode);
    setCodeDigits(["", "", "", "", "", ""]);
    setCodeExpiresAt(null);
    setCodeRemainingSeconds(0);
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
      setCodeDigits(["", "", "", "", "", ""]);
      setCodeExpiresAt(null);
      setCodeRemainingSeconds(0);
      setVisibleError(null);
    }, 180);
  }

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

  const navigationItems = navItems.filter((item) => {
    if ("requiresAdmin" in item && item.requiresAdmin) {
      if (pathname && pathname.startsWith("/admin")) {
        return true;
      }

      return isAdmin;
    }

    return true;
  });

  async function handleAuthSubmit(event: React.FormEvent) {
    event.preventDefault();

    setVisibleError(null);
     setShowLoginLinkInError(false);

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

      setCelebrateMode("signup");
      setCelebrateMode("signup");
      const didSignUp = await signUpWithEmail(email, password);

      if (didSignUp) {
        closeAuth();
        setIsCelebrateOpen(true);
      }

      return;
    }

    if (!email || !password) {
      return;
    }

    if (authMode === "login") {
      setCelebrateMode("login");
      const didLogin = await signInWithEmail(email, password);

      if (didLogin) {
        closeAuth();
        setIsCelebrateOpen(true);
      }

      return;
    }

    if (authMode === "signup" && authStep === "signup") {
      setIsCodeSending(true);
      setShowLoginLinkInError(false);

      try {
        const response = await fetch("/api/auth/send-code", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ email }),
        });

        if (!response.ok) {
          let message = "Unable to send code. Please try again soon.";
          let showLoginLink = false;

          try {
            const payload = (await response.json()) as {
              error?: string;
              retryAfterSeconds?: number;
            };

            if (payload.retryAfterSeconds && response.status === 429) {
              message = `Please wait ${payload.retryAfterSeconds} seconds before requesting another code.`;
            } else if (
              response.status === 400 &&
              typeof payload.error === "string" &&
              payload.error.toLowerCase().includes("account already exists")
            ) {
              message = "An account already exists for this email. Try";
              showLoginLink = true;
            } else if (typeof payload.error === "string" && payload.error.trim().length > 0) {
              message = payload.error;
            }
          } catch {
          }

          setVisibleError(message);
          setShowLoginLinkInError(showLoginLink);

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
      } finally {
        setIsCodeSending(false);
      }
    }
  }

  const hasFullCode =
    codeDigits.join("").length === codeDigits.length &&
    codeDigits.every((digit) => digit.length === 1);

  const isVerifyStep = authMode === "signup" && authStep === "verify";
  const isCodeExpired = codeRemainingSeconds === 0 && Boolean(codeExpiresAt);
  const hasActiveCodeForEmail =
    authMode === "signup" &&
    codeRemainingSeconds > 0 &&
    Boolean(codeExpiresAt);

  async function handleGoogleSignInClick() {
    if (isGoogleConnecting) {
      return;
    }

    setIsGoogleConnecting(true);

    try {
      await signInWithGoogle();
    } finally {
      setIsGoogleConnecting(false);
    }
  }

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
            {navigationItems.map((item) => {
              const isActive =
                item.href === "/"
                  ? pathname === "/"
                  : Boolean(pathname && pathname.startsWith(item.href));

              const showAdminUnreadDot =
                item.href === "/admin" && isAdmin && adminUnreadInquiries > 0;

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
                  <span className="relative inline-flex items-center">
                    {item.label}
                    {showAdminUnreadDot && (
                      <span className="pointer-events-none absolute -top-2 right-[-10px] inline-flex h-2 w-2 rounded-full bg-red-500 shadow-sm" />
                    )}
                  </span>
                </PageTransitionLink>
              );
            })}
          </nav>
          <div className="flex items-center gap-2">
            {user ? (
              <>
                <PageTransitionLink
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
                </PageTransitionLink>
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
            <button
              type="button"
              onClick={() => setIsNavOpen((current) => !current)}
              className={`inline-flex h-9 w-9 flex-col items-center justify-center gap-[3px] rounded-full border text-zinc-700 transition-colors md:hidden ${
                isNavOpen
                  ? "border-red-200 bg-red-50 text-red-600"
                  : "border-zinc-200 hover:border-zinc-300 hover:bg-zinc-50"
              }`}
              aria-label="Toggle navigation"
            >
              <span
                className={`block h-0.5 w-3.5 rounded-full bg-current transition-transform ${
                  isNavOpen ? "translate-y-[2px] rotate-45" : ""
                }`}
              />
              <span
                className={`block h-0.5 w-3.5 rounded-full bg-current transition-opacity ${
                  isNavOpen ? "opacity-0" : "opacity-100"
                }`}
              />
              <span
                className={`block h-0.5 w-3.5 rounded-full bg-current transition-transform ${
                  isNavOpen ? "-translate-y-[2px] -rotate-45" : ""
                }`}
              />
            </button>
          </div>
        </div>
      </header>
      <div
        className={`fixed inset-x-0 top-17 z-30 border-b border-zinc-200 bg-white/95 backdrop-blur transition-all duration-200 md:hidden ${
          isNavOpen
            ? "pointer-events-auto opacity-100 translate-y-0"
            : "pointer-events-none opacity-0 -translate-y-2"
        }`}
      >
        <div className="mx-auto max-w-6xl px-4 py-3">
          <nav className="flex flex-col gap-1.5">
            {navigationItems.map((item) => {
              const isActive =
                item.href === "/"
                  ? pathname === "/"
                  : Boolean(pathname && pathname.startsWith(item.href));

              return (
                <PageTransitionLink
                  key={item.label}
                  href={item.href}
                  className={`flex items-center justify-between rounded-full px-3 py-1.5 text-[13px] ${
                    isActive
                      ? "bg-red-50 font-semibold text-red-600"
                      : "text-zinc-700 hover:bg-zinc-50"
                  }`}
                >
                  <span>{item.label}</span>
                </PageTransitionLink>
              );
            })}
          </nav>
        </div>
      </div>
      {isCelebrateOpen && (
        <div
          className="fixed inset-0 z-40 flex items-center justify-center bg-black/40 px-4 modal-backdrop"
          onClick={(event) => {
            if (event.target === event.currentTarget) {
              setIsCelebrateOpen(false);
            }
          }}
        >
          <div
            className="relative w-full max-w-lg overflow-hidden rounded-3xl border border-emerald-200 bg-gradient-to-b from-emerald-50 via-white to-emerald-50 shadow-2xl modal-panel"
            onClick={(event) => {
              event.stopPropagation();
            }}
          >
            <div className="h-1.5 w-full bg-gradient-to-r from-emerald-400 via-emerald-500 to-emerald-400" />
            <div className="pointer-events-none absolute inset-0 z-10 overflow-hidden">
              <Image
                src="/icons/ribbon/ribbon-1.svg"
                alt=""
                width={56}
                height={56}
                className="absolute left-[6%] -top-10 h-11 w-11 opacity-60 celebrate-ribbon-fall-a"
              />
              <Image
                src="/icons/ribbon/ribbon-2.svg"
                alt=""
                width={64}
                height={64}
                className="absolute left-[26%] -top-12 h-12 w-12 opacity-55 celebrate-ribbon-fall-b"
              />
              <Image
                src="/icons/ribbon/ribbon-3.svg"
                alt=""
                width={52}
                height={52}
                className="absolute left-[44%] -top-8 h-10 w-10 opacity-55 celebrate-ribbon-fall-c"
              />
              <Image
                src="/icons/ribbon/ribbon-4.svg"
                alt=""
                width={70}
                height={70}
                className="absolute left-[68%] -top-14 h-14 w-14 opacity-60 celebrate-ribbon-fall-d"
              />
              <Image
                src="/icons/ribbon/ribbon-2.svg"
                alt=""
                width={48}
                height={48}
                className="absolute left-[14%] -top-20 h-9 w-9 opacity-50 celebrate-ribbon-fall-c"
              />
              <Image
                src="/icons/ribbon/ribbon-3.svg"
                alt=""
                width={60}
                height={60}
                className="absolute left-[58%] -top-24 h-12 w-12 opacity-50 celebrate-ribbon-fall-a"
              />
              <Image
                src="/icons/ribbon/ribbon-1.svg"
                alt=""
                width={44}
                height={44}
                className="absolute left-[82%] -top-18 h-8 w-8 opacity-55 celebrate-ribbon-fall-b"
              />
              <Image
                src="/icons/ribbon/ribbon-4.svg"
                alt=""
                width={54}
                height={54}
                className="absolute left-[36%] -top-16 h-10 w-10 opacity-50 celebrate-ribbon-fall-d"
              />
              <Image
                src="/icons/ribbon/ribbon-2.svg"
                alt=""
                width={72}
                height={72}
                className="absolute left-[10%] -top-28 h-16 w-16 opacity-50 celebrate-ribbon-fall-b"
              />
              <Image
                src="/icons/ribbon/ribbon-3.svg"
                alt=""
                width={80}
                height={80}
                className="absolute left-[52%] -top-32 h-20 w-20 opacity-45 celebrate-ribbon-fall-c"
              />
              <Image
                src="/icons/ribbon/ribbon-1.svg"
                alt=""
                width={64}
                height={64}
                className="absolute left-[84%] -top-30 h-14 w-14 opacity-55 celebrate-ribbon-fall-a"
              />
            </div>
            <div className="pointer-events-none absolute inset-0 z-0 bg-white/60 backdrop-blur-sm" />
            <div className="relative z-20 px-9 py-8 text-center">
              <div className="mx-auto mb-4 flex h-20 w-20 items-center justify-center rounded-full bg-emerald-50 shadow-sm celebrate-icon-pop">
                <Image
                  src="/icons/partypop.svg"
                  alt=""
                  width={72}
                  height={72}
                  className="h-16 w-16"
                />
              </div>
              <p className="text-[11px] font-medium text-emerald-500">
                {celebrateMode === "signup" ? "Nice work" : "Welcome back"}
              </p>
              <p className="mt-0.5 text-[11px] font-medium text-emerald-600">
                {celebrateMode === "signup" ? "Your account is ready" : "You are signed in"}
              </p>
              <h2 className="mt-1 text-base font-semibold text-zinc-900">
                {celebrateMode === "signup" ? "Welcome to YOU-I" : "Good to see you again"}
              </h2>
              <p className="mt-2 text-[11px] text-zinc-600">
                {celebrateMode === "signup"
                  ? "You are all set. Explore the tools on the main page whenever you like."
                  : "You are signed in. Jump back into your tools any time."}
              </p>
              <div className="mt-5 flex justify-center">
                <button
                  type="button"
                  onClick={() => setIsCelebrateOpen(false)}
                  className="inline-flex items-center justify-center rounded-full border border-zinc-200 px-5 py-2 text-[11px] font-medium text-zinc-700 hover:border-zinc-300 hover:bg-zinc-50"
                >
                  Continue
                </button>
              </div>
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
                    <div className="flex items-center justify-between">
                      <label className="block text-xs font-medium text-zinc-700">
                        Email
                      </label>
                      {email.endsWith("@") && (
                        <span className="text-[10px] font-medium text-emerald-500">
                          Press Tab to Complete
                        </span>
                      )}
                    </div>
                    <div className="relative">
                      <input
                        type="email"
                        value={email}
                        onChange={(event) => {
                          const next = event.target.value;
                          setEmail(next);
                        }}
                        onKeyDown={(event) => {
                          if (event.key === "Tab" && email.endsWith("@")) {
                            event.preventDefault();
                            setEmail(`${email}gmail.com`);
                          }
                        }}
                        placeholder="you@example.com"
                        className="w-full rounded-md border border-zinc-200 px-3 py-2 text-sm text-zinc-900 outline-none ring-red-100 placeholder:text-zinc-400 focus:border-red-400 focus:ring-2 focus:ring-offset-0"
                        required
                      />
                      {email.endsWith("@") && (
                        <div className="pointer-events-none absolute inset-0 flex items-center px-3 text-sm">
                          <span className="opacity-0">{email}</span>
                          <span className="text-zinc-300">gmail.com</span>
                        </div>
                      )}
                    </div>
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
                  {showLoginLinkInError && (
                    <>
                      {" "}
                      <button
                        type="button"
                        className="font-medium underline"
                        onClick={() => {
                          setAuthMode("login");
                          setAuthStep("login");
                          setVisibleError(null);
                          setShowLoginLinkInError(false);
                        }}
                      >
                        logging in
                      </button>
                      {" instead."}
                    </>
                  )}
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
                    isCodeSending ||
                    (authMode === "signup" &&
                      authStep === "signup" &&
                      hasActiveCodeForEmail) ||
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
                        ? isCodeSending
                          ? "Sending code..."
                          : hasActiveCodeForEmail
                            ? "Code already sent"
                            : "Send code"
                        : "Create account"
                      : "Log in"}
                </button>
              </div>
              {authMode === "signup" &&
                authStep === "signup" &&
                hasActiveCodeForEmail && (
                  <p className="mt-1 text-center text-[10px] text-zinc-500">
                    Already received your code?{" "}
                    <button
                      type="button"
                      className="font-medium text-red-600 hover:underline"
                      onClick={() => {
                        setAuthStep("verify");
                        setVisibleError(null);
                        setCodeDigits(["", "", "", "", "", ""]);
                      }}
                    >
                      Enter it now
                    </button>
                    .
                  </p>
                )}
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
              {authStep !== "verify" && (
                <div className="mt-4 space-y-3">
                  <div className="flex items-center gap-2 text-[10px] text-zinc-400">
                    <span className="h-px flex-1 bg-zinc-200" />
                    <span>or continue with</span>
                    <span className="h-px flex-1 bg-zinc-200" />
                  </div>
                  <button
                    type="button"
                    onClick={handleGoogleSignInClick}
                    disabled={isGoogleConnecting}
                    className="inline-flex w-full items-center justify-center gap-2 rounded-full border border-zinc-200 bg-white px-4 py-2 text-xs font-medium text-zinc-700 shadow-sm transition-colors hover:border-zinc-300 hover:bg-zinc-50 disabled:opacity-60"
                  >
                    <span className="flex h-5 w-5 items-center justify-center rounded-full bg-white">
                      {isGoogleConnecting ? (
                        <span className="h-3 w-3 animate-spin rounded-full border-[1.5px] border-zinc-300 border-t-transparent" />
                      ) : (
                        <Image
                          src="/icons/google.svg"
                          alt=""
                          width={14}
                          height={14}
                          className="h-3.5 w-3.5"
                        />
                      )}
                    </span>
                    <span>
                      {isGoogleConnecting
                        ? "Connecting to Google..."
                        : authMode === "signup"
                          ? "Continue with Google"
                          : "Sign in with Google"}
                    </span>
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
