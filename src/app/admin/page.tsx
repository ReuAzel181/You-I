"use client";

import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { useAuth } from "@/providers/AuthProvider";
import { useAnalytics } from "@/providers/SettingsProvider";
import { getSupabaseClient } from "@/lib/supabaseClient";

type AdminUserRow = {
  id: string;
  email: string | null;
  role: string | null;
  subscription_mode: string | null;
  country?: string | null;
  is_email_verified?: boolean | null;
  is_deleted?: boolean | null;
  created_at: string | null;
};

type AdminVoucherRow = {
  id: string;
  code: string;
  pro_days: number | null;
  is_active: boolean | null;
  created_at: string | null;
  expires_at: string | null;
};

type AdminUserTimelinePoint = {
  dateKey: string;
  count: number;
};

type PlanSegment = {
  id: string;
  label: string;
  count: number;
  color: string;
  length: number;
  offset: number;
};

type PlanValue = "free" | "starter" | "top";

type PlanToggleProps = {
  value: PlanValue;
  disabled?: boolean;
  onChange: (next: PlanValue) => void;
};

type AdminToast = {
  id: number;
  kind: "success" | "error";
  message: string;
};

const USER_CHART_WIDTH = 320;
const USER_CHART_HEIGHT = 120;
const USER_CHART_PADDING_X = 16;
const USER_CHART_PADDING_Y = 16;
const USER_CHART_MAX_BAR_WIDTH = 28;

export default function AdminPage() {
  const { user, isLoading } = useAuth();
  const { analyticsEnabled, trackEvent } = useAnalytics();
  const [users, setUsers] = useState<AdminUserRow[]>([]);
  const [vouchers, setVouchers] = useState<AdminVoucherRow[]>([]);
  const [unreadInquiries, setUnreadInquiries] = useState<number | null>(null);
  const [isLoadingData, setIsLoadingData] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [newVoucherCode, setNewVoucherCode] = useState("");
  const [newVoucherDays, setNewVoucherDays] = useState("");
  const [newVoucherPlan, setNewVoucherPlan] = useState<"starter" | "top">("starter");
  const [isCreatingVoucher, setIsCreatingVoucher] = useState(false);
  const [isAdmin, setIsAdmin] = useState(false);
  const [hasCheckedAdmin, setHasCheckedAdmin] = useState(false);
  const [isUpdatingPlan, setIsUpdatingPlan] = useState<string | null>(null);
  const [toasts, setToasts] = useState<AdminToast[]>([]);
  const [segmentStyle, setSegmentStyle] = useState<{ left: number; width: number } | null>(
    null,
  );

  const toggleContainerRef = useRef<HTMLDivElement | null>(null);
  const overviewLinkRef = useRef<HTMLAnchorElement | null>(null);
  const inquiriesLinkRef = useRef<HTMLAnchorElement | null>(null);
  const userTimeline: AdminUserTimelinePoint[] = (() => {
    if (users.length === 0) {
      return [];
    }

    const counts = new Map<string, number>();

    for (const entry of users) {
      if (!entry.created_at) {
        continue;
      }

      const parsedDate = new Date(entry.created_at);

      if (Number.isNaN(parsedDate.getTime())) {
        continue;
      }

      const key = parsedDate.toISOString().slice(0, 10);
      const current = counts.get(key) ?? 0;

      counts.set(key, current + 1);
    }

    const keys = Array.from(counts.keys()).sort();

    return keys.map((key) => ({
      dateKey: key,
      count: counts.get(key) ?? 0,
    }));
  })();
  const userTimelineMax = userTimeline.reduce(
    (max, point) => (point.count > max ? point.count : max),
    0,
  );

  const hasUserTimeline = userTimeline.length > 0;
  const userChartInnerWidth = USER_CHART_WIDTH - USER_CHART_PADDING_X * 2;
  const userChartBarWidth = hasUserTimeline
    ? Math.max(
        4,
        Math.min(USER_CHART_MAX_BAR_WIDTH, userChartInnerWidth / userTimeline.length - 4),
      )
    : 0;

  const totalUsers = users.length;
  const proUsers = users.filter((entry) => entry.subscription_mode === "starter").length;
  const topUsers = users.filter((entry) => entry.subscription_mode === "top").length;
  const freeUsers = totalUsers - proUsers - topUsers;
  const adminUsers = users.filter((entry) => (entry.role ?? "user") === "admin").length;
  const verifiedUsers = users.filter((entry) => entry.is_email_verified).length;
  const distinctCountries = (() => {
    const codes = new Set(
      users
        .map((entry) => entry.country)
        .filter((value): value is string => Boolean(value && value !== "Unknown")),
    );

    return codes.size;
  })();

  const PLAN_CHART_RADIUS = 26;
  const PLAN_CHART_STROKE_WIDTH = 10;
  const PLAN_CHART_CIRCUMFERENCE = 2 * Math.PI * PLAN_CHART_RADIUS;

  const planSegments: PlanSegment[] = (() => {
    if (totalUsers === 0) {
      return [];
    }

    const data = [
      { id: "free", label: "Free", count: freeUsers, color: "#e5e7eb" },
      { id: "pro", label: "Pro", count: proUsers, color: "#ef4444" },
      { id: "top", label: "Top tier", count: topUsers, color: "#8b5cf6" },
    ].filter((item) => item.count > 0);

    const total = data.reduce((sum, item) => sum + item.count, 0);

    if (total === 0) {
      return [];
    }

    let currentOffset = 0;

    return data.map((item) => {
      const fraction = item.count / total;
      const length = PLAN_CHART_CIRCUMFERENCE * fraction;
      const segment = {
        id: item.id,
        label: item.label,
        count: item.count,
        color: item.color,
        length,
        offset: currentOffset,
      };

      currentOffset -= length;

      return segment;
    });
  })();

  const activeVouchers = vouchers.filter((voucher) => voucher.is_active).length;
  const inactiveVouchers = vouchers.length - activeVouchers;
  const totalProDays = vouchers.reduce(
    (total, voucher) => total + (voucher.pro_days ?? 0),
    0,
  );
  const averageVoucherDays =
    vouchers.length > 0 ? Math.round(totalProDays / vouchers.length) : 0;
  const voucherDurationBuckets = vouchers.reduce(
    (buckets, voucher) => {
      const days = voucher.pro_days ?? 0;

      if (days <= 30) {
        buckets.short += 1;
      } else if (days <= 90) {
        buckets.medium += 1;
      } else {
        buckets.long += 1;
      }

      return buckets;
    },
    { short: 0, medium: 0, long: 0 },
  );
  const voucherBucketTotal =
    voucherDurationBuckets.short +
    voucherDurationBuckets.medium +
    voucherDurationBuckets.long;

  const showToast = (kind: "success" | "error", message: string) => {
    const id = Date.now() + Math.random();

    setToasts((current) => [...current, { id, kind, message }]);

    setTimeout(() => {
      setToasts((current) => current.filter((toast) => toast.id !== id));
    }, 3000);
  };

  const handleChangeUserPlan = async (
    userId: string,
    nextMode: "free" | "starter" | "top",
  ) => {
    const label =
      nextMode === "top" ? "Top tier" : nextMode === "starter" ? "Pro" : "Free";

    try {
      setIsUpdatingPlan(userId);

      const supabase = getSupabaseClient();
      const { error: updateError } = await supabase
        .from("users")
        .update({ subscription_mode: nextMode })
        .eq("id", userId);

      if (updateError) {
        setError("Unable to update user plan right now.");
        showToast("error", "Unable to update user plan right now.");
        return;
      }

      setUsers((current) =>
        current.map((entry) =>
          entry.id === userId ? { ...entry, subscription_mode: nextMode } : entry,
        ),
      );
    } catch {
      setError("Something went wrong while updating the user plan.");
      showToast("error", "Something went wrong while updating the user plan.");
    } finally {
      setIsUpdatingPlan(null);
    }

    showToast("success", `Plan updated to ${label}.`);
  };

  useEffect(() => {
    if (!analyticsEnabled) {
      return;
    }

    trackEvent("view_admin", { path: "/admin" });
  }, [analyticsEnabled, trackEvent]);

  useEffect(() => {
    if (isLoading) {
      return;
    }

    if (!user) {
      setIsAdmin(false);
      setHasCheckedAdmin(true);
      return;
    }

    const checkRole = async () => {
      try {
        const supabase = getSupabaseClient();
        const { data, error } = await supabase
          .from("users")
          .select("role")
          .eq("id", user.id)
          .maybeSingle();

        if (error) {
          setIsAdmin(false);
          setHasCheckedAdmin(true);
          return;
        }

        setIsAdmin((data?.role as string | null) === "admin");
        setHasCheckedAdmin(true);
      } catch {
        setIsAdmin(false);
        setHasCheckedAdmin(true);
      }
    };

    void checkRole();
  }, [user, isLoading]);

  useEffect(() => {
    if (!isAdmin) {
      return;
    }

    const load = async () => {
      setIsLoadingData(true);
      setError(null);

      try {
        const supabase = getSupabaseClient();

        const { data: userRows, error: usersError } = await supabase
          .from("users")
          .select(
            "id, email, role, subscription_mode, country, is_email_verified, is_deleted, created_at",
          )
          .order("created_at", { ascending: true });

        if (usersError) {
          setError("Unable to load users right now.");
        } else if (userRows) {
          setUsers(userRows as AdminUserRow[]);
        }

        const { data: voucherRows, error: vouchersError } = await supabase
          .from("vouchers")
          .select("id, code, pro_days, is_active, created_at, expires_at")
          .order("created_at", { ascending: false });

        if (vouchersError) {
          setError("Unable to load vouchers right now.");
        } else if (voucherRows) {
          setVouchers(voucherRows as AdminVoucherRow[]);
        }

        const { data: unreadRows, error: unreadError } = await supabase
          .from("inquiries")
          .select("id, is_read")
          .eq("is_read", false);

        if (!unreadError && unreadRows) {
          setUnreadInquiries(unreadRows.length);
        }
      } catch {
        setError("Something went wrong while loading admin data.");
      } finally {
        setIsLoadingData(false);
      }
    };

    void load();
  }, [isAdmin]);

  const handleCreateVoucher = async () => {
    const code = newVoucherCode.trim();
    const trimmedDays = newVoucherDays.trim();

    if (!code) {
      return;
    }

    let days = Number.parseInt(trimmedDays, 10);

    if (!Number.isFinite(days) || days <= 0) {
      days = 30;
    }

    setIsCreatingVoucher(true);
    setError(null);

    try {
      const supabase = getSupabaseClient();

      const { data, error: insertError } = await supabase
        .from("vouchers")
        .insert({
          code,
          pro_days: days,
        })
        .select("id, code, pro_days, created_at")
        .single();

      if (insertError) {
        console.error("Failed to create voucher", insertError.message);
        const codeValue = (insertError as { code?: string }).code;

        if (codeValue === "23505") {
          setError("A voucher with this code already exists. Try a different code.");
        } else {
          setError("Unable to create voucher right now.");
        }

        return;
      }

      if (data) {
        setVouchers((current) => [data as AdminVoucherRow, ...current]);
        setNewVoucherCode("");
        setNewVoucherDays("");
      }
    } catch {
      setError("Something went wrong while creating the voucher.");
    } finally {
      setIsCreatingVoucher(false);
    }
  };

  const isInquiriesActive = false;

  useEffect(() => {
    const container = toggleContainerRef.current;
    const activeLink = isInquiriesActive
      ? inquiriesLinkRef.current
      : overviewLinkRef.current;

    if (!container || !activeLink) {
      return;
    }

    const containerRect = container.getBoundingClientRect();
    const activeRect = activeLink.getBoundingClientRect();

    setSegmentStyle({
      left: activeRect.left - containerRect.left,
      width: activeRect.width,
    });
  }, [isInquiriesActive, unreadInquiries]);

  return (
    <div className="min-h-screen font-sans bg-[var(--background)] text-[var(--foreground)]">
      <Header />
      <main>
        <section className="border-b border-zinc-200 bg-white/80">
          <div className="mx-auto max-w-6xl px-4 py-6 md:px-8 md:py-8">
            <div className="space-y-3">
              <div className="inline-flex items-center gap-2 rounded-full border border-red-100 bg-red-50 px-3 py-1 text-[11px] font-medium text-red-600">
                <span className="h-1.5 w-1.5 rounded-full bg-red-500" />
                Admin
              </div>
              <div className="flex flex-col items-start justify-between gap-3 md:flex-row md:items-end">
                <div className="space-y-1">
                  <h1 className="text-2xl font-semibold tracking-tight text-zinc-900 sm:text-3xl">
                    Admin dashboard
                  </h1>
                  <p className="max-w-2xl text-sm leading-relaxed text-zinc-600">
                    See who is using YOU-I and create vouchers for Pro or Top tiers.
                  </p>
                </div>
                <div
                  ref={toggleContainerRef}
                  className="relative inline-flex items-center rounded-full border border-zinc-200 bg-zinc-50 px-0.5 py-0.5 text-[11px] shadow-xs"
                >
                  {segmentStyle && (
                    <div
                      className="absolute top-0.5 bottom-0.5 rounded-full bg-red-500 shadow-sm transition-all duration-200 ease-out"
                      style={{ left: segmentStyle.left, width: segmentStyle.width }}
                    />
                  )}
                  <Link
                    ref={overviewLinkRef}
                    href="/admin"
                    className={`relative z-10 rounded-full px-3 py-1 text-center font-medium transition-colors duration-200 ${
                      isInquiriesActive
                        ? "text-zinc-600 hover:text-zinc-900"
                        : "text-white"
                    }`}
                  >
                    Overview
                  </Link>
                  <Link
                    ref={inquiriesLinkRef}
                    href="/admin/inquiries"
                    className={`relative z-10 inline-flex items-center justify-center gap-1 rounded-full px-3 py-1 text-center font-medium transition-colors duration-200 ${
                      isInquiriesActive
                        ? "text-white"
                        : "text-zinc-600 hover:text-zinc-900"
                    }`}
                  >
                    <span>Inquiries</span>
                    {unreadInquiries !== null && unreadInquiries > 0 && (
                      <span className="pointer-events-none absolute -top-1 right-4 inline-flex h-2 w-2 rounded-full bg-red-500 shadow-sm" />
                    )}
                  </Link>
                </div>
              </div>
            </div>
          </div>
        </section>
        <section className="bg-[var(--background)]">
          <div className="mx-auto max-w-6xl px-4 pb-12 md:px-8 md:pt-4">
            {!hasCheckedAdmin || isLoading ? null : !isAdmin ? (
              <div className="rounded-2xl border border-dashed border-zinc-200 bg-zinc-50 p-5 text-[11px] text-zinc-600 sm:p-6">
                This page is only available to admin accounts.
              </div>
            ) : (
              <div className="space-y-4">
                <div className="grid gap-4 md:grid-cols-2">
                  <div className="rounded-2xl border border-zinc-200 bg-white p-5 shadow-sm sm:p-6">
                    <div className="mb-4 flex items-center justify-between gap-3">
                      <div className="space-y-1">
                        <p className="text-xs font-medium text-zinc-500">Users</p>
                        <h2 className="text-sm font-semibold text-zinc-900">
                          People in the system
                        </h2>
                        <p className="text-[11px] text-zinc-500">
                          See who has signed up, their role, and which plan they are on.
                        </p>
                      </div>
                      <div className="inline-flex items-center gap-2 rounded-full bg-zinc-50 px-3 py-1 text-[10px] font-medium text-zinc-600">
                        <span className="h-1.5 w-1.5 rounded-full bg-emerald-400" />
                        <span>{totalUsers} total</span>
                      </div>
                    </div>
                    {!isLoadingData && users.length > 0 && (
                      <div className="mb-3 grid gap-2 rounded-xl bg-zinc-50 px-3 py-2 text-[10px] text-zinc-600 sm:grid-cols-3">
                        <div className="flex flex-col gap-0.5">
                          <span className="text-[10px] text-zinc-400">Admin seats</span>
                          <span className="text-xs font-semibold text-zinc-800">
                            {adminUsers}
                          </span>
                        </div>
                        <div className="flex flex-col gap-0.5">
                          <span className="text-[10px] text-zinc-400">Verified accounts</span>
                          <span className="text-xs font-semibold text-emerald-600">
                            {verifiedUsers}/{totalUsers}
                          </span>
                        </div>
                        <div className="flex flex-col gap-0.5">
                          <span className="text-[10px] text-zinc-400">Countries</span>
                          <span className="text-xs font-semibold text-zinc-800">
                            {distinctCountries}
                          </span>
                        </div>
                      </div>
                    )}
                    {isLoadingData && (
                      <p className="text-[11px] text-zinc-500">Loading users…</p>
                    )}
                    {!isLoadingData && users.length === 0 && (
                      <p className="text-[11px] text-zinc-500">No users found yet.</p>
                    )}
                    {!isLoadingData && users.length > 0 && (
                      <div className="mt-3 space-y-3">
                        {users.map((entry) => {
                          const isAdminUser = (entry.role ?? "user") === "admin";
                          const planLabel =
                            entry.subscription_mode === "top"
                              ? "Top tier"
                              : entry.subscription_mode === "starter"
                              ? "Pro"
                              : "Free";
                          const countryLabel = entry.country || "Unknown";
                          const isVerified = Boolean(entry.is_email_verified);
                          const isDeleted = Boolean(entry.is_deleted);

                          return (
                            <div
                              key={entry.id}
                              className={`flex flex-col gap-2 rounded-xl border px-3 py-2 text-[11px] sm:flex-row sm:items-center sm:justify-between ${
                                isDeleted
                                  ? "border-red-100 bg-red-50"
                                  : "border-zinc-200 bg-zinc-50"
                              }`}
                            >
                              <div className="min-w-0 flex-1">
                                <div className="flex flex-wrap items-center gap-2">
                                  <p className="truncate font-medium text-zinc-900">
                                    {entry.email ?? "Unknown"}
                                  </p>
                                  <span
                                    className={`inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[9px] font-medium ${
                                      isAdminUser
                                        ? "bg-zinc-900 text-zinc-50"
                                        : "bg-zinc-100 text-zinc-700"
                                    }`}
                                  >
                                    <span className="h-1.5 w-1.5 rounded-full bg-emerald-400" />
                                    <span>{isAdminUser ? "Admin" : "User"}</span>
                                  </span>
                                  <span
                                    className={`inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[9px] font-medium ${
                                      isVerified
                                        ? "bg-emerald-50 text-emerald-700"
                                        : "bg-amber-50 text-amber-700"
                                    }`}
                                  >
                                    <span className="h-1.5 w-1.5 rounded-full bg-current" />
                                    <span>{isVerified ? "Verified email" : "Unverified"}</span>
                                  </span>
                                  {isDeleted && (
                                    <span className="inline-flex items-center gap-1 rounded-full bg-red-600 px-2 py-0.5 text-[9px] font-semibold text-white">
                                      <span className="h-1.5 w-1.5 rounded-full bg-white" />
                                      <span>Deleted</span>
                                    </span>
                                  )}
                                </div>
                                <div className="mt-1 flex flex-wrap items-center gap-2 text-[10px] text-zinc-500">
                                  <span className="inline-flex items-center gap-1 rounded-full bg-zinc-100 px-2 py-0.5">
                                    <span className="text-zinc-400">Plan</span>
                                    <span className="font-medium text-zinc-800">
                                      {planLabel}
                                    </span>
                                  </span>
                                  <span className="inline-flex items-center gap-1 rounded-full bg-zinc-100 px-2 py-0.5">
                                    <span className="text-zinc-400">Country</span>
                                    <span className="font-medium text-zinc-800">
                                      {countryLabel}
                                    </span>
                                  </span>
                                </div>
                              </div>
                              <div className="flex flex-col items-end gap-1">
                                {entry.created_at && (
                                  <p className="text-[9px] text-zinc-400">
                                    Joined {new Date(entry.created_at).toLocaleDateString()}
                                  </p>
                                )}
                                <div className="inline-flex items-center gap-1">
                                  <span className="text-[9px] text-zinc-500">Change plan</span>
                                  <PlanToggle
                                    value={
                                      (entry.subscription_mode as PlanValue | null) ?? "free"
                                    }
                                    disabled={isUpdatingPlan === entry.id}
                                    onChange={(next) => handleChangeUserPlan(entry.id, next)}
                                  />
                                </div>
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    )}
                  </div>
                  <div className="rounded-2xl border border-zinc-200 bg-white p-5 shadow-sm sm:p-6">
                    <div className="mb-4 space-y-1">
                      <p className="text-xs font-medium text-zinc-500">Vouchers</p>
                      <h2 className="text-sm font-semibold text-zinc-900">
                        Create a voucher
                      </h2>
                      <p className="text-[11px] text-zinc-500">
                        Generate a code that unlocks a Pro or Top tier for a set number of
                        days.
                      </p>
                    </div>
                    <div className="space-y-3">
                      <div className="space-y-1">
                        <p className="text-[11px] font-medium text-zinc-600">Code</p>
                        <input
                          type="text"
                          value={newVoucherCode}
                          onChange={(event) => setNewVoucherCode(event.target.value)}
                          className="w-full rounded-md border border-zinc-200 bg-white px-3 py-2 text-sm text-zinc-900 outline-none ring-0 placeholder:text-zinc-400 focus:border-red-400 focus:ring-1 focus:ring-red-200"
                          placeholder="E.g. LAUNCH-2025"
                        />
                      </div>
                      <div className="grid gap-3 sm:grid-cols-2">
                        <div className="space-y-1">
                          <p className="text-[11px] font-medium text-zinc-600">
                            Duration (days)
                          </p>
                          <input
                            type="number"
                            min={1}
                            value={newVoucherDays}
                            onChange={(event) => setNewVoucherDays(event.target.value)}
                            className="w-full rounded-md border border-zinc-200 bg-white px-3 py-2 text-sm text-zinc-900 outline-none ring-0 placeholder:text-zinc-400 focus:border-red-400 focus:ring-1 focus:ring-red-200"
                            placeholder="30 (defaults to 30 days)"
                          />
                        </div>
                        <div className="space-y-1">
                          <p className="text-[11px] font-medium text-zinc-600">Plan</p>
                          <select
                            value={newVoucherPlan}
                            onChange={(event) =>
                              setNewVoucherPlan(event.target.value as "starter" | "top")
                            }
                            className="w-full rounded-md border border-zinc-200 bg-white px-3 py-2 text-sm text-zinc-900 outline-none ring-0 focus:border-red-400 focus:ring-1 focus:ring-red-200"
                          >
                            <option value="starter">Pro</option>
                            <option value="top">Top tier</option>
                          </select>
                        </div>
                      </div>
                      <div className="flex items-center justify-end">
                        <button
                          type="button"
                          disabled={isCreatingVoucher}
                          onClick={handleCreateVoucher}
                          className="inline-flex items-center justify-center rounded-full bg-red-500 px-4 py-1.5 text-[11px] font-semibold text-white shadow-sm transition-transform hover:-translate-y-0.5 hover:bg-red-600 disabled:opacity-60"
                        >
                          {isCreatingVoucher ? "Creating…" : "Create voucher"}
                        </button>
                      </div>
                    </div>
                    {error && (
                      <p className="mt-3 text-[10px] text-red-600">
                        {error}
                      </p>
                    )}
                  </div>
                </div>

                <div className="grid gap-4 md:grid-cols-3">
                  <div className="rounded-2xl border border-zinc-200 bg-white p-5 shadow-sm sm:p-6 md:col-span-2">
                    <div className="flex items-center justify-between gap-3">
                      <div className="space-y-1">
                        <p className="text-xs font-medium text-zinc-500">Activity</p>
                        <h2 className="text-sm font-semibold text-zinc-900">
                          Signups over time
                        </h2>
                        <p className="text-[11px] text-zinc-500">
                          Based on when people first appeared in the system.
                        </p>
                      </div>
                      <div className="rounded-full bg-zinc-50 px-3 py-1 text-[10px] font-medium text-zinc-600">
                        {hasUserTimeline ? `${userTimeline.length} days` : "No data yet"}
                      </div>
                    </div>
                    {!hasUserTimeline && (
                      <p className="mt-4 text-[11px] text-zinc-500">
                        Once people start signing up, their activity will appear here.
                      </p>
                    )}
                    {hasUserTimeline && (
                      <div className="mt-4 overflow-hidden rounded-xl border border-zinc-100 bg-gradient-to-b from-zinc-50 to-zinc-100 px-3 py-3">
                        <svg
                          width={USER_CHART_WIDTH}
                          height={USER_CHART_HEIGHT}
                          viewBox={`0 0 ${USER_CHART_WIDTH} ${USER_CHART_HEIGHT}`}
                        >
                          <defs>
                            <linearGradient id="user-bar-fill" x1="0" y1="0" x2="0" y2="1">
                              <stop offset="0%" stopColor="#fb7185" />
                              <stop offset="100%" stopColor="#ef4444" />
                            </linearGradient>
                          </defs>
                          <line
                            x1={USER_CHART_PADDING_X}
                            y1={USER_CHART_HEIGHT - USER_CHART_PADDING_Y}
                            x2={USER_CHART_WIDTH - USER_CHART_PADDING_X}
                            y2={USER_CHART_HEIGHT - USER_CHART_PADDING_Y}
                            stroke="#e5e7eb"
                            strokeWidth={1}
                          />
                          {userTimeline.map((point, index) => {
                            const max = userTimelineMax || 1;
                            const barMaxHeight =
                              USER_CHART_HEIGHT - USER_CHART_PADDING_Y * 2;
                            const height =
                              max === 0 ? 0 : (point.count / max) * barMaxHeight;
                            const x =
                              USER_CHART_PADDING_X +
                              index * (userChartBarWidth + 2);
                            const y =
                              USER_CHART_HEIGHT -
                              USER_CHART_PADDING_Y -
                              height;

                            return (
                              <g key={point.dateKey}>
                                <rect
                                  x={x}
                                  y={y}
                                  width={userChartBarWidth}
                                  height={height}
                                  fill="url(#user-bar-fill)"
                                  rx={3}
                                />
                                <text
                                  x={x + userChartBarWidth / 2}
                                  y={USER_CHART_HEIGHT - 2}
                                  fontSize={8}
                                  textAnchor="middle"
                                  fill="#6b7280"
                                >
                                  {point.dateKey.slice(5)}
                                </text>
                              </g>
                            );
                          })}
                        </svg>
                      </div>
                    )}
                  </div>
                  <div className="rounded-2xl border border-zinc-200 bg-white p-5 shadow-sm sm:p-6">
                    <div className="mb-3 space-y-1">
                      <p className="text-xs font-medium text-zinc-500">Plans and vouchers</p>
                      <h2 className="text-sm font-semibold text-zinc-900">
                        Current mix
                      </h2>
                    </div>
                    <div className="flex items-center gap-4">
                      <div className="flex h-28 w-28 items-center justify-center">
                        {planSegments.length === 0 ? (
                          <div className="flex h-24 w-24 items-center justify-center rounded-full border border-dashed border-zinc-200 text-[10px] text-zinc-500">
                            No data
                          </div>
                        ) : (
                          <svg
                            width="96"
                            height="96"
                            viewBox="0 0 96 96"
                          >
                            <circle
                              cx="48"
                              cy="48"
                              r={PLAN_CHART_RADIUS}
                              stroke="#e5e7eb"
                              strokeWidth={PLAN_CHART_STROKE_WIDTH}
                              fill="none"
                            />
                            {planSegments.map((segment) => (
                              <circle
                                key={segment.id}
                                cx="48"
                                cy="48"
                                r={PLAN_CHART_RADIUS}
                                stroke={segment.color}
                                strokeWidth={PLAN_CHART_STROKE_WIDTH}
                                strokeDasharray={`${segment.length} ${PLAN_CHART_CIRCUMFERENCE}`}
                                strokeDashoffset={segment.offset}
                                strokeLinecap="round"
                                fill="none"
                              />
                            ))}
                          </svg>
                        )}
                      </div>
                      <div className="flex-1 space-y-2">
                        <div className="flex items-center justify-between text-[11px]">
                          <span className="text-zinc-500">Free</span>
                          <span className="font-medium text-zinc-800">{freeUsers}</span>
                        </div>
                        <div className="flex items-center justify-between text-[11px]">
                          <span className="text-zinc-500">Pro</span>
                          <span className="font-medium text-zinc-800">{proUsers}</span>
                        </div>
                        <div className="flex items-center justify-between text-[11px]">
                          <span className="text-zinc-500">Top tier</span>
                          <span className="font-medium text-zinc-800">{topUsers}</span>
                        </div>
                        <div className="mt-2 grid grid-cols-2 gap-2 text-[10px]">
                          <div className="rounded-lg border border-zinc-100 bg-zinc-50 px-2 py-1.5">
                            <p className="text-[10px] font-medium text-zinc-600">
                              Active vouchers
                            </p>
                            <p className="text-xs font-semibold text-zinc-900">
                              {activeVouchers}
                            </p>
                          </div>
                          <div className="rounded-lg border border-zinc-100 bg-zinc-50 px-2 py-1.5">
                            <p className="text-[10px] font-medium text-zinc-600">
                              Inactive
                            </p>
                            <p className="text-xs font-semibold text-zinc-900">
                              {inactiveVouchers}
                            </p>
                          </div>
                          <div className="rounded-lg border border-zinc-100 bg-zinc-50 px-2 py-1.5">
                            <p className="text-[10px] font-medium text-zinc-600">
                              Avg days
                            </p>
                            <p className="text-xs font-semibold text-zinc-900">
                              {averageVoucherDays}
                            </p>
                          </div>
                          <div className="rounded-lg border border-zinc-100 bg-zinc-50 px-2 py-1.5">
                            <p className="text-[10px] font-medium text-zinc-600">
                              Duration mix
                            </p>
                            <p className="text-[10px] text-zinc-700">
                              {voucherBucketTotal === 0
                                ? "No vouchers"
                                : `${voucherDurationBuckets.short}/${voucherDurationBuckets.medium}/${voucherDurationBuckets.long}`}
                            </p>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="rounded-2xl border border-zinc-200 bg-white p-5 shadow-sm sm:p-6">
                  <div className="mb-3 space-y-1">
                    <p className="text-xs font-medium text-zinc-500">Existing vouchers</p>
                    <p className="text-[11px] text-zinc-500">
                      Recently created vouchers appear here with their status and duration.
                    </p>
                  </div>
                  {vouchers.length === 0 && (
                    <p className="text-[11px] text-zinc-500">No vouchers created yet.</p>
                  )}
                  {vouchers.length > 0 && (
                    <div className="space-y-2">
                      {vouchers.map((voucher) => (
                        <div
                          key={voucher.id}
                          className="flex items-center justify-between gap-3 rounded-lg border border-zinc-200 bg-zinc-50 px-3 py-2 text-[11px]"
                        >
                          <div className="min-w-0 flex-1">
                            <p className="truncate font-medium text-zinc-900">
                              {voucher.code}
                            </p>
                            <p className="mt-0.5 text-[10px] text-zinc-500">
                              {voucher.pro_days ?? 0} days ·{" "}
                              {voucher.is_active ? "Active" : "Inactive"}
                            </p>
                          </div>
                          {voucher.created_at && (
                            <p className="text-[9px] text-zinc-400">
                              {new Date(voucher.created_at).toLocaleDateString()}
                            </p>
                          )}
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>
        </section>
      </main>
      {toasts.length > 0 && (
        <div className="pointer-events-none fixed bottom-4 right-4 z-50 space-y-2">
          {toasts.map((toast) => (
            <div
              key={toast.id}
              className={`pointer-events-auto flex items-start gap-2 rounded-lg border px-3 py-2 text-[11px] shadow-md ${
                toast.kind === "success"
                  ? "border-emerald-200 bg-emerald-50 text-emerald-800"
                  : "border-red-200 bg-red-50 text-red-700"
              }`}
            >
              <span className="mt-1 h-1.5 w-1.5 rounded-full bg-current" />
              <p className="leading-snug">{toast.message}</p>
            </div>
          ))}
        </div>
      )}
      <Footer />
    </div>
  );
}

function PlanToggle({ value, disabled, onChange }: PlanToggleProps) {
  const containerRef = useRef<HTMLDivElement | null>(null);
  const freeRef = useRef<HTMLButtonElement | null>(null);
  const starterRef = useRef<HTMLButtonElement | null>(null);
  const topRef = useRef<HTMLButtonElement | null>(null);
  const [pillStyle, setPillStyle] = useState<{ left: number; width: number } | null>(null);

  useEffect(() => {
    const container = containerRef.current;
    const activeButton =
      value === "starter" ? starterRef.current : value === "top" ? topRef.current : freeRef.current;

    if (!container || !activeButton) {
      return;
    }

    const containerRect = container.getBoundingClientRect();
    const activeRect = activeButton.getBoundingClientRect();

    setPillStyle({
      left: activeRect.left - containerRect.left,
      width: activeRect.width,
    });
  }, [value]);

  const handleClick = (next: PlanValue) => {
    if (disabled || next === value) {
      return;
    }

    onChange(next);
  };

  return (
    <div
      ref={containerRef}
      className={`relative inline-flex items-center rounded-full bg-zinc-100 p-0.5 text-[9px] font-medium ${
        disabled ? "opacity-60" : ""
      }`}
    >
      <span
        className={`absolute inset-y-0 my-0.5 rounded-full bg-red-500 shadow-sm transition-all duration-200 ${
          pillStyle ? "opacity-100" : "opacity-0"
        }`}
        style={pillStyle ? { left: pillStyle.left, width: pillStyle.width } : undefined}
      />
      <button
        type="button"
        ref={freeRef}
        disabled={disabled}
        onClick={() => handleClick("free")}
        className={`relative z-10 rounded-full px-2 py-0.5 transition-colors duration-150 ${
          value === "free" ? "text-white" : "text-zinc-600 hover:text-zinc-900"
        }`}
      >
        Free
      </button>
      <button
        type="button"
        ref={starterRef}
        disabled={disabled}
        onClick={() => handleClick("starter")}
        className={`relative z-10 rounded-full px-2 py-0.5 transition-colors duration-150 ${
          value === "starter" ? "text-white" : "text-zinc-600 hover:text-zinc-900"
        }`}
      >
        Pro
      </button>
      <button
        type="button"
        ref={topRef}
        disabled={disabled}
        onClick={() => handleClick("top")}
        className={`relative z-10 rounded-full px-2 py-0.5 transition-colors duration-150 ${
          value === "top" ? "text-white" : "text-zinc-600 hover:text-zinc-900"
        }`}
      >
        Top
      </button>
    </div>
  );
}
