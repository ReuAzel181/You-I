"use client";

import Image from "next/image";
import Link from "next/link";
import { useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { useAnalytics, useSettings } from "@/providers/SettingsProvider";
import { PageTransitionLink } from "@/components/PageTransitionLink";
import { useAuth } from "@/providers/AuthProvider";
import { getSupabaseClient } from "@/lib/supabaseClient";

type VoucherAccentId = "red" | "sky" | "emerald" | "violet" | "amber";

type VoucherStyles = {
  container: string;
  label: string;
  body: string;
  input: string;
  button: string;
  error: string;
};

type VoucherToastStyles = {
  container: string;
  icon: string;
  button: string;
};

function getVoucherStyles(accent: VoucherAccentId): VoucherStyles {
  switch (accent) {
    case "emerald":
      return {
        container: "border-emerald-200 bg-emerald-50/70 text-emerald-700",
        label: "text-emerald-700",
        body: "text-emerald-700/90",
        input:
          "border-emerald-200 placeholder:text-emerald-300 focus:border-emerald-400 focus:ring-emerald-400",
        button: "bg-emerald-500 hover:bg-emerald-600 disabled:hover:bg-emerald-500",
        error: "text-emerald-600",
      };
    case "violet":
      return {
        container: "border-violet-200 bg-violet-50/70 text-violet-700",
        label: "text-violet-700",
        body: "text-violet-700/90",
        input:
          "border-violet-200 placeholder:text-violet-300 focus:border-violet-400 focus:ring-violet-400",
        button: "bg-violet-500 hover:bg-violet-600 disabled:hover:bg-violet-500",
        error: "text-violet-600",
      };
    case "amber":
      return {
        container: "border-amber-200 bg-amber-50/70 text-amber-800",
        label: "text-amber-800",
        body: "text-amber-800/90",
        input:
          "border-amber-200 placeholder:text-amber-300 focus:border-amber-400 focus:ring-amber-400",
        button: "bg-amber-500 hover:bg-amber-600 disabled:hover:bg-amber-500",
        error: "text-amber-700",
      };
    case "sky":
      return {
        container: "border-sky-200 bg-sky-50/70 text-sky-700",
        label: "text-sky-700",
        body: "text-sky-700/90",
        input:
          "border-sky-200 placeholder:text-sky-300 focus:border-sky-400 focus:ring-sky-400",
        button: "bg-sky-500 hover:bg-sky-600 disabled:hover:bg-sky-500",
        error: "text-sky-600",
      };
    case "red":
    default:
      return {
        container: "border-red-200 bg-red-50/70 text-red-700",
        label: "text-red-700",
        body: "text-red-700/90",
        input:
          "border-red-200 placeholder:text-red-300 focus:border-red-400 focus:ring-red-400",
        button: "bg-red-500 hover:bg-red-600 disabled:hover:bg-red-500",
        error: "text-red-600",
      };
  }
}

function getVoucherToastStyles(accent: VoucherAccentId): VoucherToastStyles {
  switch (accent) {
    case "emerald":
      return {
        container: "border-emerald-200 bg-white text-zinc-900",
        icon: "bg-emerald-500 text-white",
        button: "border-emerald-100 bg-emerald-50 text-emerald-800 hover:bg-emerald-100",
      };
    case "violet":
      return {
        container: "border-violet-200 bg-white text-zinc-900",
        icon: "bg-violet-500 text-white",
        button: "border-violet-100 bg-violet-50 text-violet-800 hover:bg-violet-100",
      };
    case "amber":
      return {
        container: "border-amber-200 bg-white text-zinc-900",
        icon: "bg-amber-500 text-white",
        button: "border-amber-100 bg-amber-50 text-amber-800 hover:bg-amber-100",
      };
    case "sky":
      return {
        container: "border-sky-200 bg-white text-zinc-900",
        icon: "bg-sky-500 text-white",
        button: "border-sky-100 bg-sky-50 text-sky-800 hover:bg-sky-100",
      };
    case "red":
    default:
      return {
        container: "border-red-200 bg-white text-zinc-900",
        icon: "bg-red-500 text-white",
        button: "border-red-100 bg-red-50 text-red-800 hover:bg-red-100",
      };
  }
}

function launchVoucherSideConfetti(accent: VoucherAccentId) {
  if (typeof window === "undefined") {
    return;
  }

  void import("canvas-confetti").then(({ default: confetti }) => {
    const end = Date.now() + 15000;
    const baseColors = [
      "#ef4444",
      "#f97316",
      "#0ea5e9",
      "#8b5cf6",
      "#22c55e",
      "#fee2e2",
      "#fef3c7",
      "#e0f2fe",
      "#ede9fe",
      "#dcfce7",
    ];
    const accentOrder: VoucherAccentId[] = ["red", "amber", "sky", "violet", "emerald"];
    const accentIndex = accentOrder.indexOf(accent);
    const offset = accentIndex === -1 ? 0 : accentIndex;
    const colors = [...baseColors.slice(offset), ...baseColors.slice(0, offset)];

    function frame() {
      confetti({
        particleCount: 3,
        angle: 60,
        spread: 55,
        origin: { x: 0 },
        colors,
        shapes: ["circle"],
      });
      confetti({
        particleCount: 3,
        angle: 120,
        spread: 55,
        origin: { x: 1 },
        colors,
        shapes: ["circle"],
      });

      if (Date.now() < end) {
        window.requestAnimationFrame(frame);
      }
    }

    frame();
  });
}

export default function PricingPage() {
  const { analyticsEnabled, trackEvent } = useAnalytics();
  const { user, isLoading } = useAuth();
  const {
    profileCountry,
    subscriptionMode,
    setSubscriptionMode,
    profileBannerColor,
  } = useSettings();
  const searchParams = useSearchParams();
  const [hasHydrated, setHasHydrated] = useState(false);
  const [billingMode, setBillingMode] = useState<"monthly" | "yearly">("monthly");
  const [voucherCode, setVoucherCode] = useState("");
  const [voucherNotice, setVoucherNotice] = useState<
    "" | "empty" | "applied" | "invalid" | "already-used" | "error" | "login-required"
  >("");
  const [isApplyingVoucher, setIsApplyingVoucher] = useState(false);
  const [showEmptyVoucherNotice, setShowEmptyVoucherNotice] = useState(false);
  const [emptyVoucherPosition, setEmptyVoucherPosition] = useState<{ x: number; y: number } | null>(
    null,
  );
  const [voucherPlanLabel, setVoucherPlanLabel] = useState<"Pro" | "Top tier" | null>(null);
  const [voucherEndsAt, setVoucherEndsAt] = useState<string | null>(null);
  const [hasActiveVoucher, setHasActiveVoucher] = useState(false);

  const isProPlan = subscriptionMode === "pro";
  const isTopPlan = subscriptionMode === "top";
  const isFreePlan = !isProPlan && !isTopPlan;

  useEffect(() => {
    if (!analyticsEnabled) {
      return;
    }

    trackEvent("view_pricing", { path: "/pricing" });
  }, [analyticsEnabled, trackEvent]);

  useEffect(() => {
    const id = window.setTimeout(() => {
      setHasHydrated(true);
    }, 0);

    return () => {
      window.clearTimeout(id);
    };
  }, []);

  useEffect(() => {
    const codeFromQuery = searchParams.get("voucher");

    if (codeFromQuery && !voucherCode) {
      setVoucherCode(codeFromQuery);
    }
  }, [searchParams, voucherCode]);

  useEffect(() => {
    if (voucherNotice !== "applied") {
      return;
    }

    const id = window.setTimeout(() => {
      setVoucherNotice("");
    }, 5000);

    return () => {
      window.clearTimeout(id);
    };
  }, [voucherNotice]);

  const showAuthNotice = !user && !isLoading;
  const voucherStyles = getVoucherStyles(profileBannerColor);
  const voucherToastStyles = getVoucherToastStyles(profileBannerColor);

  useEffect(() => {
    if (!user || isLoading) {
      return;
    }

    let isCancelled = false;

    const loadActiveVoucher = async () => {
      const supabase = getSupabaseClient();
      const nowIso = new Date().toISOString();

      const { data, error } = await supabase
        .from("user_voucher_subscriptions")
        .select("ends_at")
        .eq("user_id", user.id)
        .gt("ends_at", nowIso)
        .order("ends_at", { ascending: false })
        .limit(1);

      if (isCancelled) {
        return;
      }

      if (error || !data || data.length === 0) {
        setHasActiveVoucher(false);
        return;
      }

      setHasActiveVoucher(true);
      setVoucherEndsAt(data[0].ends_at as string);
      setVoucherPlanLabel(subscriptionMode === "pro" ? "Pro" : "Top tier");
    };

    void loadActiveVoucher();

    return () => {
      isCancelled = true;
    };
  }, [user, isLoading, subscriptionMode]);

  const currencyConfig = (() => {
    switch (profileCountry) {
      case "GB":
        return { code: "GBP", rate: 0.8, label: "United Kingdom" };
      case "EU":
        return { code: "EUR", rate: 0.9, label: "Euro area" };
      case "IN":
        return { code: "INR", rate: 83, label: "India" };
      case "JP":
        return { code: "JPY", rate: 150, label: "Japan" };
      case "US":
      default:
        return { code: "USD", rate: 1, label: "United States" };
    }
  })();

  const formatPrice = (usdAmount: number) => {
    const rawValue = usdAmount * currencyConfig.rate;
    const value = Math.round(rawValue);

    if (typeof Intl === "undefined") {
      return `${currencyConfig.code} ${value.toString()}`;
    }

    try {
      const formatter = new Intl.NumberFormat(undefined, {
        style: "currency",
        currency: currencyConfig.code,
        maximumFractionDigits: 0,
        minimumFractionDigits: 0,
      });

      return formatter.format(value);
    } catch {
      return `${currencyConfig.code} ${value.toString()}`;
    }
  };

  return (
    <div className="min-h-screen font-sans bg-[var(--background)] text-[var(--foreground)]">
      <Header />
      <main>
        {!hasHydrated ? (
          <PricingSkeleton />
        ) : (
          <>
        <section>
          <div className="mx-auto max-w-6xl px-4 pt-12 pb-6 md:px-8 ">
            <div className="flex flex-col gap-6 md:flex-row md:items-start md:justify-between">
              <div className="space-y-4">
                <div className="inline-flex items-center gap-2 rounded-full border border-red-100 bg-red-50 px-3 py-1 text-xs font-medium text-red-600">
                  <span className="h-1.5 w-1.5 rounded-full bg-red-500" />
                  Pricing
                </div>
                <h1 className="text-balance text-2xl font-semibold tracking-tight text-zinc-900 sm:text-3xl lg:text-4xl">
                  Pricing plans for every stage
                </h1>
                <p className="max-w-2xl text-sm leading-relaxed text-zinc-600 sm:text-base">
                  Start free, upgrade anytime. Your settings and pinned tools stay the same.
                </p>
              </div>
              <PageTransitionLink
                href="/"
                className="inline-flex h-7 items-center gap-1 self-start rounded-full border border-red-300 px-3 text-[11px] font-medium text-red-400 transition-colors hover:border-red-400 hover:bg-red-50 hover:text-red-600"
                aria-label="Back to homepage"
              >
                <Image
                  src="/icons/chevron.svg"
                  alt=""
                  width={10}
                  height={10}
                  className="h-3 w-3"
                />
                <span>Back</span>
              </PageTransitionLink>
            </div>
          </div>
        </section>
        <section className="bg-[var(--background)]">
          <div className="mx-auto max-w-6xl px-4 pb-12 md:px-8">
            <div className="mb-4 flex flex-wrap items-center justify-between gap-2">
              <div className="inline-flex items-center gap-1 rounded-full border border-zinc-200 bg-white/80 p-1 text-[11px] text-zinc-700">
                <button
                  type="button"
                  onClick={() => setBillingMode("monthly")}
                  className={`rounded-full px-3 py-1 font-medium ${
                    billingMode === "monthly"
                      ? "bg-zinc-900 text-white"
                      : "text-zinc-600 hover:text-zinc-900"
                  }`}
                >
                  Monthly
                </button>
                <button
                  type="button"
                  onClick={() => setBillingMode("yearly")}
                  className={`rounded-full px-3 py-1 font-medium ${
                    billingMode === "yearly"
                      ? "bg-zinc-900 text-white"
                      : "text-zinc-600 hover:text-zinc-900"
                  }`}
                >
                  Yearly · save 15%
                </button>
              </div>
              <div className="text-right text-[10px] text-zinc-500">
                <p className="mt-0.5">
                  Showing prices in {currencyConfig.code} based on your profile country.
                </p>
              </div>
            </div>
            <div className="grid items-center pb-6 gap-4 md:grid-cols-3">
              <div className="flex flex-col rounded-2xl border border-zinc-200 bg-zinc-50 p-3 sm:p-4">
                <div className="flex items-center justify-between gap-2">
                  <p className="text-xs font-medium uppercase tracking-wide text-zinc-800">
                    Starter
                  </p>
                  {isFreePlan ? (
                    <span className="rounded-full bg-emerald-500 px-2 py-0.5 text-[10px] font-semibold text-white">
                      Current plan
                    </span>
                  ) : (
                    <span className="rounded-full border border-zinc-300 bg-white px-2 py-0.5 text-[10px] font-semibold text-zinc-700">
                      Included
                    </span>
                  )}
                </div>
                <p className="mt-3 text-3xl font-semibold tracking-tight text-zinc-900">
                  {formatPrice(0)}
                </p>
                <p className="mt-1 text-xs text-zinc-600">
                  Try Zanari on solo work with your own pace.
                </p>
                <ul className="mt-4 space-y-1.5 text-[11px]">
                  <li className="flex items-start gap-2">
                    <span className="mt-0.5 inline-flex items-center justify-center">
                      <Image
                        src="/icons/check.svg"
                        alt=""
                        width={16}
                        height={16}
                        className="h-3.5 w-3.5"
                      />
                    </span>
                    <span className="font-medium text-zinc-700">
                      Unlimited access to all tools
                    </span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="mt-0.5 inline-flex items-center justify-center">
                      <Image
                        src="/icons/check.svg"
                        alt=""
                        width={16}
                        height={16}
                        className="h-3.5 w-3.5"
                      />
                    </span>
                    <span className="font-medium text-zinc-700">
                      Save pinned tools and presets
                    </span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="mt-0.5 inline-flex items-center justify-center">
                      <Image
                        src="/icons/check.svg"
                        alt=""
                        width={16}
                        height={16}
                        className="h-3.5 w-3.5"
                      />
                    </span>
                    <span className="font-medium text-zinc-700">
                      Local-only analytics, no ads
                    </span>
                  </li>
                </ul>
                {isFreePlan && (
                  <>
                    <div className="mt-4 inline-flex items-center gap-2 rounded-full border border-emerald-100 bg-emerald-50 px-3 py-1 text-[11px] font-medium text-emerald-700">
                      <span className="h-1.5 w-1.5 rounded-full bg-emerald-500" />
                      Starter is active by default for every account.
                    </div>
                    <button
                      className="mt-4 inline-flex items-center justify-center rounded-full border border-zinc-200 bg-white px-4 py-1.5 text-[11px] font-semibold text-zinc-500"
                      aria-disabled="true"
                    >
                      You&apos;re using this plan
                    </button>
                  </>
                )}
              </div>
              <div className="flex flex-col justify-center rounded-2xl border-2 border-red-500 bg-red-50 pricing-featured-card p-5 sm:p-6 md:py-8 md:h-[26rem] shadow-sm md:z-10">
                <div className="flex items-start justify-between gap-3">
                  <div className="space-y-1 flex gap-2">
                    <p className="text-xs font-semibold uppercase tracking-wide text-red-700">
                      Pro
                    </p>
                    <div className="flex flex-col gap-1">
                      <span className="inline-flex w-fit items-center rounded-full border border-red-200 bg-white px-2 py-0.5 text-[10px] font-semibold text-red-600">
                        Best for you
                      </span>
                    </div>
                  </div>
                  {isProPlan ? (
                    <span className="rounded-full bg-emerald-500 px-2 py-0.5 text-[10px] font-semibold text-white">
                      Current plan
                    </span>
                  ) : (
                    <span className="rounded-full border border-red-300 bg-red-100 px-3 py-1 text-[10px] font-semibold text-red-700">
                      Recommended
                    </span>
                  )}
                </div>
                  <p
                    key={billingMode}
                    className="mt-3 text-3xl font-semibold tracking-tight text-zinc-900 pricing-featured-amount pricing-amount-animate [data-theme=dark]:text-white"
                  >
                    {formatPrice(billingMode === "monthly" ? 5 : 50)}
                  </p>
                  <p className="mt-1 text-xs text-zinc-700 pricing-featured-body [data-theme=dark]:text-zinc-100">
                    For weekly interface work with Zanari next to your design tool.
                  </p>
                  <ul className="mt-4 space-y-1.5 text-[11px] pricing-featured-body">
                    <li className="flex items-start gap-2">
                      <span className="mt-0.5 inline-flex items-center justify-center">
                        <Image
                          src="/icons/check.svg"
                          alt=""
                          width={16}
                          height={16}
                          className="h-3.5 w-3.5"
                        />
                      </span>
                      <span className="font-medium text-red-700 [data-theme=dark]:text-red-200">
                        Unlimited access to all tools
                      </span>
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="mt-0.5 inline-flex items-center justify-center">
                        <Image
                          src="/icons/check.svg"
                          alt=""
                          width={16}
                          height={16}
                          className="h-3.5 w-3.5"
                        />
                      </span>
                      <span className="font-medium text-red-700 [data-theme=dark]:text-red-200">
                        Save pinned tools and workspace presets
                      </span>
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="mt-0.5 inline-flex items-center justify-center">
                        <Image
                          src="/icons/check.svg"
                          alt=""
                          width={16}
                          height={16}
                          className="h-3.5 w-3.5"
                        />
                      </span>
                      <span className="font-medium text-red-700 [data-theme=dark]:text-red-200">
                        Local analytics only, no ads
                      </span>
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="mt-0.5 inline-flex items-center justify-center">
                        <Image
                          src="/icons/check.svg"
                          alt=""
                          width={16}
                          height={16}
                          className="h-3.5 w-3.5"
                        />
                      </span>
                      <span className="font-medium text-red-700 [data-theme=dark]:text-red-200">
                        Saved presets for colors and typography
                      </span>
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="mt-0.5 inline-flex items-center justify-center">
                        <Image
                          src="/icons/check.svg"
                          alt=""
                          width={16}
                          height={16}
                          className="h-3.5 w-3.5"
                        />
                      </span>
                      <span className="font-medium text-red-700 [data-theme=dark]:text-red-200">
                        Sections for different products or clients
                      </span>
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="mt-0.5 inline-flex items-center justify-center">
                        <Image
                          src="/icons/check.svg"
                          alt=""
                          width={16}
                          height={16}
                          className="h-3.5 w-3.5"
                        />
                      </span>
                      <span className="font-medium text-red-700 [data-theme=dark]:text-red-200">
                        Email updates when new tools and checks are added
                      </span>
                    </li>
                  </ul>
                  {showAuthNotice ? (
                    <p className="mt-6 text-[11px] font-medium text-red-600">
                      Log in from the top-right corner to manage billing and upgrade.
                    </p>
                  ) : (
                    <Link
                      href="/billing"
                      className="mt-6 inline-flex items-center justify-center rounded-full bg-red-500 px-4 py-1.5 text-[11px] font-semibold text-white shadow-sm transition-transform duration-150 hover:-translate-y-0.5 hover:bg-red-600 active:translate-y-0 active:scale-95"
                    >
                      {subscriptionMode === "pro" ? "Manage billing" : "Open billing"}
                    </Link>
                  )}
                </div>
              <div className="top-tier-glow">
                <div className="violet-inner-ring relative flex w-full flex-col overflow-hidden rounded-2xl border-2 border-violet-500 bg-gradient-to-b from-violet-50 to-violet-100 p-3 sm:p-4 shadow-sm">
                  <div
                    className="pointer-events-none absolute inset-x-[-40%] top-0 h-24 bg-gradient-to-b from-white/70 via-violet-50/40 to-transparent opacity-90 mix-blend-screen blur-md animate-pulse"
                    aria-hidden="true"
                  />
                  <div
                    className="pointer-events-none absolute -right-10 top-10 h-24 w-24 rounded-full bg-violet-400/35 blur-3xl"
                    aria-hidden="true"
                  />
                  <div className="flex items-center justify-between gap-2">
                    <p className="text-xs font-medium uppercase tracking-wide text-violet-700">
                      Top tier
                    </p>
                    {isTopPlan ? (
                      <span className="rounded-full bg-emerald-500 px-2 py-0.5 text-[10px] font-semibold text-white">
                        Current plan
                      </span>
                    ) : (
                      <span className="rounded-full border border-violet-300 bg-white px-2 py-0.5 text-[10px] font-semibold text-violet-700">
                        Teams
                      </span>
                    )}
                  </div>
                  <div className="mt-2 h-0.5 w-16 rounded-full bg-gradient-to-r from-violet-500 via-fuchsia-400 to-transparent" />
                  <p
                    key={billingMode === "monthly" ? "top-monthly" : "top-yearly"}
                    className="mt-3 text-3xl font-semibold tracking-tight text-zinc-900 pricing-amount-animate"
                  >
                    {formatPrice(billingMode === "monthly" ? 12 : 120)}
                  </p>
                  <p className="mt-1 text-xs text-violet-700">
                    For teams shipping accessible work across many products.
                  </p>
                  <ul className="mt-2 space-y-1.5 text-[11px]">
                    <li className="flex items-start gap-2">
                      <span className="mt-0.5 inline-flex items-center justify-center">
                        <Image
                          src="/icons/check.svg"
                          alt=""
                          width={16}
                          height={16}
                          className="h-3.5 w-3.5"
                        />
                      </span>
                      <span className="font-medium text-violet-700">
                        Unlimited access for your team
                      </span>
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="mt-0.5 inline-flex items-center justify-center">
                        <Image
                          src="/icons/check.svg"
                          alt=""
                          width={16}
                          height={16}
                          className="h-3.5 w-3.5"
                        />
                      </span>
                      <span className="font-medium text-violet-700">
                        Shared presets and workspaces
                      </span>
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="mt-0.5 inline-flex items-center justify-center">
                        <Image
                          src="/icons/check.svg"
                          alt=""
                          width={16}
                          height={16}
                          className="h-3.5 w-3.5"
                        />
                      </span>
                      <span className="font-medium text-violet-700">
                        Local analytics only, no tracking
                      </span>
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="mt-0.5 inline-flex items-center justify-center">
                        <Image
                          src="/icons/check.svg"
                          alt=""
                          width={16}
                          height={16}
                          className="h-3.5 w-3.5"
                        />
                      </span>
                      <span className="font-medium text-violet-700">
                        Sections shared across products
                      </span>
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="mt-0.5 inline-flex items-center justify-center">
                        <Image
                          src="/icons/check.svg"
                          alt=""
                          width={16}
                          height={16}
                          className="h-3.5 w-3.5"
                        />
                      </span>
                      <span className="font-medium text-violet-700">
                        Role-based workspace suggestions
                      </span>
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="mt-0.5 inline-flex items-center justify-center">
                        <Image
                          src="/icons/check.svg"
                          alt=""
                          width={16}
                          height={16}
                          className="h-3.5 w-3.5"
                        />
                      </span>
                      <span className="font-medium text-violet-700">
                        Priority feedback and early feature access
                      </span>
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="mt-0.5 inline-flex items-center justify-center">
                        <Image
                          src="/icons/check.svg"
                          alt=""
                          width={16}
                          height={16}
                          className="h-3.5 w-3.5"
                        />
                      </span>
                      <span className="font-medium text-violet-700">
                        Email updates on new checks and tools
                      </span>
                    </li>
                  </ul>
                  {showAuthNotice ? (
                    <p className="mt-6 text-[11px] font-medium text-violet-700">
                      Log in from the top-right corner to manage billing and upgrade.
                    </p>
                  ) : (
                    <Link
                      href="/billing"
                      className="mt-6 inline-flex items-center justify-center rounded-full border border-violet-300 bg-white px-4 py-1.5 text-[11px] font-medium text-violet-700 transition-colors hover:border-violet-400 hover:bg-violet-50 hover:text-violet-800"
                    >
                      {subscriptionMode === "top" ? "You're using this plan" : "Open billing"}
                    </Link>
                  )}
                </div>
              </div>
            </div>
            <div
              className={`mb-3 flex flex-wrap items-center gap-3 rounded-xl px-3 py-3 text-[11px] shadow-sm ${voucherStyles.container}`}
            >
              <div className="min-w-0 flex-1">
                <p
                  className={`text-[10px] font-semibold uppercase tracking-wide ${voucherStyles.label}`}
                >
                  Have a voucher?
                </p>
                <p className={`mt-1 text-[11px] ${voucherStyles.body}`}>
                  Enter a code to unlock amazing gifts.
                </p>
              </div>
              {hasActiveVoucher && voucherEndsAt ? (
                <div className="flex w-full flex-col gap-1 sm:w-auto sm:min-w-[220px]">
                  <p className={`text-[11px] font-medium ${voucherStyles.body}`}>
                    You already redeemed a voucher.
                  </p>
                  <p className={`text-[11px] ${voucherStyles.body}`}>
                    Your voucher access is active until{" "}
                    {new Date(voucherEndsAt).toLocaleDateString("en-US", {
                      month: "short",
                      day: "numeric",
                      year: "numeric",
                    })}
                    .
                  </p>
                  <p className={`text-[10px] ${voucherStyles.body}`}>
                    Redeeming another code will be available once this plan expires.
                  </p>
                </div>
              ) : (
                <div className="flex w-full flex-col gap-1 sm:w-auto sm:min-w-[220px]">
                  <div className="flex w-full gap-2">
                    <input
                      type="text"
                      inputMode="text"
                      placeholder="Enter voucher code"
                      value={voucherCode}
                      onChange={(event) => {
                        setVoucherCode(event.target.value);
                        if (voucherNotice) {
                          setVoucherNotice("");
                          setShowEmptyVoucherNotice(false);
                          setEmptyVoucherPosition(null);
                        }
                      }}
                      className={`h-8 flex-1 rounded-lg bg-white px-2 text-[11px] text-zinc-800 outline-none ring-0 focus:outline-none focus:ring-1 ${voucherStyles.input}`}
                    />
                    <button
                      type="button"
                      disabled={isApplyingVoucher}
                      onClick={async (event) => {
                        if (!voucherCode.trim()) {
                          const rect = (
                            event.currentTarget as HTMLButtonElement
                          ).getBoundingClientRect();
                          setVoucherNotice("empty");
                          setEmptyVoucherPosition({
                            x: rect.left + rect.width / 2,
                            y: rect.top,
                          });
                          setShowEmptyVoucherNotice(true);
                          window.setTimeout(() => {
                            setShowEmptyVoucherNotice(false);
                            setVoucherNotice("");
                            setEmptyVoucherPosition(null);
                          }, 2000);
                          return;
                        }

                        if (!user) {
                          setVoucherNotice("login-required");
                          return;
                        }

                        setIsApplyingVoucher(true);
                        try {
                          const supabase = getSupabaseClient();
                          const trimmedCode = voucherCode.trim();

                          const { data: voucher, error: fetchError } = await supabase
                            .from("vouchers")
                            .select("id, is_redeemed, pro_days, plan, expires_at")
                            .eq("code", trimmedCode)
                            .maybeSingle();

                          if (fetchError) {
                            setVoucherNotice("error");
                            return;
                          }

                          if (!voucher) {
                            setVoucherNotice("invalid");
                            return;
                          }

                          if ((voucher as { is_redeemed?: boolean }).is_redeemed) {
                            setVoucherNotice("already-used");
                            return;
                          }

                          const { pro_days: proDays } = voucher as {
                            pro_days?: number | null;
                          };

                          if (!proDays || proDays <= 0) {
                            setVoucherNotice("invalid");
                            return;
                          }

                          const now = new Date();
                          const endsAt = new Date(now.getTime() + proDays * 24 * 60 * 60 * 1000);

                          const { error: subscriptionError } = await supabase
                            .from("user_voucher_subscriptions")
                            .insert({
                              user_id: user.id,
                              voucher_id: (voucher as { id: string }).id,
                              started_at: now.toISOString(),
                              ends_at: endsAt.toISOString(),
                            });

                          if (subscriptionError) {
                            setVoucherNotice("error");
                            return;
                          }

                          const { error: redeemError } = await supabase
                            .from("vouchers")
                            .update({ is_redeemed: true, user_id: user.id })
                            .eq("id", (voucher as { id: string }).id);

                          if (redeemError) {
                            setVoucherNotice("error");
                            return;
                          }

                          const nextVoucherPlan =
                            (voucher as { plan?: string | null }).plan === "starter"
                              ? "pro"
                              : "top";
                          const planLabel = nextVoucherPlan === "pro" ? "Pro" : "Top tier";

                          const { error: userUpdateError } = await supabase
                            .from("users")
                            .update({
                              subscription_mode:
                                nextVoucherPlan === "top"
                                  ? "top_tier"
                                  : nextVoucherPlan === "pro"
                                    ? "pro"
                                    : "starter",
                            })
                            .eq("id", user.id);

                          if (userUpdateError) {
                            setVoucherNotice("error");
                            return;
                          }

                          setSubscriptionMode(nextVoucherPlan);
                          setVoucherPlanLabel(planLabel);
                          setVoucherEndsAt(endsAt.toISOString());
                          setHasActiveVoucher(true);
                          setVoucherNotice("applied");
                          launchVoucherSideConfetti(profileBannerColor);
                        } catch {
                          setVoucherNotice("error");
                        } finally {
                          setIsApplyingVoucher(false);
                        }
                      }}
                      className={`inline-flex h-8 items-center justify-center rounded-lg px-3 text-[11px] font-semibold text-white shadow-sm disabled:opacity-60 ${voucherStyles.button}`}
                    >
                      {isApplyingVoucher ? "Applying…" : "Redeem"}
                    </button>
                  </div>
                  {voucherNotice === "empty" && null}
                  {voucherNotice === "login-required" && (
                    <p className={`text-[10px] font-medium ${voucherStyles.error}`}>
                      Log in to apply the voucher.
                    </p>
                  )}
                  {voucherNotice === "invalid" && (
                    <p className={`text-[10px] font-medium ${voucherStyles.error}`}>
                      This voucher code is not valid. Check the code and try again.
                    </p>
                  )}
                  {voucherNotice === "already-used" && (
                    <p className={`text-[10px] font-medium ${voucherStyles.error}`}>
                      This voucher has already been used.
                    </p>
                  )}
                  {voucherNotice === "error" && (
                    <p className={`text-[10px] font-medium ${voucherStyles.error}`}>
                      We could not apply this voucher right now. Please try again later.
                    </p>
                  )}
                </div>
              )}
            </div>
            <div className="mt-6 grid gap-3 rounded-2xl border border-zinc-200 bg-white px-4 py-3 text-[11px] text-zinc-600 md:grid-cols-3">
              <div>
                <p className="font-medium text-zinc-800">All plans include</p>
                <p className="mt-1 text-[11px] text-zinc-600">
                  Access to every current tool, contrast-safe defaults, and a workspace that lives
                  in your browser.
                </p>
              </div>
              <div>
                <p className="font-medium text-zinc-800">How you might use this</p>
                <p className="mt-1 text-[11px] text-zinc-600">
                  Run quick checks before shipping, explore new palettes, and size frames without
                  having to open a full design file.
                </p>
              </div>
              <div>
                <p className="font-medium text-zinc-800">About these prices</p>
                <p className="mt-1 text-[11px] text-zinc-600">
                  Prices are placeholders for layout only. When billing launches, you can stay on
                  the free tier or upgrade with the same account.
                </p>
              </div>
            </div>
          </div>
        </section>
          </>
        )}
        {voucherNotice === "applied" && voucherPlanLabel && voucherEndsAt && (
          <>
            <div className="pointer-events-none fixed inset-0 z-40 flex items-start justify-center px-4 pt-20 sm:px-0">
              <div
                className={`pointer-events-auto flex w-full max-w-md flex-col gap-3 rounded-2xl border px-5 py-4 text-[13px] shadow-lg ring-1 ring-black/5 sm:px-6 sm:py-5 ${voucherToastStyles.container}`}
              >
                <div className="flex items-start gap-3">
                  <div
                    className={`mt-0.5 flex h-7 w-7 items-center justify-center rounded-full text-[11px] font-semibold ${voucherToastStyles.icon}`}
                  >
                    ✓
                  </div>
                  <div className="flex flex-col gap-1">
                    <p className="text-[11px] font-semibold uppercase tracking-wide">
                      Voucher applied
                    </p>
                    <p className="text-[12px] font-medium leading-snug">
                      You unlocked the {voucherPlanLabel} plan.
                    </p>
                    <p className="text-[11px] leading-snug opacity-90">
                      Your access runs until{" "}
                      {new Date(voucherEndsAt).toLocaleDateString("en-US", {
                        month: "short",
                        day: "numeric",
                        year: "numeric",
                      })}
                      .
                    </p>
                    <p className="text-[11px] leading-snug text-zinc-500">
                      You can redeem another voucher once this plan expires.
                    </p>
                  </div>
                </div>
                <div className="flex justify-end">
                  <button
                    type="button"
                    onClick={() => setVoucherNotice("")}
                    className={`inline-flex items-center justify-center rounded-full border px-3 py-1.5 text-[11px] font-medium ${voucherToastStyles.button}`}
                  >
                    Got it
                  </button>
                </div>
              </div>
            </div>
            <VoucherConfetti accent={profileBannerColor} />
          </>
        )}
        {voucherNotice === "empty" && emptyVoucherPosition && (
          <div
            className={`pointer-events-none fixed z-30 -translate-x-1/2 -translate-y-2 transform rounded-full border border-red-200 bg-white/95 px-3 py-1.5 text-[10px] font-medium text-red-700 shadow-sm transition-opacity duration-200 ${
              showEmptyVoucherNotice ? "opacity-100" : "opacity-0"
            }`}
            style={{
              left: emptyVoucherPosition.x,
              top: emptyVoucherPosition.y,
            }}
          >
            Enter a code first.
          </div>
        )}
      </main>
      <Footer />
    </div>
  );
}

type VoucherConfettiProps = {
  accent: VoucherAccentId;
};

function VoucherConfetti({ accent }: VoucherConfettiProps) {
  const palette: VoucherAccentId[] = ["red", "amber", "sky", "violet", "emerald"];
  const colorClassMap: Record<VoucherAccentId, string> = {
    red: "bg-red-400",
    amber: "bg-amber-400",
    sky: "bg-sky-400",
    violet: "bg-violet-400",
    emerald: "bg-emerald-400",
  };
  const softColorClassMap: Record<VoucherAccentId, string> = {
    red: "bg-red-300",
    amber: "bg-amber-300",
    sky: "bg-sky-300",
    violet: "bg-violet-300",
    emerald: "bg-emerald-300",
  };
  const startIndex = palette.indexOf(accent);
  const ordered = startIndex === -1 ? palette : [...palette.slice(startIndex), ...palette.slice(0, startIndex)];
  const primaryClasses = ordered.map((id) => colorClassMap[id]);
  const secondaryClasses = ordered.map((id) => softColorClassMap[id]);

  return (
    <div className="pointer-events-none fixed inset-y-0 right-0 z-30 flex items-center pr-4 sm:pr-6">
      <div className="relative h-32 w-32 sm:h-40 sm:w-40">
        <div
          className={`absolute left-2 top-4 h-3 w-3 rounded-sm ${primaryClasses[0]} celebrate-confetti-orbit`}
        />
        <div
          className={`absolute right-3 top-10 h-2.5 w-2.5 rounded-sm ${secondaryClasses[1]} celebrate-confetti-sway`}
        />
        <div
          className={`absolute bottom-6 left-6 h-3 w-3 rounded-sm ${primaryClasses[2]} celebrate-confetti-orbit`}
        />
        <div
          className={`absolute bottom-4 right-5 h-2.5 w-2.5 rounded-sm ${secondaryClasses[3]} celebrate-confetti-sway`}
        />
      </div>
    </div>
  );
}

function PricingSkeleton() {
  return (
    <>
      <section>
        <div className="mx-auto max-w-6xl px-4 pt-12 pb-6 md:px-8">
          <div className="flex flex-col gap-6 md:flex-row md:items-start md:justify-between">
            <div className="space-y-4">
              <div className="inline-flex items-center gap-2 rounded-full bg-zinc-100 px-3 py-1 text-[10px] font-medium text-zinc-400">
                <span className="h-1.5 w-1.5 rounded-full bg-zinc-300" />
                <span className="h-3 w-24 rounded-full bg-zinc-200" />
              </div>
              <div className="space-y-3">
                <div className="h-6 w-56 rounded-full bg-zinc-200" />
                <div className="h-3 w-72 rounded-full bg-zinc-200" />
                <div className="h-3 w-64 rounded-full bg-zinc-200" />
              </div>
            </div>
            <div className="flex items-center">
              <div className="inline-flex h-7 items-center gap-2 rounded-full border border-zinc-200 bg-white px-3 text-[11px] text-zinc-400">
                <span className="h-3 w-3 rounded-full bg-zinc-200" />
                <span className="h-3 w-16 rounded-full bg-zinc-200" />
              </div>
            </div>
          </div>
        </div>
      </section>
      <section className="bg-[var(--background)]">
        <div className="mx-auto max-w-6xl px-4 pb-12 md:px-8">
          <div className="mb-4 flex flex-wrap items-center justify-between gap-2">
            <div className="inline-flex items-center gap-1 rounded-full bg-zinc-100 px-2 py-1 text-[10px] text-zinc-400">
              <span className="h-7 w-20 rounded-full bg-zinc-200" />
              <span className="h-7 w-24 rounded-full bg-zinc-200" />
            </div>
            <div className="text-right text-[10px] text-zinc-400">
              <div className="h-3 w-40 rounded-full bg-zinc-200 ml-auto" />
            </div>
          </div>
          <div className="grid items-center gap-4 pb-6 md:grid-cols-3">
            <div className="flex flex-col rounded-2xl border border-zinc-200 bg-zinc-50 p-3 sm:p-4">
              <div className="flex items-center justify-between gap-2">
                <div className="h-4 w-24 rounded-full bg-zinc-200" />
                <div className="h-5 w-20 rounded-full bg-zinc-200" />
              </div>
              <div className="mt-3 h-7 w-24 rounded-full bg-zinc-200" />
              <div className="mt-2 h-3 w-40 rounded-full bg-zinc-200" />
              <div className="mt-4 space-y-2">
                <div className="flex items-center gap-2">
                  <div className="h-3 w-3 rounded-full bg-zinc-200" />
                  <div className="h-3 w-32 rounded-full bg-zinc-200" />
                </div>
                <div className="flex items-center gap-2">
                  <div className="h-3 w-3 rounded-full bg-zinc-200" />
                  <div className="h-3 w-32 rounded-full bg-zinc-200" />
                </div>
                <div className="flex items-center gap-2">
                  <div className="h-3 w-3 rounded-full bg-zinc-200" />
                  <div className="h-3 w-32 rounded-full bg-zinc-200" />
                </div>
              </div>
            </div>
            <div className="flex flex-col justify-center rounded-2xl border-2 border-zinc-200 bg-zinc-50 p-5 shadow-sm sm:p-6 md:h-[26rem]">
              <div className="flex items-start justify-between gap-3">
                <div className="space-y-1">
                  <div className="h-4 w-12 rounded-full bg-zinc-200" />
                  <div className="h-4 w-20 rounded-full bg-zinc-100" />
                </div>
                <div className="h-5 w-20 rounded-full bg-zinc-200" />
              </div>
              <div className="mt-4 space-y-2">
                <div className="h-8 w-24 rounded-full bg-zinc-200" />
                <div className="h-3 w-40 rounded-full bg-zinc-200" />
              </div>
              <div className="mt-4 space-y-2">
                {Array.from({ length: 4 }).map((_, index) => (
                  <div key={index} className="flex items-center gap-2">
                    <div className="h-3 w-3 rounded-full bg-zinc-200" />
                    <div className="h-3 w-40 rounded-full bg-zinc-100" />
                  </div>
                ))}
              </div>
              <div className="mt-6 h-8 w-32 rounded-full bg-zinc-200" />
            </div>
            <div className="rounded-2xl border border-zinc-200 bg-zinc-50 p-4 shadow-sm sm:p-5">
              <div className="flex items-center justify-between gap-2">
                <div className="h-4 w-16 rounded-full bg-zinc-200" />
                <div className="h-5 w-20 rounded-full bg-zinc-200" />
              </div>
              <div className="mt-3 h-7 w-24 rounded-full bg-zinc-200" />
              <div className="mt-2 h-3 w-40 rounded-full bg-zinc-200" />
              <div className="mt-3 space-y-2">
                {Array.from({ length: 4 }).map((_, index) => (
                  <div key={index} className="flex items-center gap-2">
                    <div className="h-3 w-3 rounded-full bg-zinc-200" />
                    <div className="h-3 w-40 rounded-full bg-zinc-100" />
                  </div>
                ))}
              </div>
              <div className="mt-6 h-8 w-32 rounded-full bg-zinc-200" />
            </div>
          </div>
        </div>
      </section>
    </>
  );
}
