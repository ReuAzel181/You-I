"use client";

import Link from "next/link";
import Image from "next/image";
import { useEffect, useState } from "react";
import { useAuth } from "@/providers/AuthProvider";

const navItems = [
  { label: "Products", href: "#" },
  { label: "Solutions", href: "#" },
  { label: "Resources", href: "#" },
  { label: "Pricing", href: "#" },
];

export function Header() {
  const {
    user,
    isLoading,
    signUpWithEmail,
    signInWithEmail,
    signOut,
    signInWithGoogle,
    authError,
    authMessage,
  } = useAuth();
  const [isAuthOpen, setIsAuthOpen] = useState(false);
  const [isAuthClosing, setIsAuthClosing] = useState(false);
  const [authMode, setAuthMode] = useState<"login" | "signup">("login");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isPasswordVisible, setIsPasswordVisible] = useState(false);
  const [visibleError, setVisibleError] = useState<string | null>(null);

  useEffect(() => {
    if (!authError) {
      setVisibleError(null);
      return;
    }

    setVisibleError("No account found");

    const timeoutId = setTimeout(() => {
      setVisibleError(null);
    }, 2600);

    return () => {
      clearTimeout(timeoutId);
    };
  }, [authError]);

  function openAuth(mode: "login" | "signup") {
    setAuthMode(mode);
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
    }, 180);
  }

  async function handleAuthSubmit(event: React.FormEvent) {
    event.preventDefault();

    if (!email || !password) {
      return;
    }

    if (authMode === "login") {
      await signInWithEmail(email, password);
    } else {
      await signUpWithEmail(email, password);
    }
  }

  return (
    <>
      <header className="sticky top-0 z-40 border-b border-zinc-200 bg-white/80 backdrop-blur">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-4 py-4 md:px-8">
          <Link href="/" className="flex items-center gap-2">
            <div className="flex h-8 w-8 items-center justify-center rounded-md bg-red-500 text-sm font-semibold text-white">
              UI
            </div>
            <div className="flex flex-col leading-tight">
              <span className="text-sm font-semibold tracking-tight text-zinc-900">
                YOU-I
              </span>
            </div>
          </Link>
          <nav className="hidden items-center gap-6 text-sm font-medium text-zinc-600 md:flex">
            {navItems.map((item) => (
              <Link
                key={item.label}
                href={item.href}
                className="transition-colors hover:text-red-500"
              >
                {item.label}
              </Link>
            ))}
          </nav>
          <div className="flex items-center gap-3">
            {user ? (
              <>
                <span className="hidden max-w-[140px] truncate text-xs text-zinc-600 md:inline">
                  {user.email}
                </span>
                <button
                  type="button"
                  onClick={signOut}
                  className="hidden rounded-full border border-zinc-200 px-4 py-1.5 text-sm font-medium text-zinc-700 transition-colors hover:border-zinc-300 hover:bg-zinc-50 md:inline-flex"
                >
                  Log out
                </button>
              </>
            ) : (
              <button
                type="button"
                onClick={() => openAuth("login")}
                className="hidden rounded-full border border-zinc-200 px-4 py-1.5 text-sm font-medium text-zinc-700 shadow-[0_0_0_0_rgba(0,0,0,0)] transition-colors transition-transform hover:-translate-y-0.5 hover:border-zinc-300 hover:bg-zinc-50 hover:shadow-sm active:translate-y-0 active:scale-95 md:inline-flex"
              >
                {isLoading ? "Loading..." : "Log in"}
              </button>
            )}
            <button
              type="button"
              onClick={() => openAuth("signup")}
              className="rounded-full bg-red-500 px-4 py-1.5 text-sm font-semibold text-white shadow-sm transition-colors transition-transform hover:-translate-y-0.5 hover:bg-red-600 hover:shadow-md active:translate-y-0 active:scale-95"
            >
              Get started
            </button>
          </div>
        </div>
      </header>
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
                onClick={closeAuth}
                aria-label="Close"
                className="inline-flex h-7 w-7 items-center justify-center rounded-full border border-red-300 text-[11px] font-medium text-red-400 transition-colors hover:border-red-400 hover:bg-red-50 hover:text-red-600"
              >
                ×
              </button>
            </div>
            <form className="space-y-4" onSubmit={handleAuthSubmit}>
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
                    placeholder={authMode === "signup" ? "Create a password" : "Enter your password"}
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
                  disabled={isLoading}
                  className="inline-flex w-full items-center justify-center rounded-full bg-red-500 px-5 py-2.5 text-xs font-semibold text-white shadow-sm transition-colors hover:bg-red-600 disabled:opacity-60"
                >
                  {isLoading
                    ? "Please wait..."
                    : authMode === "signup"
                      ? "Create account"
                      : "Log in"}
                </button>
              </div>
              {authMode === "login" && (
                <p className="mt-3 text-center text-[11px] text-zinc-500">
                  Need an account?{" "}
                  <button
                    type="button"
                    className="font-medium text-red-600 hover:underline"
                    onClick={() => setAuthMode("signup")}
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
                    onClick={signInWithGoogle}
                    className="inline-flex w-full items-center justify-center gap-2 rounded-full border border-zinc-200 bg-white px-4 py-2 text-xs font-medium text-zinc-700 shadow-sm transition-colors hover:border-zinc-300 hover:bg-zinc-50"
                  >
                    <span className="flex h-5 w-5 items-center justify-center rounded-full bg-white">
                      <span className="text-[12px] font-semibold text-red-500">
                        G
                      </span>
                    </span>
                    <span>Continue with Google</span>
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
