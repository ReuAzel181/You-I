"use client";

import { useEffect, useState } from "react";
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

type AdminToast = {
  id: number;
  kind: "success" | "error";
  message: string;
};

const USER_CHART_WIDTH = 260;
const USER_CHART_HEIGHT = 80;
const USER_CHART_PADDING_X = 12;
const USER_CHART_PADDING_Y = 8;

export default function AdminPage() {
  const { user, isLoading } = useAuth();
  const { analyticsEnabled, trackEvent } = useAnalytics();
  const [users, setUsers] = useState<AdminUserRow[]>([]);
  const [vouchers, setVouchers] = useState<AdminVoucherRow[]>([]);
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

  const totalUsers = users.length;
  const proUsers = users.filter((entry) => entry.subscription_mode === "starter").length;
  const topUsers = users.filter((entry) => entry.subscription_mode === "top").length;
  const freeUsers = totalUsers - proUsers - topUsers;

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
          .select("id, email, role, subscription_mode, created_at")
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

  return (
    <div className="min-h-screen font-sans bg-[var(--background)] text-[var(--foreground)]">
      <Header />
      <main>
        <section className="border-b border-zinc-200 bg-white/80">
          <div className="mx-auto flex max-w-6xl items-center justify-between px-4 py-6 md:px-8 md:py-8">
            <div className="space-y-2">
              <div className="inline-flex items-center gap-2 rounded-full border border-red-100 bg-red-50 px-3 py-1 text-[11px] font-medium text-red-600">
                <span className="h-1.5 w-1.5 rounded-full bg-red-500" />
                Admin
              </div>
              <h1 className="text-2xl font-semibold tracking-tight text-zinc-900 sm:text-3xl">
                Admin dashboard
              </h1>
              <p className="max-w-2xl text-sm leading-relaxed text-zinc-600">
                See who is using YOU-I and create vouchers for Pro or Top tiers.
              </p>
            </div>
          </div>
        </section>
        <section className="bg-[var(--background)]">
          <div className="mx-auto max-w-6xl px-4 pb-12 md:px-8 md:pt-4">
            {hasCheckedAdmin && !isAdmin && !isLoading && (
              <div className="rounded-2xl border border-dashed border-zinc-200 bg-zinc-50 p-5 text-[11px] text-zinc-600 sm:p-6">
                This page is only available to admin accounts.
              </div>
            )}
            {isAdmin && (
              <div className="grid gap-4 md:grid-cols-2">
                <div className="space-y-4">
                  <div className="rounded-2xl border border-zinc-200 bg-white p-5 shadow-sm sm:p-6">
                    <div className="mb-4 flex items-center justify-between gap-3">
                      <div className="space-y-1">
                        <p className="text-xs font-medium text-zinc-500">Users</p>
                        <h2 className="text-sm font-semibold text-zinc-900">People in the system</h2>
                        <p className="text-[11px] text-zinc-500">
                          See who has signed up, their role, and which plan they are on.
                        </p>
                      </div>
                      <div className="inline-flex items-center gap-2 rounded-full bg-zinc-50 px-3 py-1 text-[10px] font-medium text-zinc-600">
                        <span className="h-1.5 w-1.5 rounded-full bg-emerald-400" />
                        <span>{totalUsers} total</span>
                      </div>
                    </div>
                    {isLoadingData && (
                      <p className="text-[11px] text-zinc-500">Loading users…</p>
                    )}
                    {!isLoadingData && users.length === 0 && (
                      <p className="text-[11px] text-zinc-500">No users found yet.</p>
                    )}
                    {!isLoadingData && users.length > 0 && (
                      <div className="mt-2 space-y-1">
                        {users.map((entry) => {
                          return (
                            <div
                              key={entry.id}
                              className="flex items-center justify-between gap-3 rounded-lg border border-zinc-200 bg-zinc-50 px-3 py-2 text-[11px]"
                            >
                              <div className="min-w-0 flex-1">
                                <p className="truncate font-medium text-zinc-900">
                                  {entry.email ?? "Unknown"}
                                </p>
                                <p className="mt-0.5 text-[10px] text-zinc-500">
                                  Role:{" "}
                                  <span className="font-medium">
                                    {(entry.role ?? "user") === "admin" ? "Admin" : "User"}
                                  </span>
                                </p>
                                <div className="mt-0.5 flex flex-wrap items-center gap-2 text-[10px] text-zinc-500">
                                  <span>Plan:</span>
                                  <span
                                    className={`inline-flex items-center rounded-full border px-2 py-0.5 text-[9px] font-medium ${
                                      entry.subscription_mode === "top"
                                        ? "border-violet-200 bg-violet-50 text-violet-700"
                                        : entry.subscription_mode === "starter"
                                        ? "border-red-200 bg-red-50 text-red-600"
                                        : "border-zinc-200 bg-zinc-50 text-zinc-700"
                                    }`}
                                  >
                                    {entry.subscription_mode === "top"
                                      ? "Top tier"
                                      : entry.subscription_mode === "starter"
                                      ? "Pro"
                                      : "Free"}
                                  </span>
                                  <div className="inline-flex items-center gap-1 rounded-full border border-zinc-200 bg-white px-2 py-0.5">
                                    <span className="text-[9px] text-zinc-500">Change to</span>
                                    <button
                                      type="button"
                                      disabled={isUpdatingPlan === entry.id}
                                      onClick={() => handleChangeUserPlan(entry.id, "free")}
                                      className="rounded-full px-2 py-0.5 text-[9px] font-medium text-zinc-600 hover:bg-zinc-100 disabled:opacity-60"
                                    >
                                      Free
                                    </button>
                                    <button
                                      type="button"
                                      disabled={isUpdatingPlan === entry.id}
                                      onClick={() => handleChangeUserPlan(entry.id, "starter")}
                                      className="rounded-full px-2 py-0.5 text-[9px] font-medium text-zinc-600 hover:bg-zinc-100 disabled:opacity-60"
                                    >
                                      Pro
                                    </button>
                                    <button
                                      type="button"
                                      disabled={isUpdatingPlan === entry.id}
                                      onClick={() => handleChangeUserPlan(entry.id, "top")}
                                      className="rounded-full px-2 py-0.5 text-[9px] font-medium text-zinc-600 hover:bg-zinc-100 disabled:opacity-60"
                                    >
                                      Top
                                    </button>
                                  </div>
                                </div>
                              </div>
                              <div className="flex flex-col items-end gap-1">
                                {entry.created_at && (
                                  <p className="text-[9px] text-zinc-400">
                                    Joined {new Date(entry.created_at).toLocaleDateString()}
                                  </p>
                                )}
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    )}
                  </div>
                  <div className="rounded-2xl border border-zinc-200 bg-white p-5 shadow-sm sm:p-6">
                    <div className="mb-3 flex items-start justify-between gap-3">
                      <div className="space-y-1">
                        <p className="text-xs font-medium text-zinc-500">Analytics</p>
                        <h2 className="text-sm font-semibold text-zinc-900">Overview</h2>
                        <p className="text-[11px] text-zinc-500">
                          High-level numbers and trends to understand how people are using YOU-I.
                        </p>
                      </div>
                      <div className="hidden items-center gap-2 rounded-full bg-zinc-50 px-3 py-1 text-[10px] font-medium text-zinc-600 sm:inline-flex">
                        <span className="h-1.5 w-1.5 rounded-full bg-red-400" />
                        <span>{proUsers + topUsers} paid</span>
                      </div>
                    </div>
                    <div className="grid gap-3 sm:grid-cols-4">
                      <div className="rounded-lg border border-zinc-100 bg-zinc-50 px-3 py-2">
                        <p className="text-[10px] font-medium uppercase tracking-wide text-zinc-500">
                          Free users
                        </p>
                        <p className="mt-1 text-xl font-semibold text-zinc-900">
                          {freeUsers}
                        </p>
                      </div>
                      <div className="rounded-lg border border-red-100 bg-red-50 px-3 py-2">
                        <p className="text-[10px] font-medium uppercase tracking-wide text-red-500">
                          Pro users
                        </p>
                        <p className="mt-1 text-xl font-semibold text-red-600">
                          {proUsers}
                        </p>
                      </div>
                      <div className="rounded-lg border border-violet-100 bg-violet-50 px-3 py-2">
                        <p className="text-[10px] font-medium uppercase tracking-wide text-violet-600">
                          Top tier users
                        </p>
                        <p className="mt-1 text-xl font-semibold text-violet-700">
                          {topUsers}
                        </p>
                      </div>
                      <div className="rounded-lg border border-zinc-100 bg-zinc-50 px-3 py-2">
                        <p className="text-[10px] font-medium uppercase tracking-wide text-zinc-500">
                          Total users
                        </p>
                        <p className="mt-1 text-xl font-semibold text-zinc-900">
                          {totalUsers}
                        </p>
                      </div>
                    </div>
                    <div className="mt-3 grid gap-3 sm:grid-cols-3">
                      <div className="rounded-lg border border-zinc-100 bg-zinc-50 px-3 py-2">
                        <p className="text-[10px] font-medium uppercase tracking-wide text-zinc-500">
                          Vouchers created
                        </p>
                        <p className="mt-1 text-xl font-semibold text-zinc-900">
                          {vouchers.length}
                        </p>
                      </div>
                      <div className="rounded-lg border border-zinc-100 bg-zinc-50 px-3 py-2">
                        <p className="text-[10px] font-medium uppercase tracking-wide text-zinc-500">
                          Active vouchers
                        </p>
                        <p className="mt-1 text-xl font-semibold text-zinc-900">
                          {activeVouchers}
                        </p>
                      </div>
                      <div className="rounded-lg border border-zinc-100 bg-zinc-50 px-3 py-2">
                        <p className="text-[10px] font-medium uppercase tracking-wide text-zinc-500">
                          Total Pro days
                        </p>
                        <p className="mt-1 text-xl font-semibold text-zinc-900">
                          {totalProDays}
                        </p>
                      </div>
                    </div>
                    {vouchers.length > 0 && (
                      <div className="mt-3 grid gap-3 sm:grid-cols-2">
                        <div>
                          <p className="mb-1 text-[10px] font-medium uppercase tracking-wide text-zinc-500">
                            Vouchers by status
                          </p>
                          <div className="space-y-1 text-[11px]">
                            <div className="flex h-2 overflow-hidden rounded-full bg-zinc-100">
                              <div
                                className="bg-emerald-500"
                                style={{
                                  width: `${Math.max(
                                    0,
                                    Math.min(
                                      100,
                                      (activeVouchers / vouchers.length) * 100,
                                    ),
                                  ).toFixed(1)}%`,
                                }}
                              />
                            </div>
                            <div className="flex justify-between text-[10px] text-zinc-500">
                              <span>{activeVouchers} active</span>
                              <span>{inactiveVouchers} inactive</span>
                            </div>
                          </div>
                        </div>
                        {voucherBucketTotal > 0 && (
                          <div>
                            <p className="mb-1 text-[10px] font-medium uppercase tracking-wide text-zinc-500">
                              Voucher length mix
                            </p>
                            <div className="flex h-16 items-end gap-2">
                              <div className="flex-1">
                                <div
                                  className="w-full rounded-t-md bg-zinc-200"
                                  style={{
                                    height: `${Math.max(
                                      8,
                                      (voucherDurationBuckets.short / voucherBucketTotal) *
                                        56,
                                    )}px`,
                                  }}
                                />
                                <p className="mt-1 text-center text-[9px] text-zinc-500">
                                  ≤30d
                                </p>
                              </div>
                              <div className="flex-1">
                                <div
                                  className="w-full rounded-t-md bg-zinc-300"
                                  style={{
                                    height: `${Math.max(
                                      8,
                                      (voucherDurationBuckets.medium / voucherBucketTotal) *
                                        56,
                                    )}px`,
                                  }}
                                />
                                <p className="mt-1 text-center text-[9px] text-zinc-500">
                                  31–90d
                                </p>
                              </div>
                              <div className="flex-1">
                                <div
                                  className="w-full rounded-t-md bg-zinc-400"
                                  style={{
                                    height: `${Math.max(
                                      8,
                                      (voucherDurationBuckets.long / voucherBucketTotal) *
                                        56,
                                    )}px`,
                                  }}
                                />
                                <p className="mt-1 text-center text-[9px] text-zinc-500">
                                  90d+
                                </p>
                              </div>
                            </div>
                            <p className="mt-1 text-[10px] text-zinc-500">
                              Avg length {averageVoucherDays} days
                            </p>
                          </div>
                        )}
                      </div>
                    )}
                    {(planSegments.length > 0 ||
                      (userTimeline.length > 0 && userTimelineMax > 0)) && (
                      <div className="mt-4 grid gap-4 sm:grid-cols-[minmax(0,1.2fr)_minmax(0,1fr)]">
                        {planSegments.length > 0 && (
                          <div>
                            <p className="mb-1 text-[10px] font-medium uppercase tracking-wide text-zinc-500">
                              Users by plan
                            </p>
                            <div className="flex items-center gap-4">
                              <svg
                                width={120}
                                height={120}
                                viewBox="0 0 120 120"
                                className="h-24 w-24"
                              >
                                <circle cx={60} cy={60} r={PLAN_CHART_RADIUS} fill="white" />
                                {planSegments.map((segment) => (
                                  <circle
                                    key={segment.id}
                                    cx={60}
                                    cy={60}
                                    r={PLAN_CHART_RADIUS}
                                    fill="transparent"
                                    stroke={segment.color}
                                    strokeWidth={PLAN_CHART_STROKE_WIDTH}
                                    strokeDasharray={`${segment.length} ${
                                      PLAN_CHART_CIRCUMFERENCE - segment.length
                                    }`}
                                    strokeDashoffset={segment.offset}
                                    strokeLinecap="round"
                                    transform="rotate(-90 60 60)"
                                  />
                                ))}
                              </svg>
                              <div className="space-y-1 text-[11px]">
                                {planSegments.map((segment) => (
                                  <div key={segment.id} className="flex items-center gap-2">
                                    <span
                                      className="h-2 w-2 rounded-full"
                                      style={{ backgroundColor: segment.color }}
                                    />
                                    <span className="text-zinc-700">{segment.label}</span>
                                    <span className="text-zinc-400">
                                      · {segment.count} (
                                      {Math.round((segment.count / totalUsers) * 100)}%)
                                    </span>
                                  </div>
                                ))}
                              </div>
                            </div>
                          </div>
                        )}
                        {userTimeline.length > 0 && userTimelineMax > 0 && (
                          <div>
                            <p className="mb-1 text-[10px] font-medium uppercase tracking-wide text-zinc-500">
                              New users over time
                            </p>
                            <svg
                              width={USER_CHART_WIDTH}
                              height={USER_CHART_HEIGHT}
                              className="w-full max-w-xs"
                            >
                              <rect
                                x={0}
                                y={0}
                                width={USER_CHART_WIDTH}
                                height={USER_CHART_HEIGHT}
                                fill="white"
                              />
                              {userTimeline.map((point, index) => {
                                const innerWidth = USER_CHART_WIDTH - USER_CHART_PADDING_X * 2;
                                const innerHeight =
                                  USER_CHART_HEIGHT - USER_CHART_PADDING_Y * 2 - 12;
                                const segmentWidth =
                                  userTimeline.length > 0 ? innerWidth / userTimeline.length : 0;
                                const barWidth = Math.max(6, Math.floor(segmentWidth) - 4);
                                const x =
                                  USER_CHART_PADDING_X +
                                  index * segmentWidth +
                                  (segmentWidth - barWidth) / 2;
                                const ratio =
                                  userTimelineMax > 0 ? point.count / userTimelineMax : 0;
                                const barHeight = innerHeight * ratio;
                                const y = USER_CHART_PADDING_Y + innerHeight - barHeight;

                                return (
                                  <g key={point.dateKey}>
                                    <rect
                                      x={x}
                                      y={y}
                                      width={barWidth}
                                      height={barHeight}
                                      fill="#ef4444"
                                      rx={2}
                                    />
                                    <text
                                      x={x + barWidth / 2}
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
                    )}
                  </div>
                </div>
                <div className="space-y-4">
                  <div className="rounded-2xl border border-zinc-200 bg-white p-5 shadow-sm sm:p-6">
                    <div className="mb-4 space-y-1">
                      <p className="text-xs font-medium text-zinc-500">Vouchers</p>
                      <h2 className="text-sm font-semibold text-zinc-900">
                        Create a voucher
                      </h2>
                      <p className="text-[11px] text-zinc-500">
                        Generate a code that unlocks a Pro or Top tier for a set number of days.
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
                          <p className="text-[11px] font-medium text-zinc-600">Duration (days)</p>
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
