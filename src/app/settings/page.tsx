"use client";

import Image from "next/image";
import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { useAuth } from "@/providers/AuthProvider";
import { useAnalytics, useSettings } from "@/providers/SettingsProvider";

export default function SettingsPage() {
  const router = useRouter();
  const { user, isLoading, signOut } = useAuth();
  const {
    appearance,
    nudgeAmount,
    emailNotifications,
    productUpdates,
    tipsAndGuides,
    analyticsEnabled,
    setAppearance,
    setNudgeAmount,
    setEmailNotifications,
    setProductUpdates,
    setTipsAndGuides,
    setAnalyticsEnabled,
  } = useSettings();
  const [nudgeInput, setNudgeInput] = useState(String(nudgeAmount || 8));
  const { analyticsEnabled: analyticsActive, trackEvent } = useAnalytics();

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

  const handleNudgeSave = () => {
    const parsed = Number.parseFloat(nudgeInput);

    if (!Number.isFinite(parsed) || parsed <= 0) {
      setNudgeInput(String(nudgeAmount || 8));
      return;
    }

    setNudgeAmount(parsed);
    setNudgeInput(String(parsed));
  };

  const showAuthNotice = !user && !isLoading;

  useEffect(() => {
    if (!analyticsActive) {
      return;
    }

    trackEvent("view_settings", { path: "/settings" });
  }, [analyticsActive, trackEvent]);

  return (
    <div className="min-h-screen font-sans bg-[var(--background)] text-[var(--foreground)]">
      <Header />
      <main>
        <section className="border-b border-zinc-200 bg-white/80">
          <div className="mx-auto flex max-w-6xl items-center justify-between px-4 py-6 md:px-8 md:py-8">
            <div className="space-y-2">
              <div className="inline-flex items-center gap-2 rounded-full border border-red-100 bg-red-50 px-3 py-1 text-[11px] font-medium text-red-600">
                <span className="h-1.5 w-1.5 rounded-full bg-red-500" />
                Settings
              </div>
              <h1 className="text-2xl font-semibold tracking-tight text-zinc-900 sm:text-3xl">
                Account preferences
              </h1>
              <p className="max-w-2xl text-sm leading-relaxed text-zinc-600">
                Adjust how your account, interface, and notifications behave across the YOU-I
                toolkit.
              </p>
            </div>
            <button
              type="button"
              onClick={() => router.push("/")}
              className="inline-flex h-8 items-center gap-1 rounded-full border border-red-300 px-3 text-[11px] font-medium text-red-400 transition-colors hover:border-red-400 hover:bg-red-50 hover:text-red-600"
            >
              <span>Back to tools</span>
            </button>
          </div>
        </section>
        <section className="py-8 md:py-10">
          <div className="mx-auto flex max-w-6xl flex-col gap-6 px-4 md:flex-row md:px-8">
            <div className="flex-1">
              <div className="rounded-2xl border border-zinc-200 bg-white p-5 shadow-sm sm:p-6">
                <div className="space-y-6 divide-y divide-zinc-100">
                  <div className="mb-0">
                    <div className="flex items-start justify-between mb-4 gap-4">
                      <div className="flex items-start gap-3">
                        <div className="flex h-10 w-10 items-center justify-center rounded-full bg-red-500 text-sm font-semibold text-white">
                          {displayName.slice(0, 1).toUpperCase()}
                        </div>
                        <div className="space-y-1">
                          <p className="text-xs font-medium text-zinc-500">Account</p>
                          <h2 className="text-sm font-semibold text-zinc-900">
                            {displayName || "Signed out"}
                          </h2>
                          <p className="text-[11px] text-zinc-500">
                            {user?.email ?? "Sign in to manage your account details."}
                          </p>
                        </div>
                      </div>
                      {user && (
                        <button
                          type="button"
                          onClick={signOut}
                          className="inline-flex items-center gap-1 rounded-full border border-red-300 px-3 py-1.5 text-[11px] font-medium text-red-600 transition-colors hover:border-red-300 hover:bg-red-50"
                        >
                          <span>Log out</span>
                        </button>
                      )}
                    </div>
                    {showAuthNotice && (
                      <div className="mt-4 rounded-lg border border-dashed border-zinc-200 bg-zinc-50 px-3 py-2 text-[11px] text-zinc-600">
                        You are currently signed out. Return to the main page to create or log into
                        an account.
                      </div>
                    )}
                  </div>
                  <div className="pt-4 mb-4">
                    <div className="mb-4 space-y-1">
                      <p className="text-xs font-medium text-zinc-500">Interface</p>
                      <h2 className="text-sm font-semibold text-zinc-900">Appearance</h2>
                      <p className="text-[11px] text-zinc-500">
                        Choose how the interface theme behaves across tools.
                      </p>
                    </div>
                    <div className="flex flex-wrap gap-2 mb-4">
                      <button
                        type="button"
                        onClick={() => setAppearance("system")}
                        className={`inline-flex items-center gap-2 rounded-full border px-3 py-1.5 text-[11px] font-medium ${
                          appearance === "system"
                            ? "border-red-500 bg-red-50 text-red-700"
                            : "border-zinc-200 bg-white text-zinc-600 hover:border-zinc-300 hover:text-zinc-800"
                        }`}
                      >
                        <span className="h-1.5 w-1.5 rounded-full bg-zinc-400" />
                        <span>System default</span>
                      </button>
                      <button
                        type="button"
                        onClick={() => setAppearance("light")}
                        className={`inline-flex items-center gap-2 rounded-full border px-3 py-1.5 text-[11px] font-medium ${
                          appearance === "light"
                            ? "border-red-500 bg-red-50 text-red-700"
                            : "border-zinc-200 bg-white text-zinc-600 hover:border-zinc-300 hover:text-zinc-800"
                        }`}
                      >
                        <span className="h-3 w-3 rounded-full bg-zinc-900" />
                        <span>Light</span>
                      </button>
                      <button
                        type="button"
                        onClick={() => setAppearance("dark")}
                        className={`inline-flex items-center gap-2 rounded-full border px-3 py-1.5 text-[11px] font-medium ${
                          appearance === "dark"
                            ? "border-red-500 bg-red-50 text-red-700"
                            : "border-zinc-200 bg-white text-zinc-600 hover:border-zinc-300 hover:text-zinc-800"
                        }`}
                      >
                        <span className="h-3 w-3 rounded-full bg-zinc-900" />
                        <span>Dark</span>
                      </button>
                    </div>
                  </div>
                  <div className="pt-4 mb-4">
                    <div className="mb-4 space-y-1">
                      <p className="text-xs font-medium text-zinc-500">Analytics</p>
                      <h2 className="text-sm font-semibold text-zinc-900">Usage and diagnostics</h2>
                      <p className="text-[11px] text-zinc-500">
                        Control whether basic, anonymous usage events are recorded while you work.
                      </p>
                    </div>
                    <div className="space-y-2 mb-4">
                      <button
                        type="button"
                        onClick={() => setAnalyticsEnabled(!analyticsEnabled)}
                        className="flex w-full items-start justify-between gap-3 rounded-lg border border-zinc-200 bg-zinc-50 px-3 py-2 text-left text-[11px] text-zinc-700 transition-colors hover:border-zinc-300 hover:bg-zinc-100"
                      >
                        <div className="min-w-0 flex-1 space-y-0.5">
                          <p className="font-medium">Allow basic usage analytics</p>
                          <p className="text-[11px] text-zinc-500">
                            When enabled, tools log simple events like which screens are opened.
                          </p>
                        </div>
                        <span
                          className={`settings-toggle-track ml-2 inline-flex h-5 w-9 shrink-0 items-center rounded-full border ${
                            analyticsEnabled
                              ? "border-red-400 bg-red-500"
                              : "border-zinc-300 bg-white"
                          }`}
                        >
                          <span
                            className={`settings-toggle-thumb h-4 w-4 rounded-full bg-white shadow transition-transform ${
                              analyticsEnabled ? "translate-x-4" : "translate-x-0"
                            }`}
                          />
                        </span>
                      </button>
                    </div>
                  </div>
                  <div className="pt-4 mb-4">
                    <div className="mb-4 space-y-1">
                      <p className="text-xs font-medium text-zinc-500">Interaction</p>
                      <h2 className="text-sm font-semibold text-zinc-900">Nudges and guidance</h2>
                      <p className="text-[11px] text-zinc-500">
                        Control how strongly values respond to Shift nudges and whether to show small
                        guidance in tools.
                      </p>
                    </div>
                    <div className="space-y-4">
                      <div className="flex items-center gap-3">
                        <div className="flex-1 space-y-1">
                          <p className="text-xs font-medium text-zinc-800">Shift nudge amount</p>
                          <p className="text-[11px] text-zinc-500">
                            How much values change when you hold Shift and press the arrows.
                          </p>
                        </div>
                        <div className="flex items-center gap-2">
                          <input
                            type="number"
                            min={1}
                            value={nudgeInput}
                            onChange={(event) => setNudgeInput(event.target.value)}
                            onBlur={handleNudgeSave}
                            onKeyDown={(event) => {
                              if (event.key === "Enter") {
                                event.preventDefault();
                                handleNudgeSave();
                                event.currentTarget.blur();
                              }
                            }}
                            className="h-9 w-24 rounded-lg border border-zinc-200 bg-white px-3 text-xs text-zinc-900 outline-none ring-red-100 placeholder:text-zinc-400 focus:border-red-400 focus:ring-2 focus:ring-offset-0"
                            aria-label="Shift nudge amount"
                          />
                          <span className="text-[11px] text-zinc-500">units</span>
                        </div>
                      </div>
                      <button
                        type="button"
                        onClick={() => setTipsAndGuides(!tipsAndGuides)}
                        className="flex w-full items-start justify-between gap-3 rounded-lg border border-zinc-200 bg-zinc-50 px-3 py-2 text-left text-[11px] text-zinc-700 transition-colors hover:border-zinc-300 hover:bg-zinc-100"
                      >
                        <div className="min-w-0 flex-1 space-y-0.5">
                          <p className="font-medium">Show tooltips and guidance</p>
                          <p className="text-[11px] text-zinc-500">
                            Display small hints and keyboard tips inside tools.
                          </p>
                        </div>
                        <span
                          className={`ml-2 inline-flex h-5 w-9 shrink-0 items-center rounded-full border ${
                            tipsAndGuides ? "border-red-400 bg-red-500" : "border-zinc-300 bg-white"
                          }`}
                        >
                          <span
                            className={`h-4 w-4 rounded-full bg-white shadow transition-transform ${
                              tipsAndGuides ? "translate-x-4" : "translate-x-0"
                            }`}
                          />
                        </span>
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            </div>
            <div className="w-full space-y-6 md:w-80">
              <div className="rounded-2xl border border-zinc-200 bg-white p-5 shadow-sm sm:p-6">
                <div className="mb-4 space-y-1">
                  <p className="text-xs font-medium text-zinc-500">Notifications</p>
                  <h2 className="text-sm font-semibold text-zinc-900">Email updates</h2>
                  <p className="text-[11px] text-zinc-500">
                    Decide which emails you would like to receive from YOU-I.
                  </p>
                </div>
                <div className="space-y-2">
                  <button
                    type="button"
                    onClick={() => setEmailNotifications(!emailNotifications)}
                    className="flex w-full items-start justify-between gap-3 rounded-lg border border-zinc-200 bg-zinc-50 px-3 py-2 text-left text-[11px] text-zinc-700 transition-colors hover:border-zinc-300 hover:bg-zinc-100"
                  >
                    <div className="min-w-0 flex-1 space-y-0.5">
                      <p className="font-medium">Product activity</p>
                      <p className="text-[11px] text-zinc-500">
                        Important updates related to your account or saved work.
                      </p>
                    </div>
                    <span
                      className={`settings-toggle-track ml-2 inline-flex h-5 w-9 shrink-0 items-center rounded-full border ${
                        emailNotifications ? "border-red-400 bg-red-500" : "border-zinc-300 bg-white"
                      }`}
                    >
                      <span
                        className={`settings-toggle-thumb h-4 w-4 rounded-full bg-white shadow transition-transform ${
                          emailNotifications ? "translate-x-4" : "translate-x-0"
                        }`}
                      />
                    </span>
                  </button>
                  <button
                    type="button"
                    onClick={() => setProductUpdates(!productUpdates)}
                    className="flex w-full items-start justify-between gap-3 rounded-lg border border-zinc-200 bg-zinc-50 px-3 py-2 text-left text-[11px] text-zinc-700 transition-colors hover:border-zinc-300 hover:bg-zinc-100"
                  >
                    <div className="min-w-0 flex-1 space-y-0.5">
                      <p className="font-medium">New tools and features</p>
                      <p className="text-[11px] text-zinc-500">
                        Occasional emails about new tools and improvements.
                      </p>
                    </div>
                    <span
                      className={`settings-toggle-track ml-2 inline-flex h-5 w-9 shrink-0 items-center rounded-full border ${
                        productUpdates ? "border-red-400 bg-red-500" : "border-zinc-300 bg-white"
                      }`}
                    >
                      <span
                        className={`settings-toggle-thumb h-4 w-4 rounded-full bg-white shadow transition-transform ${
                          productUpdates ? "translate-x-4" : "translate-x-0"
                        }`}
                      />
                    </span>
                  </button>
                </div>
              </div>
              <div className="rounded-2xl border border-zinc-200 bg-white p-5 shadow-sm sm:p-6">
                <div className="mb-4 space-y-1">
                  <p className="text-xs font-medium text-zinc-500">Privacy</p>
                  <h2 className="text-sm font-semibold text-zinc-900">Data and storage</h2>
                  <p className="text-[11px] text-zinc-500">
                    Understand how data from the YOU-I toolkit is stored on your device.
                  </p>
                </div>
                <ul className="space-y-2 text-[11px] text-zinc-600">
                  <li>Design inputs stay on this device and are not uploaded by the tools.</li>
                  <li>Settings and analytics logs are stored locally in your browser and can be cleared.</li>
                  <li>Signed-in sessions are handled by the authentication provider you use.</li>
                </ul>
              </div>
              <div className="rounded-2xl border border-dashed border-zinc-200 bg-zinc-50 p-5 sm:p-6">
                <div className="mb-3 inline-flex items-center gap-2 rounded-full border border-zinc-200 bg-white px-3 py-1 text-[11px] font-medium text-zinc-600">
                  <Image
                    src="/icon.svg"
                    alt=""
                    width={16}
                    height={16}
                    className="h-4 w-4"
                  />
                  <span>About YOU-I</span>
                </div>
                <p className="text-[11px] text-zinc-600">
                  YOU-I is a focused toolkit for interface design work. Over time, more preferences
                  for privacy, integrations, and keyboard shortcuts will appear here as the toolkit
                  grows.
                </p>
              </div>
            </div>
          </div>
        </section>
      </main>
      <Footer />
    </div>
  );
}
