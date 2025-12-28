"use client";

import Image from "next/image";
import Link from "next/link";
import { useEffect, useState } from "react";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { useAuth } from "@/providers/AuthProvider";
import { useAnalytics, useSettings } from "@/providers/SettingsProvider";

export default function BillingPage() {
  const { user, isLoading } = useAuth();
  const { analyticsEnabled, trackEvent } = useAnalytics();
  const { subscriptionMode, profileCountry } = useSettings();
  const [paymentMethod, setPaymentMethod] = useState<"card" | "paypal" | "bank">("card");
  const [hasHydrated, setHasHydrated] = useState(false);

  useEffect(() => {
    if (!analyticsEnabled) {
      return;
    }

    trackEvent("view_billing", { path: "/billing" });
  }, [analyticsEnabled, trackEvent]);

  useEffect(() => {
    const id = window.setTimeout(() => {
      setHasHydrated(true);
    }, 0);

    return () => {
      window.clearTimeout(id);
    };
  }, []);

  const planLabel = (() => {
    if (subscriptionMode === "free") {
      return "Free";
    }

    if (subscriptionMode === "starter") {
      return "Starter";
    }

    return "Top tier";
  })();

  const countryLabel = profileCountry || "Unknown";
  const showAuthNotice = !user && !isLoading;

  return (
    <div className="min-h-screen font-sans bg-[var(--background)] text-[var(--foreground)]">
      <Header />
      <main>
        <section className="border-b border-zinc-200 bg-white/80">
          <div className="mx-auto max-w-6xl px-4 py-8 md:px-8 md:py-10">
            <div className="flex flex-col gap-6 md:flex-row md:items-start md:justify-between">
              <div className="space-y-3">
                <div className="inline-flex items-center gap-2 rounded-full border border-red-100 bg-red-50 px-3 py-1 text-[11px] font-medium text-red-600">
                  <span className="h-1.5 w-1.5 rounded-full bg-red-500" />
                  Billing
                </div>
                <h1 className="text-balance text-2xl font-semibold tracking-tight text-zinc-900 sm:text-3xl lg:text-4xl">
                  Manage your plan and billing details
                </h1>
                <p className="max-w-2xl text-sm leading-relaxed text-zinc-600 sm:text-base">
                  Review your current plan, update payment methods, and see how you have been using
                  YOU-I.
                </p>
              </div>
              <div className="flex flex-col items-end gap-3">
                <Link
                  href="/pricing"
                  className="inline-flex h-7 items-center gap-1 self-start rounded-full border border-red-300 px-3 text-[11px] font-medium text-red-400 transition-colors hover:border-red-400 hover:bg-red-50 hover:text-red-600"
                  aria-label="Back to pricing"
                >
                  <Image
                    src="/icons/chevron.svg"
                    alt=""
                    width={10}
                    height={10}
                    className="h-3 w-3"
                  />
                  <span>Back to pricing</span>
                </Link>
                {hasHydrated && (
                  <div className="rounded-full border border-zinc-200 bg-white px-3 py-1 text-[11px] text-zinc-600">
                    <span className="font-medium">{planLabel}</span>
                    <span className="mx-1 text-zinc-400">·</span>
                    <span className="text-zinc-500">
                      {user?.email ?? "Signed out"} · {countryLabel || "Unknown"}
                    </span>
                  </div>
                )}
              </div>
            </div>
          </div>
        </section>
        <section className="bg-[var(--background)]">
          <div className="mx-auto max-w-6xl px-4 pb-12 md:px-8 md:pt-4">
            <div className="grid gap-4 md:grid-cols-[minmax(0,1.4fr)_minmax(0,1.1fr)]">
              <div className="space-y-4">
                <div className="rounded-2xl border border-zinc-200 bg-white p-5 shadow-sm sm:p-6">
                  <div className="mb-4 flex items-start justify-between gap-3">
                    <div className="space-y-1">
                      <p className="text-xs font-medium text-zinc-500">Plan</p>
                      <h2 className="text-sm font-semibold text-zinc-900">Current plan</h2>
                      <p className="text-[11px] text-zinc-500">
                        Your plan controls access to tools and workspace features.
                      </p>
                    </div>
                    <span className="inline-flex items-center rounded-full bg-emerald-50 px-3 py-1 text-[10px] font-semibold text-emerald-700">
                      Active · {planLabel}
                    </span>
                  </div>
                  <div className="grid gap-3 rounded-xl border border-zinc-200 bg-zinc-50 px-3 py-3 text-[11px] text-zinc-700 sm:grid-cols-[minmax(0,1.1fr)_minmax(0,1fr)]">
                    <div className="space-y-1">
                      <p className="font-medium text-zinc-900">What is included</p>
                      <ul className="space-y-1 text-[11px] text-zinc-600">
                        <li>Unlimited access to all current tools</li>
                        <li>Pinned tools and color presets in your workspace</li>
                        <li>Local-only analytics with no ads or trackers</li>
                      </ul>
                    </div>
                    <div className="space-y-1">
                      <p className="font-medium text-zinc-900">Plan status</p>
                      <p className="text-[11px] text-zinc-600">
                        Billing is not active yet. You can prepare your details here so you are
                        ready when subscriptions open.
                      </p>
                    </div>
                  </div>
                  {showAuthNotice && (
                    <div className="mt-4 rounded-lg border border-dashed border-zinc-200 bg-zinc-50 px-3 py-2 text-[11px] text-zinc-600">
                      You are currently signed out. Log in from the top-right corner to manage your
                      billing details.
                    </div>
                  )}
                </div>
                <div className="rounded-2xl border border-zinc-200 bg-white p-5 shadow-sm sm:p-6">
                  <div className="mb-4 space-y-1">
                    <p className="text-xs font-medium text-zinc-500">Payment</p>
                    <h2 className="text-sm font-semibold text-zinc-900">Payment method</h2>
                    <p className="text-[11px] text-zinc-500">
                      Choose how you would like to pay once billing is available.
                    </p>
                  </div>
                  <div className="mb-3 inline-flex items-center gap-2 rounded-full border border-zinc-200 bg-zinc-50 p-1 text-[11px]">
                    <button
                      type="button"
                      onClick={() => setPaymentMethod("card")}
                      className={`inline-flex items-center gap-1 rounded-full px-3 py-1 font-medium ${
                        paymentMethod === "card"
                          ? "bg-zinc-900 text-white"
                          : "text-zinc-600 hover:text-zinc-900"
                      }`}
                    >
                      <span className="h-1.5 w-1.5 rounded-full bg-zinc-300" />
                      Card
                    </button>
                    <button
                      type="button"
                      onClick={() => setPaymentMethod("paypal")}
                      className={`inline-flex items-center gap-1 rounded-full px-3 py-1 font-medium ${
                        paymentMethod === "paypal"
                          ? "bg-zinc-900 text-white"
                          : "text-zinc-600 hover:text-zinc-900"
                      }`}
                    >
                      <span className="h-1.5 w-1.5 rounded-full bg-zinc-300" />
                      PayPal
                    </button>
                    <button
                      type="button"
                      onClick={() => setPaymentMethod("bank")}
                      className={`inline-flex items-center gap-1 rounded-full px-3 py-1 font-medium ${
                        paymentMethod === "bank"
                          ? "bg-zinc-900 text-white"
                          : "text-zinc-600 hover:text-zinc-900"
                      }`}
                    >
                      <span className="h-1.5 w-1.5 rounded-full bg-zinc-300" />
                      Bank transfer
                    </button>
                  </div>
                  {paymentMethod === "card" && (
                    <div className="space-y-3">
                      <div className="space-y-1">
                        <p className="text-[11px] font-medium text-zinc-600">Cardholder name</p>
                        <input
                          type="text"
                          autoComplete="cc-name"
                          className="w-full rounded-md border border-zinc-200 bg-white px-3 py-2 text-sm text-zinc-900 outline-none ring-0 placeholder:text-zinc-400 focus:border-red-400 focus:ring-1 focus:ring-red-200"
                          placeholder="Name on card"
                        />
                      </div>
                      <div className="space-y-1">
                        <p className="text-[11px] font-medium text-zinc-600">Card number</p>
                        <input
                          type="text"
                          inputMode="numeric"
                          autoComplete="cc-number"
                          className="w-full rounded-md border border-zinc-200 bg-white px-3 py-2 text-sm text-zinc-900 outline-none ring-0 placeholder:text-zinc-400 focus:border-red-400 focus:ring-1 focus:ring-red-200"
                          placeholder="4242 4242 4242 4242"
                        />
                      </div>
                      <div className="grid gap-3 sm:grid-cols-3">
                        <div className="space-y-1">
                          <p className="text-[11px] font-medium text-zinc-600">Expiry</p>
                          <input
                            type="text"
                            inputMode="numeric"
                            autoComplete="cc-exp"
                            className="w-full rounded-md border border-zinc-200 bg-white px-3 py-2 text-sm text-zinc-900 outline-none ring-0 placeholder:text-zinc-400 focus:border-red-400 focus:ring-1 focus:ring-red-200"
                            placeholder="MM/YY"
                          />
                        </div>
                        <div className="space-y-1">
                          <p className="text-[11px] font-medium text-zinc-600">CVC</p>
                          <input
                            type="text"
                            inputMode="numeric"
                            autoComplete="cc-csc"
                            className="w-full rounded-md border border-zinc-200 bg-white px-3 py-2 text-sm text-zinc-900 outline-none ring-0 placeholder:text-zinc-400 focus:border-red-400 focus:ring-1 focus:ring-red-200"
                            placeholder="123"
                          />
                        </div>
                        <div className="space-y-1">
                          <p className="text-[11px] font-medium text-zinc-600">Postal code</p>
                          <input
                            type="text"
                            autoComplete="postal-code"
                            className="w-full rounded-md border border-zinc-200 bg-white px-3 py-2 text-sm text-zinc-900 outline-none ring-0 placeholder:text-zinc-400 focus:border-red-400 focus:ring-1 focus:ring-red-200"
                            placeholder="12345"
                          />
                        </div>
                      </div>
                    </div>
                  )}
                  {paymentMethod === "paypal" && (
                    <div className="space-y-2 text-[11px] text-zinc-600">
                      <p>
                        When billing is active, you will be able to connect a PayPal account here.
                      </p>
                      <p>For now, this section is a preview of the upcoming flow.</p>
                    </div>
                  )}
                  {paymentMethod === "bank" && (
                    <div className="space-y-2 text-[11px] text-zinc-600">
                      <p>
                        Bank transfers are usually reserved for larger team subscriptions. You will
                        be able to request invoicing details here.
                      </p>
                    </div>
                  )}
                  <div className="mt-4 flex items-center justify-between gap-3">
                    <p className="text-[10px] text-zinc-500">
                      Billing is not live yet. Details you add here stay on this device.
                    </p>
                    <button
                      type="button"
                      className="inline-flex items-center justify-center rounded-full bg-red-500 px-4 py-1.5 text-[11px] font-semibold text-white shadow-sm transition-transform hover:-translate-y-0.5 hover:bg-red-600"
                    >
                      Save billing details
                    </button>
                  </div>
                </div>
              </div>
              <div className="space-y-4">
                <div className="rounded-2xl border border-zinc-200 bg-white p-5 shadow-sm sm:p-6">
                  <div className="mb-4 space-y-1">
                    <p className="text-xs font-medium text-zinc-500">Invoices</p>
                    <h2 className="text-sm font-semibold text-zinc-900">Billing contact</h2>
                    <p className="text-[11px] text-zinc-500">
                      Choose where invoices and billing emails should be sent.
                    </p>
                  </div>
                  <div className="space-y-3">
                    <div className="space-y-1">
                      <p className="text-[11px] font-medium text-zinc-600">Billing email</p>
                      <input
                        type="email"
                        autoComplete="email"
                        defaultValue={user?.email ?? ""}
                        className="w-full rounded-md border border-zinc-200 bg-white px-3 py-2 text-sm text-zinc-900 outline-none ring-0 placeholder:text-zinc-400 focus:border-red-400 focus:ring-1 focus:ring-red-200"
                        placeholder="billing@company.com"
                      />
                    </div>
                    <div className="grid gap-3 sm:grid-cols-2">
                      <div className="space-y-1">
                        <p className="text-[11px] font-medium text-zinc-600">Company name</p>
                        <input
                          type="text"
                          className="w-full rounded-md border border-zinc-200 bg-white px-3 py-2 text-sm text-zinc-900 outline-none ring-0 placeholder:text-zinc-400 focus:border-red-400 focus:ring-1 focus:ring-red-200"
                          placeholder="Optional"
                        />
                      </div>
                      <div className="space-y-1">
                        <p className="text-[11px] font-medium text-zinc-600">Country</p>
                        <input
                          type="text"
                          defaultValue={countryLabel}
                          className="w-full rounded-md border border-zinc-200 bg-white px-3 py-2 text-sm text-zinc-900 outline-none ring-0 placeholder:text-zinc-400 focus:border-red-400 focus:ring-1 focus:ring-red-200"
                        />
                      </div>
                    </div>
                    <div className="space-y-1">
                      <p className="text-[11px] font-medium text-zinc-600">Address</p>
                      <textarea
                        rows={3}
                        className="w-full resize-none rounded-md border border-zinc-200 bg-white px-3 py-2 text-sm text-zinc-900 outline-none ring-0 placeholder:text-zinc-400 focus:border-red-400 focus:ring-1 focus:ring-red-200"
                        placeholder="Street, city, and any tax identifiers you would like on invoices."
                      />
                    </div>
                  </div>
                  <div className="mt-4 flex items-center justify-end">
                    <button
                      type="button"
                      className="inline-flex items-center justify-center rounded-full border border-zinc-200 bg-white px-4 py-1.5 text-[11px] font-medium text-zinc-700 shadow-sm transition-transform hover:-translate-y-0.5 hover:border-red-300 hover:bg-red-50 hover:text-red-700"
                    >
                      Save invoice details
                    </button>
                  </div>
                </div>
                <div className="rounded-2xl border border-zinc-200 bg-white p-5 shadow-sm sm:p-6">
                  <div className="mb-4 space-y-1">
                    <p className="text-xs font-medium text-zinc-500">Usage</p>
                    <h2 className="text-sm font-semibold text-zinc-900">Usage this month</h2>
                    <p className="text-[11px] text-zinc-500">
                      A quick snapshot of how you are using YOU-I across tools and workspace.
                    </p>
                  </div>
                  <div className="grid gap-3 sm:grid-cols-3">
                    <div className="rounded-xl border border-zinc-200 bg-zinc-50 px-3 py-2 text-[11px]">
                      <p className="text-[10px] font-medium uppercase tracking-wide text-zinc-500">
                        Tool sessions
                      </p>
                      <p className="mt-1 text-lg font-semibold text-zinc-900">0</p>
                      <p className="mt-0.5 text-[10px] text-zinc-500">Tracked locally on this device</p>
                    </div>
                    <div className="rounded-xl border border-zinc-200 bg-zinc-50 px-3 py-2 text-[11px]">
                      <p className="text-[10px] font-medium uppercase tracking-wide text-zinc-500">
                        Workspace presets
                      </p>
                      <p className="mt-1 text-lg font-semibold text-zinc-900">0</p>
                      <p className="mt-0.5 text-[10px] text-zinc-500">Saved in your local workspace</p>
                    </div>
                    <div className="rounded-xl border border-zinc-200 bg-zinc-50 px-3 py-2 text-[11px]">
                      <p className="text-[10px] font-medium uppercase tracking-wide text-zinc-500">
                        Billing period
                      </p>
                      <p className="mt-1 text-lg font-semibold text-zinc-900">Preview</p>
                      <p className="mt-0.5 text-[10px] text-zinc-500">
                        Usage-based billing is not enabled yet.
                      </p>
                    </div>
                  </div>
                  <p className="mt-3 text-[10px] text-zinc-500">
                    Detailed analytics live in Settings. When billing is active, a summary will
                    appear here alongside invoices.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </section>
      </main>
      <Footer />
    </div>
  );
}
