"use client";

import Image from "next/image";
import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { useAuth } from "@/providers/AuthProvider";
import { useAnalytics, useSettings } from "@/providers/SettingsProvider";
import { getSupabaseClient } from "@/lib/supabaseClient";

type AnalyticsEntry = {
  name: string;
  properties: Record<string, unknown>;
  timestamp: string;
};

type TimelinePoint = {
  dateKey: string;
  label: string;
  count: number;
};

type AnalyticsCategory =
  | "tools"
  | "workspace"
  | "settings"
  | "marketing"
  | "analytics"
  | "other";

type CategorySummaryItem = {
  id: AnalyticsCategory;
  label: string;
  count: number;
  color: string;
};

type ToolSummaryItem = {
  id: string;
  label: string;
  count: number;
};

type ToolTimelineSeries = {
  id: string;
  label: string;
  color: string;
  points: TimelinePoint[];
};

const TOOL_CHART_WIDTH = 320;
const TOOL_CHART_HEIGHT = 160;
const TOOL_CHART_PADDING_X = 8;
const TOOL_CHART_PADDING_Y = 8;
const TOOL_CHART_Y_AXIS_LABEL_WIDTH = 34;
const TOOL_CHART_GRID_FRACTIONS = [0.2, 0.4, 0.6, 0.8];
const TOOL_CHART_MAX_VALUE = 100;

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
    profileEmail,
    profileUsername,
    profileBio,
    profileStatus,
    profileCountry,
    profileBannerColor,
    subscriptionMode,
    focusMode,
    setProfileUsername,
    setProfileBio,
    setProfileBannerColor,
    setFocusMode,
    lastUsernameChangedAt,
    setLastUsernameChangedAt,
  } = useSettings();
  const [nudgeInput, setNudgeInput] = useState(String(nudgeAmount || 8));
  const [profileUsernameDraft, setProfileUsernameDraft] = useState(profileUsername || "");
  const [profileBioDraft, setProfileBioDraft] = useState(profileBio || "");
  const [profileBannerDraft, setProfileBannerDraft] = useState(profileBannerColor);
  const { analyticsEnabled: analyticsActive, trackEvent } = useAnalytics();
  const [isLogoutConfirmOpen, setIsLogoutConfirmOpen] = useState(false);
  const [isLeaving, setIsLeaving] = useState(false);
  const [analyticsEntries, setAnalyticsEntries] = useState<AnalyticsEntry[]>([]);
  const [profileError, setProfileError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;

    const run = () => {
      if (typeof window === "undefined") {
        return;
      }

      try {
        const raw = window.localStorage.getItem("zanari-analytics-log");

        if (!raw) {
          if (!cancelled) {
            setAnalyticsEntries([]);
          }
          return;
        }

        const parsed = JSON.parse(raw) as unknown[];

        const filtered = parsed
          .filter(
            (item): item is AnalyticsEntry =>
              typeof item === "object" &&
              item !== null &&
              typeof (item as { name?: unknown }).name === "string" &&
              typeof (item as { timestamp?: unknown }).timestamp === "string" &&
              typeof (item as { properties?: unknown }).properties === "object" &&
              (item as { properties?: unknown }).properties !== null,
          )
          .slice(-200)
          .reverse();

        if (!cancelled) {
          setAnalyticsEntries(filtered);
        }
      } catch {
        if (!cancelled) {
          setAnalyticsEntries([]);
        }
      }
    };

    run();

    return () => {
      cancelled = true;
    };
  }, []);

  const totalAnalyticsEvents = analyticsEntries.length;

  const analyticsCategorySummary = useMemo<CategorySummaryItem[]>(() => {
    const counts = new Map<AnalyticsCategory, number>();

    const getCategory = (entry: AnalyticsEntry): AnalyticsCategory => {
      const rawPath = entry.properties.path;
      const path = typeof rawPath === "string" ? rawPath : "";

      if (path.startsWith("/tools/")) {
        return "tools";
      }

      if (path === "/pinned-tools") {
        return "workspace";
      }

      if (path === "/settings") {
        return "settings";
      }

      if (path === "/" || path === "/resources" || path === "/pricing") {
        return "marketing";
      }

      if (path === "/analytics") {
        return "analytics";
      }

      return "other";
    };

    for (const entry of analyticsEntries) {
      const category = getCategory(entry);
      counts.set(category, (counts.get(category) ?? 0) + 1);
    }

    const palette: Record<AnalyticsCategory, { label: string; color: string }> = {
      tools: { label: "Tools", color: "var(--primary-500)" },
      workspace: { label: "Workspace", color: "var(--primary-400)" },
      settings: { label: "Settings", color: "var(--primary-600)" },
      marketing: { label: "Marketing pages", color: "var(--primary-300)" },
      analytics: { label: "Analytics", color: "var(--primary-700)" },
      other: { label: "Other", color: "#a1a1aa" },
    };

    return (Object.keys(palette) as AnalyticsCategory[])
      .map((key) => ({
        id: key,
        label: palette[key].label,
        color: palette[key].color,
        count: counts.get(key) ?? 0,
      }))
      .filter((item) => item.count > 0)
      .sort((a, b) => b.count - a.count);
  }, [analyticsEntries]);

  const analyticsToolSummary = useMemo<ToolSummaryItem[]>(() => {
    const counts = new Map<string, number>();

    for (const entry of analyticsEntries) {
      const rawPath = entry.properties.path;
      const path = typeof rawPath === "string" ? rawPath : "";

      if (!path.startsWith("/tools/")) {
        continue;
      }

      counts.set(path, (counts.get(path) ?? 0) + 1);
    }

    const labelForPath = (path: string) => {
      if (path === "/tools/color-contrast-checker") {
        return "Color Contrast Checker";
      }

      if (path === "/tools/ratio-calculator") {
        return "Ratio Calculator";
      }

      if (path === "/tools/em-to-percent-converter") {
        return "Unit Converter";
      }

      if (path === "/tools/lorem-placeholder-generator") {
        return "Placeholder generator";
      }

      const segments = path.split("/");
      const slug = segments[segments.length - 1] ?? "";

      if (!slug) {
        return path;
      }

      const spaced = slug.replace(/-/g, " ");
      return spaced.charAt(0).toUpperCase() + spaced.slice(1);
    };

    return Array.from(counts.entries())
      .map(([path, count]) => ({
        id: path,
        label: labelForPath(path),
        count,
      }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 6);
  }, [analyticsEntries]);

  const analyticsToolTimeline = (() => {
    const dateBuckets = new Map<string, Map<string, number>>();

    for (const entry of analyticsEntries) {
      const rawPath = entry.properties.path;
      const path = typeof rawPath === "string" ? rawPath : "";

      if (!path.startsWith("/tools/")) {
        continue;
      }

      const dateKey = entry.timestamp.slice(0, 10);
      let toolMap = dateBuckets.get(dateKey);

      if (!toolMap) {
        toolMap = new Map<string, number>();
        dateBuckets.set(dateKey, toolMap);
      }

      toolMap.set(path, (toolMap.get(path) ?? 0) + 1);
    }

    if (dateBuckets.size === 0 || analyticsToolSummary.length === 0) {
      return {
        dateKeys: [] as string[],
        dateLabels: [] as string[],
        series: [] as ToolTimelineSeries[],
        maxCount: 0,
      };
    }

    const sortedDates = Array.from(dateBuckets.keys()).sort();
    const recentDates = sortedDates.slice(-10);

    const formatter =
      typeof Intl !== "undefined"
        ? new Intl.DateTimeFormat(undefined, { month: "short", day: "numeric" })
        : null;

    const dateLabels = recentDates.map((key) => {
      const date = new Date(`${key}T00:00:00Z`);
      return formatter ? formatter.format(date) : key;
    });

    const palette = [
      "var(--primary-600)",
      "var(--primary-500)",
      "var(--primary-400)",
      "var(--primary-300)",
    ];
    const topTools = analyticsToolSummary.slice(0, 4);

    const series: ToolTimelineSeries[] = topTools.map((tool, toolIndex) => {
      const points: TimelinePoint[] = recentDates.map((key, labelIndex) => {
        const toolMap = dateBuckets.get(key);
        const count = toolMap?.get(tool.id) ?? 0;

        return {
          dateKey: key,
          label: dateLabels[labelIndex],
          count,
        };
      });

      return {
        id: tool.id,
        label: tool.label,
        color: palette[toolIndex % palette.length],
        points,
      };
    });

    const maxCount = series.reduce((outerMax, current) => {
      const seriesMax = current.points.reduce(
        (innerMax, point) => (point.count > innerMax ? point.count : innerMax),
        0,
      );

      return seriesMax > outerMax ? seriesMax : outerMax;
    }, 0);

    return {
      dateKeys: recentDates,
      dateLabels,
      series,
      maxCount,
    };
  })();

  const analyticsToolTimelineCoordinates = (() => {
    if (analyticsToolTimeline.series.length === 0 || analyticsToolTimeline.maxCount === 0) {
      return [];
    }

    const innerWidth =
      TOOL_CHART_WIDTH - TOOL_CHART_Y_AXIS_LABEL_WIDTH - TOOL_CHART_PADDING_X;
    const innerHeight = TOOL_CHART_HEIGHT - TOOL_CHART_PADDING_Y * 2;

    if (innerWidth <= 0 || innerHeight <= 0) {
      return [];
    }

    const step =
      analyticsToolTimeline.dateKeys.length === 1
        ? 0
        : innerWidth / (analyticsToolTimeline.dateKeys.length - 1);

    const chartMax = TOOL_CHART_MAX_VALUE;

    return analyticsToolTimeline.series.map((series) => {
      const coordinates = series.points.map((point, index) => {
        const x = TOOL_CHART_Y_AXIS_LABEL_WIDTH + step * index;
        const rawRatio =
          chartMax > 0 ? Math.min(point.count / chartMax, 1) : 0;
        const ratio = Math.max(0, rawRatio);
        const y = TOOL_CHART_PADDING_Y + (1 - ratio) * innerHeight;

        return {
          x,
          y,
          dateKey: point.dateKey,
          label: point.label,
          count: point.count,
        };
      });

      return {
        id: series.id,
        label: series.label,
        color: series.color,
        coordinates,
      };
    });
  })();

  const analyticsToolTimelineGridLines = (() => {
    if (analyticsToolTimeline.series.length === 0 || analyticsToolTimeline.maxCount === 0) {
      return [];
    }

    const innerHeight = TOOL_CHART_HEIGHT - TOOL_CHART_PADDING_Y * 2;

    if (innerHeight <= 0) {
      return [];
    }

    return TOOL_CHART_GRID_FRACTIONS.map(
      (fraction) => TOOL_CHART_PADDING_Y + innerHeight * fraction,
    );
  })();

  const analyticsToolTimelineGridLineValues = (() => {
    if (analyticsToolTimeline.series.length === 0 || analyticsToolTimeline.maxCount === 0) {
      return [];
    }

    return TOOL_CHART_GRID_FRACTIONS.map((fraction) =>
      Math.round(TOOL_CHART_MAX_VALUE * (1 - fraction)),
    );
  })();

  const analyticsToolTimelineXAxisTicks = (() => {
    if (analyticsToolTimeline.series.length === 0 || analyticsToolTimeline.maxCount === 0) {
      return [];
    }

    const innerWidth =
      TOOL_CHART_WIDTH - TOOL_CHART_Y_AXIS_LABEL_WIDTH - TOOL_CHART_PADDING_X;

    if (innerWidth <= 0) {
      return [];
    }

    const count = analyticsToolTimeline.dateKeys.length;

    if (count === 0) {
      return [];
    }

    const step = count === 1 ? 0 : innerWidth / (count - 1);

    return analyticsToolTimeline.dateKeys.map(
      (_, index) => TOOL_CHART_Y_AXIS_LABEL_WIDTH + step * index,
    );
  })();

  const analyticsMaxToolCount = analyticsToolSummary.reduce(
    (max, item) => (item.count > max ? item.count : max),
    0,
  );

  const analyticsTotalToolEvents = analyticsToolSummary.reduce(
    (sum, item) => sum + item.count,
    0,
  );

  const analyticsPieStyle = (() => {
    if (analyticsCategorySummary.length === 0 || totalAnalyticsEvents === 0) {
      return {};
    }

    let currentAngle = 0;
    const segments: string[] = [];
    const lastIndex = analyticsCategorySummary.length - 1;

    analyticsCategorySummary.forEach((item, index) => {
      const share = item.count / totalAnalyticsEvents;
      const start = currentAngle;
      const end = index === lastIndex ? 360 : currentAngle + share * 360;

      segments.push(
        `${item.color} ${start.toFixed(2)}deg ${end.toFixed(2)}deg`,
      );
      currentAngle = end;
    });

    return {
      backgroundImage: `conic-gradient(${segments.join(", ")})`,
    } as const;
  })();

  const hasAnalyticsData = analyticsEntries.length > 0;

  const statusOptions = [
    { id: "online", label: "Online", dotClass: "status-dot-online" },
    { id: "idle", label: "Idle", dotClass: "status-dot-idle" },
    { id: "dnd", label: "Do not disturb", dotClass: "status-dot-dnd" },
    { id: "offline", label: "Offline", dotClass: "status-dot-offline" },
  ] as const;

  const activeStatus =
    statusOptions.find((option) => option.id === profileStatus) ?? statusOptions[0];

  const displayName = useMemo(() => {
    if (!user) {
      return profileUsername || "";
    }

    const metadata = (user as { user_metadata?: Record<string, unknown> }).user_metadata ?? {};
    const metaName =
      (metadata.name as string | undefined) ||
      (metadata.full_name as string | undefined) ||
      (metadata.username as string | undefined);

    if (metaName && metaName.trim().length > 0) {
      return metaName;
    }

    if (profileUsername && profileUsername.trim().length > 0) {
      return profileUsername;
    }

    const email = user.email ?? "";

    if (email.includes("@")) {
      return email.split("@")[0] || "Account";
    }

    return email || "Account";
  }, [user, profileUsername]);

  const isProfileDirty =
    profileUsernameDraft !== (profileUsername || "") ||
    profileBioDraft !== (profileBio || "") ||
    profileBannerDraft !== profileBannerColor;

  const effectiveCountry = profileCountry || "US";

  const countryConfig = (() => {
    switch (effectiveCountry) {
      case "GB":
        return { code: "GB", label: "United Kingdom · GBP", flag: "🇬🇧" };
      case "EU":
        return { code: "EU", label: "Euro area · EUR", flag: "🇪🇺" };
      case "IN":
        return { code: "IN", label: "India · INR", flag: "🇮🇳" };
      case "JP":
        return { code: "JP", label: "Japan · JPY", flag: "🇯🇵" };
      case "US":
        return { code: "US", label: "United States · USD", flag: "🇺🇸" };
      default:
        return {
          code: effectiveCountry,
          label: `Country code · ${effectiveCountry}`,
          flag: "🌐",
        };
    }
  })();

  const USERNAME_COOLDOWN_MINUTES = 10;

  const handleProfileSave = async () => {
    const nextUsername = profileUsernameDraft.trim();
    const nextBio = profileBioDraft.trim();
    const nextBanner = profileBannerDraft;

    setProfileError(null);

    if (!user) {
      return;
    }

    const now = new Date();

    if (lastUsernameChangedAt) {
      const last = new Date(lastUsernameChangedAt);
      const diffMinutes = (now.getTime() - last.getTime()) / 60000;

      if (Number.isFinite(diffMinutes) && diffMinutes < USERNAME_COOLDOWN_MINUTES) {
        const remaining = Math.ceil(USERNAME_COOLDOWN_MINUTES - diffMinutes);
        setProfileError(`Oops, that was quick. You can change your username again in ${remaining} minutes.`);
        return;
      }
    }

    const supabase = getSupabaseClient();
    const { error } = await supabase
      .from("users")
      .update({ username: nextUsername, bio: nextBio })
      .eq("id", user.id);

    if (error) {
      const message =
        typeof error.message === "string" && error.message.trim().length > 0
          ? error.message
          : "Unable to update profile right now.";
      setProfileError(message);
      return;
    }

    setProfileUsername(nextUsername);
    setProfileBio(nextBio);
    setProfileUsername(nextUsername);
    setProfileBio(nextBio);
    setProfileBannerColor(nextBanner);

    setProfileUsernameDraft(nextUsername);
    setProfileBioDraft(nextBio);
    setProfileBannerDraft(nextBanner);
    setLastUsernameChangedAt(now.toISOString());
  };

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

  function handleBackClick() {
    if (typeof window === "undefined" || isLeaving) {
      return;
    }

    setIsLeaving(true);
    document.documentElement.classList.add("page-transition-leave");

    window.setTimeout(() => {
      if (window.history.length > 1) {
        router.back();
      } else {
        router.push("/");
      }

      window.setTimeout(() => {
        document.documentElement.classList.remove("page-transition-leave");
        setIsLeaving(false);
      }, 220);
    }, 160);
  }

  useEffect(() => {
    if (isLoading) {
      return;
    }

    if (!user) {
      router.replace("/");
    }
  }, [isLoading, user, router]);

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
                Adjust how your account, interface, and notifications behave across the Zanari
                toolkit.
              </p>
            </div>
            <button
              type="button"
              onClick={handleBackClick}
              className="inline-flex h-8 items-center gap-1 rounded-full border border-red-300 px-3 text-[11px] font-medium text-red-400 transition-colors hover:border-red-400 hover:bg-red-50 hover:text-red-600"
            >
              <span>Back</span>
            </button>
          </div>
        </section>
        <section className="py-8 md:py-10">
          <div className="mx-auto flex max-w-6xl flex-col gap-6 px-4 md:flex-row md:px-8">
            <div className="flex-1 space-y-6">
              <div className="rounded-2xl border border-zinc-200 bg-white p-5 shadow-sm sm:p-6">
                <div className="space-y-6 divide-y divide-zinc-100">
                  <div className="mb-0">
                    <div className="mb-4">
                      <div className="relative overflow-hidden rounded-2xl border border-zinc-200 bg-white shadow-sm">
                        <div
                          className={`relative h-32 rounded-t-2xl ${
                            profileBannerDraft === "red"
                              ? "bg-gradient-to-r from-red-500 via-red-400 to-red-600"
                              : profileBannerDraft === "emerald"
                              ? "bg-gradient-to-r from-emerald-500 via-emerald-400 to-emerald-600"
                              : profileBannerDraft === "violet"
                              ? "bg-gradient-to-r from-violet-500 via-violet-400 to-violet-600"
                              : profileBannerDraft === "amber"
                              ? "bg-gradient-to-r from-amber-500 via-amber-400 to-amber-600"
                              : "bg-gradient-to-r from-sky-500 via-sky-400 to-sky-600"
                          }`}
                        >
                          <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_0_0,rgba(255,255,255,0.28),transparent_60%),radial-gradient(circle_at_100%_0,rgba(255,255,255,0.18),transparent_55%)] opacity-90" />
                        </div>
                        <div className="px-4 pb-4 pt-0">
                          <div className="flex items-end gap-3 -mt-8">
                            <div className="relative">
                              <div className="profile-avatar-ring flex h-16 w-16 items-center justify-center rounded-full border-4 bg-red-500 text-base font-semibold text-white">
                                {displayName.slice(0, 1).toUpperCase()}
                              </div>
                              <span
                                className={`profile-avatar-ring absolute bottom-0 right-0 flex h-5 w-5 items-center justify-center rounded-full border-[3px] ${activeStatus.dotClass}`}
                              />
                            </div>
                          </div>
                          <div className="mt-4 space-y-1.5">
                            <h2 className="text-sm font-semibold text-zinc-900">
                              {displayName || "Signed out"}
                            </h2>
                            <p className="text-[11px] text-zinc-500">
                              Subscription:{" "}
                              <span className="font-medium">
                                {subscriptionMode === "free"
                                  ? "Free"
                                  : subscriptionMode === "pro"
                                  ? "Pro"
                                  : "Top tier"}
                              </span>
                            </p>
                          </div>
                        </div>
                      </div>
                    </div>
                    {showAuthNotice && (
                      <div className="mt-4 rounded-lg border border-dashed border-zinc-200 bg-zinc-50 px-3 py-2 text-[11px] text-zinc-600">
                        You are currently signed out. Return to the main page to create or log into
                        an account.
                      </div>
                    )}
                  </div>
                  <div className="pt-4 mb-4">
                    <div className="rounded-2xl border border-zinc-200 bg-zinc-50 p-4">
                      <div className="mb-4 flex items-start justify-between gap-3">
                        <div className="space-y-1">
                          <p className="text-xs font-medium text-zinc-500">Profile</p>
                          <h2 className="text-sm font-semibold text-zinc-900">Identity</h2>
                          <p className="text-[11px] text-zinc-500">
                            Adjust how your name and status appear inside Zanari.
                          </p>
                        </div>
                        <div className="flex flex-col items-end gap-1">
                          {isProfileDirty && (
                            <span className="text-[10px] font-medium text-red-500">
                              You have unsaved changes
                            </span>
                          )}
                          <button
                            type="button"
                            onClick={handleProfileSave}
                            disabled={!isProfileDirty}
                            className="inline-flex items-center gap-1 rounded-full bg-red-500 px-3 py-1.5 text-[11px] font-semibold text-white shadow-sm transition-transform hover:-translate-y-0.5 hover:bg-red-600 disabled:translate-y-0 disabled:bg-red-300 disabled:text-white disabled:opacity-70 disabled:hover:bg-red-300"
                          >
                            <span>Save</span>
                          </button>
                        </div>
                      </div>
                      <div className="space-y-3">
                        <div className="space-y-1">
                          <p className="text-[11px] font-medium text-zinc-600">Username</p>
                          <input
                            type="text"
                            value={profileUsernameDraft}
                            onChange={(event) => setProfileUsernameDraft(event.target.value)}
                            placeholder="Choose a short handle"
                            className="w-full rounded-md border border-zinc-200 bg-white px-3 py-2 text-sm text-zinc-900 outline-none ring-0 placeholder:text-zinc-400 focus:border-red-400 focus:ring-1 focus:ring-red-200"
                          />
                        </div>
                        {profileError && (
                          <p className="text-[10px] text-red-500">{profileError}</p>
                        )}
                        <div className="space-y-1">
                          <p className="text-[11px] font-medium text-zinc-600">Email</p>
                          <div className="relative">
                            <div className="w-full rounded-md border border-zinc-200 bg-white px-3 py-2 pr-9 text-sm text-zinc-900">
                              {user?.email ?? profileEmail ?? "you@example.com"}
                            </div>
                            <button
                              type="button"
                              onClick={() => {
                                const value = user?.email ?? profileEmail ?? "";
                                if (!value) return;
                                try {
                                  navigator.clipboard.writeText(value);
                                } catch {
                                }
                              }}
                              className="absolute inset-y-0 right-0 flex items-center pr-2 text-zinc-400 transition-colors hover:text-zinc-700"
                              aria-label="Copy email address"
                            >
                              <Image src="/icons/copy.svg" alt="" width={14} height={14} className="h-3.5 w-3.5" />
                            </button>
                          </div>
                        </div>
                        <div className="space-y-1">
                          <p className="text-[11px] font-medium text-zinc-600">Bio</p>
                          <textarea
                            value={profileBioDraft}
                            onChange={(event) => setProfileBioDraft(event.target.value)}
                            placeholder="Add a short line about the type of work you do."
                            rows={3}
                            className="w-full resize-none rounded-md border border-zinc-200 bg-white px-3 py-2 text-sm text-zinc-900 outline-none ring-0 placeholder:text-zinc-400 focus:border-red-400 focus:ring-1 focus:ring-red-200"
                          />
                        </div>
                        <div className="space-y-1">
                          <p className="text-[11px] font-medium text-zinc-600">Country</p>
                          <div className="inline-flex items-center gap-2 rounded-md border border-zinc-200 bg-white px-3 py-2 text-sm text-zinc-900">
                            <span className="text-base">{countryConfig.flag}</span>
                            <span>{countryConfig.label}</span>
                          </div>
                          <p className="text-[10px] text-zinc-500">
                            Based on where you first signed in and not editable.
                          </p>
                        </div>
                        <div className="space-y-1">
                          <p className="text-[11px] font-medium text-zinc-600">Theme color</p>
                          <div className="flex flex-wrap items-center gap-2">
                            <div className="inline-flex items-center gap-2 rounded-full border border-zinc-200 bg-white/80 px-2 py-2">
                              {[
                                { id: "red", color: "#ef4444" },
                                { id: "sky", color: "#0ea5e9" },
                                { id: "emerald", color: "#10b981" },
                                { id: "violet", color: "#8b5cf6" },
                                { id: "amber", color: "#f59e0b" },
                              ].map((option) => {
                                const isActive = profileBannerDraft === option.id;
                                const isLocked = subscriptionMode === "free" && option.id !== "red";

                                return (
                                  <button
                                    key={option.id}
                                    type="button"
                                    onClick={() => {
                                      if (isLocked) return;
                                      setProfileBannerDraft(
                                        option.id as "red" | "sky" | "emerald" | "violet" | "amber",
                                      );
                                    }}
                                    className={`relative flex h-7 w-7 items-center justify-center rounded-full ${
                                      isActive
                                        ? "border-2 border-white bg-transparent shadow-[0_0_0_2px_rgba(0,0,0,0.65)]"
                                        : "border border-zinc-300"
                                    } ${isLocked ? "cursor-not-allowed opacity-60" : ""}`}
                                  >
                                    <span
                                      className="h-5 w-5 rounded-full"
                                      style={{ backgroundColor: option.color }}
                                    />
                                    {isLocked && (
                                      <span className="pointer-events-none absolute inset-0 flex items-center justify-center">
                                        <Image
                                          src={
                                            appearance === "dark"
                                              ? "/icons/lock-white.svg"
                                              : "/icons/lock-black.svg"
                                          }
                                          alt=""
                                          width={10}
                                          height={10}
                                          className="h-3 w-3"
                                        />
                                      </span>
                                    )}
                                  </button>
                                );
                              })}
                            </div>
                          </div>
                          <p className="mt-1 inline-flex items-center gap-1 text-[10px] font-medium text-violet-600 [data-theme=dark]:text-violet-300">
                            <span className="h-1.5 w-1.5 rounded-full bg-violet-500 [data-theme=dark]:bg-violet-300" />
                            <span>Extra banner colors are available on Pro and Top tier plans.</span>
                          </p>
                        </div>
                      </div>
                      {user && (
                        <div className="mt-3 flex justify-end">
                          <button
                            type="button"
                            onClick={() => setIsLogoutConfirmOpen(true)}
                            className="inline-flex items-center gap-1 rounded-full bg-red-500 px-3 py-1.5 text-[11px] font-semibold text-white shadow-sm transition-transform hover:-translate-y-0.5 hover:bg-red-600"
                          >
                            <span>Log out</span>
                          </button>
                        </div>
                      )}
                    </div>
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
                            ? "border-red-500 bg-red-50 text-red-700 [data-theme=dark]:bg-red-500/10 [data-theme=dark]:text-red-300"
                            : "border-zinc-200 bg-white text-zinc-600 hover:border-zinc-300 hover:text-zinc-800 [data-theme=dark]:border-zinc-700 [data-theme=dark]:bg-transparent [data-theme=dark]:text-zinc-300 [data-theme=dark]:hover:border-zinc-500 [data-theme=dark]:hover:text-zinc-100"
                        }`}
                      >
                        <span className="h-1.5 w-1.5 rounded-full bg-zinc-400" />
                        <span>Default</span>
                      </button>
                      <button
                        type="button"
                        onClick={() => setAppearance("dark")}
                        className={`inline-flex items-center gap-2 rounded-full border px-3 py-1.5 text-[11px] font-medium ${
                          appearance === "dark"
                            ? "border-red-500 bg-red-50 text-red-700 [data-theme=dark]:bg-red-500/10 [data-theme=dark]:text-red-300"
                            : "border-zinc-200 bg-white text-zinc-600 hover:border-zinc-300 hover:text-zinc-800 [data-theme=dark]:border-zinc-700 [data-theme=dark]:bg-transparent [data-theme=dark]:text-zinc-300 [data-theme=dark]:hover:border-zinc-500 [data-theme=dark]:hover:text-zinc-100"
                        }`}
                      >
                        <span className="h-3 w-3 rounded-full bg-zinc-900" />
                        <span>Dark</span>
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
                          className={`settings-toggle-track ml-2 inline-flex h-5 w-9 shrink-0 items-center rounded-full border ${
                            tipsAndGuides
                              ? "border-red-400 bg-red-500 [data-theme=dark]:border-red-500 [data-theme=dark]:bg-red-600"
                              : "border-zinc-300 bg-white [data-theme=dark]:border-zinc-500 [data-theme=dark]:bg-slate-800"
                          }`}
                        >
                          <span
                            className={`settings-toggle-thumb h-4 w-4 rounded-full bg-white shadow transition-transform ${
                              tipsAndGuides ? "translate-x-4" : "translate-x-0"
                            }`}
                          />
                        </span>
                      </button>
                    </div>
                  </div>
                  <div className="pt-4 mb-4">
                    <div className="mb-4 space-y-1">
                      <p className="text-xs font-medium text-zinc-500">Focus mode</p>
                      <h2 className="text-sm font-semibold text-zinc-900">Hide distractions</h2>
                      <p className="text-[11px] text-zinc-500">
                        Similar to Discord&apos;s streamer mode, this reduces extra hints and subtle
                        motion when you want a quieter workspace.
                      </p>
                    </div>
                    <button
                      type="button"
                      onClick={() => setFocusMode(!focusMode)}
                      className="flex w-full items-center justify-between gap-3 rounded-lg border border-zinc-200 bg-zinc-50 px-3 py-2 text-left text-[11px] text-zinc-700 transition-colors hover:border-zinc-300 hover:bg-zinc-100"
                    >
                      <div className="min-w-0 flex-1 space-y-0.5">
                        <p className="font-medium">Enable focus mode</p>
                        <p className="text-[11px] text-zinc-500">
                          When on, Zanari aims to minimize non-essential animations and prompts.
                        </p>
                      </div>
                    <span
                      className={`settings-toggle-track ml-2 inline-flex h-5 w-9 shrink-0 items-center rounded-full border ${
                        focusMode
                          ? "border-red-400 bg-red-500 [data-theme=dark]:border-red-500 [data-theme=dark]:bg-red-600"
                          : "border-zinc-300 bg-white [data-theme=dark]:border-zinc-500 [data-theme=dark]:bg-slate-800"
                      }`}
                    >
                        <span
                          className={`settings-toggle-thumb h-4 w-4 rounded-full bg-white shadow transition-transform ${
                            focusMode ? "translate-x-4" : "translate-x-0"
                          }`}
                        />
                      </span>
                    </button>
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
                    Decide which emails you would like to receive from Zanari.
                  </p>
                </div>
                <div className="space-y-2">
                  <button
                    type="button"
                    onClick={() => setEmailNotifications(!emailNotifications)}
                    className="flex w-full items-center justify-between gap-3 rounded-lg border border-zinc-200 bg-zinc-50 px-3 py-2 text-left text-[11px] text-zinc-700 transition-colors hover:border-zinc-300 hover:bg-zinc-100"
                  >
                    <div className="min-w-0 flex-1 space-y-0.5">
                      <p className="font-medium">Product activity</p>
                      <p className="text-[11px] text-zinc-500">
                        Important updates related to your account or saved work.
                      </p>
                    </div>
                    <span
                      className={`settings-toggle-track ml-2 inline-flex h-5 w-9 shrink-0 items-center rounded-full border ${
                        emailNotifications
                          ? "border-red-400 bg-red-500 [data-theme=dark]:border-red-500 [data-theme=dark]:bg-red-600"
                          : "border-zinc-300 bg-white [data-theme=dark]:border-zinc-500 [data-theme=dark]:bg-slate-800"
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
                    className="flex w-full items-center justify-between gap-3 rounded-lg border border-zinc-200 bg-zinc-50 px-3 py-2 text-left text-[11px] text-zinc-700 transition-colors hover:border-zinc-300 hover:bg-zinc-100"
                  >
                    <div className="min-w-0 flex-1 space-y-0.5">
                      <p className="font-medium">New tools and features</p>
                      <p className="text-[11px] text-zinc-500">
                        Occasional emails about new tools and improvements.
                      </p>
                    </div>
                    <span
                      className={`settings-toggle-track ml-2 inline-flex h-5 w-9 shrink-0 items-center rounded-full border ${
                        productUpdates
                          ? "border-red-400 bg-red-500 [data-theme=dark]:border-red-500 [data-theme=dark]:bg-red-600"
                          : "border-zinc-300 bg-white [data-theme=dark]:border-zinc-500 [data-theme=dark]:bg-slate-800"
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
                  <p className="text-xs font-medium text-zinc-500">Subscription</p>
                  <h2 className="text-sm font-semibold text-zinc-900">Plan overview</h2>
                  <p className="text-[11px] text-zinc-500">
                    See which pricing mode you are currently on in Zanari.
                  </p>
                </div>
                <div className="space-y-2">
                  <div
                    className={`flex w-full items-center justify-between gap-3 rounded-lg border px-3 py-2 text-left text-[11px] ${
                      subscriptionMode === "free"
                        ? "border-emerald-500 bg-emerald-50 text-emerald-800 [data-theme=dark]:bg-emerald-900 [data-theme=dark]:text-emerald-50"
                        : "border-zinc-200 bg-zinc-50 text-zinc-700 [data-theme=dark]:border-zinc-800 [data-theme=dark]:bg-zinc-900 [data-theme=dark]:text-zinc-100"
                    }`}
                  >
                    <div className="min-w-0 flex-1 space-y-0.5">
                      <p className="font-medium">Free</p>
                      <p
                        className={`text-[11px] ${
                          subscriptionMode === "free"
                            ? "text-emerald-700 [data-theme=dark]:text-emerald-100"
                            : "text-zinc-500 [data-theme=dark]:text-zinc-400"
                        }`}
                      >
                        Default mode with access to all current tools.
                      </p>
                    </div>
                  </div>
                  <div
                    className={`flex w-full items-center justify-between gap-3 rounded-lg border px-3 py-2 text-left text-[11px] ${
                      subscriptionMode === "pro"
                        ? "border-red-500 bg-red-50 text-red-800"
                        : "border-zinc-200 bg-zinc-50 text-zinc-700"
                    }`}
                  >
                    <div className="min-w-0 flex-1 space-y-0.5">
                      <p
                        className={`font-medium ${
                          subscriptionMode === "pro"
                            ? "text-red-700 [data-theme=dark]:text-red-200"
                            : ""
                        }`}
                      >
                        Pro
                      </p>
                      <p
                        className={`text-[11px] ${
                          subscriptionMode === "pro"
                            ? "text-red-700 [data-theme=dark]:text-red-200"
                            : "text-zinc-500 [data-theme=dark]:text-zinc-400"
                        }`}
                      >
                        Reflects the light green starter plan on the pricing page.
                      </p>
                    </div>
                  </div>
                  <div
                    className={`flex w-full items-center justify-between gap-3 rounded-lg border px-3 py-2 text-left text-[11px] ${
                      subscriptionMode === "top"
                        ? "border-violet-500 bg-violet-50 text-violet-800"
                        : "border-zinc-200 bg-zinc-50 text-zinc-700"
                    }`}
                  >
                    <div className="min-w-0 flex-1 space-y-0.5">
                      <p className="font-medium">Top tier</p>
                      <p
                        className={`text-[11px] ${
                          subscriptionMode === "top"
                            ? "text-violet-700 [data-theme=dark]:text-violet-200"
                            : "text-zinc-500 [data-theme=dark]:text-zinc-400"
                        }`}
                      >
                        Use when you are working in a team-focused environment.
                      </p>
                    </div>
                  </div>
                </div>
              </div>
              <div className="rounded-2xl border border-zinc-200 bg-white p-5 shadow-sm sm:p-6">
                <div className="mb-4 space-y-1">
                  <p className="text-xs font-medium text-zinc-500">Privacy</p>
                  <h2 className="text-sm font-semibold text-zinc-900">Data and storage</h2>
                  <p className="text-[11px] text-zinc-500">
                    Understand how data from the Zanari toolkit is stored on your device.
                  </p>
                </div>
                <ul className="space-y-2 text-[11px] text-zinc-600">
                  <li>Design inputs stay on this device and are not uploaded by the tools.</li>
                  <li>Settings and analytics logs are stored locally in your browser and can be cleared.</li>
                  <li>Signed-in sessions are handled by the authentication provider you use.</li>
                </ul>
              </div>
              <div className="rounded-2xl border border-dashed border-zinc-200 bg-zinc-50 p-5 sm:p-6">
                <div className="mb-3 inline-flex items-center gap-2 rounded-full border border-red-200 bg-red-50 px-3 py-1 text-[11px] font-medium text-red-700">
                  <span className="flex h-5 w-5 items-center justify-center rounded-full bg-red-500">
                    <Image
                      src="/icon.svg"
                      alt=""
                      width={16}
                      height={16}
                      className="h-3 w-3"
                    />
                  </span>
                  <span>About Zanari</span>
                </div>
                <p className="text-[11px] text-zinc-600">
                  Zanari is a focused toolkit for interface design work. Over time, more preferences
                  for privacy, integrations, and keyboard shortcuts will appear here as the toolkit
                  grows.
                </p>
              </div>
            </div>
          </div>
          <div className="mx-auto mt-8 max-w-6xl px-4 md:px-8">
            <div className="space-y-4">
              <div className="inline-flex items-center gap-2 rounded-full border border-zinc-200 bg-white px-3 py-1 text-[11px] font-medium text-zinc-600">
                <span className="h-1.5 w-1.5 rounded-full bg-sky-500" />
                <span>Analytics</span>
              </div>
              <div className="grid gap-4 lg:grid-cols-[minmax(0,1.05fr)_minmax(0,1.35fr)]">
                <div className="space-y-4">
                  <div className="rounded-2xl border border-zinc-200 bg-white p-4 shadow-sm sm:p-5">
                    <div className="mb-3 space-y-1">
                      <p className="text-xs font-medium text-zinc-500">Usage and diagnostics</p>
                      <h2 className="text-sm font-semibold text-zinc-900">Analytics controls</h2>
                      <p className="text-[11px] text-zinc-500">
                        Control whether basic, anonymous usage events are recorded while you work.
                      </p>
                    </div>
                    <button
                      type="button"
                      onClick={() => setAnalyticsEnabled(!analyticsEnabled)}
                      className="flex w-full items-center justify-between gap-3 rounded-lg border border-zinc-200 bg-zinc-50 px-3 py-2 text-left text-[11px] text-zinc-700 transition-colors hover:border-zinc-300 hover:bg-zinc-100"
                    >
                      <div className="min-w-0 flex-1 space-y-0.5">
                        <p className="font-medium">
                          {analyticsEnabled ? "Analytics enabled" : "Enable basic usage analytics"}
                        </p>
                        <p className="text-[11px] text-zinc-500">
                          When enabled, tools log simple events like which screens are opened.
                        </p>
                      </div>
                      <span
                        className={`settings-toggle-track ml-2 inline-flex h-5 w-9 shrink-0 items-center rounded-full border ${
                          analyticsEnabled
                            ? "border-red-400 bg-red-500 [data-theme=dark]:border-red-500 [data-theme=dark]:bg-red-600"
                            : "border-zinc-300 bg-white [data-theme=dark]:border-zinc-700 [data-theme=dark]:bg-slate-900"
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
                  <div className="rounded-2xl border border-zinc-200 bg-white p-4 shadow-sm sm:p-5">
                    <div className="mb-3 flex items-center justify-between">
                      <div className="space-y-1">
                        <p className="text-xs font-medium text-zinc-500">Events</p>
                        <h2 className="text-sm font-semibold text-zinc-900">Event overview</h2>
                      </div>
                      <p className="text-[11px] text-zinc-500">
                        {totalAnalyticsEvents > 0
                          ? `${totalAnalyticsEvents} events from this browser`
                          : "No events recorded yet"}
                      </p>
                    </div>
                    {!hasAnalyticsData && (
                      <p className="rounded-lg border border-dashed border-zinc-200 bg-zinc-50 px-3 py-2 text-[11px] text-zinc-600">
                        Use tools while analytics is enabled to see an overview of activity.
                      </p>
                    )}
                    {hasAnalyticsData && (
                      <div className="flex flex-col gap-4 sm:flex-row sm:items-center">
                        <div className="flex items-center justify-center">
                          <div
                            className="flex h-24 w-24 items-center justify-center rounded-full border border-zinc-200 bg-white"
                            style={analyticsPieStyle}
                          >
                            <div className="h-14 w-14 rounded-full bg-white" />
                          </div>
                        </div>
                        <div className="flex-1 space-y-1">
                          {analyticsCategorySummary.map((item) => {
                            const share =
                              totalAnalyticsEvents > 0
                                ? Math.round((item.count / totalAnalyticsEvents) * 100)
                                : 0;

                            return (
                              <div
                                key={item.id}
                                className="flex items-center justify-between text-[11px] text-zinc-700"
                              >
                                <div className="flex items-center gap-2">
                                  <span
                                    className="h-2.5 w-2.5 rounded-full"
                                    style={{ backgroundColor: item.color }}
                                  />
                                  <span className="font-medium">{item.label}</span>
                                </div>
                                <div className="flex items-center gap-2 text-[10px] text-zinc-500">
                                  <span>{item.count}</span>
                                  <span>·</span>
                                  <span>{share}%</span>
                                </div>
                              </div>
                            );
                          })}
                        </div>
                      </div>
                    )}
                  </div>
                </div>
                <div className="space-y-4">
                  <div className="rounded-2xl border border-zinc-200 bg-white p-4 shadow-sm sm:p-5">
                    <div className="mb-3 space-y-1">
                      <p className="text-xs font-medium text-zinc-500">Timeline</p>
                      <h2 className="text-sm font-semibold text-zinc-900">Tool usage over time</h2>
                      <p className="text-[11px] text-zinc-500">
                        See how often top tools have been opened in recent days.
                      </p>
                    </div>
                    {(!hasAnalyticsData || analyticsToolTimelineCoordinates.length === 0) && (
                      <p className="rounded-lg border border-dashed border-zinc-200 bg-zinc-50 px-3 py-2 text-[11px] text-zinc-600">
                        Open tools across a few days to see trends in this chart.
                      </p>
                    )}
                    {hasAnalyticsData && analyticsToolTimelineCoordinates.length > 0 && (
                      <div className="overflow-x-auto">
                        <svg
                          width={TOOL_CHART_WIDTH}
                          height={TOOL_CHART_HEIGHT}
                          className="min-w-[260px]"
                        >
                          <rect
                            x={0}
                            y={0}
                            width={TOOL_CHART_WIDTH}
                            height={TOOL_CHART_HEIGHT}
                            fill="white"
                          />
                          {analyticsToolTimelineGridLines.map((y, index) => (
                            <g key={y}>
                              <line
                                x1={0}
                                x2={TOOL_CHART_WIDTH}
                                y1={y}
                                y2={y}
                                stroke="#e5e7eb"
                                strokeWidth={1}
                              />
                              {analyticsToolTimelineGridLineValues[index] !== undefined && (
                                <text
                                  x={TOOL_CHART_Y_AXIS_LABEL_WIDTH - 6}
                                  y={y + 3}
                                  fontSize={9}
                                  textAnchor="end"
                                  fill="#6b7280"
                                >
                                  {analyticsToolTimelineGridLineValues[index]}
                                </text>
                              )}
                            </g>
                          ))}
                          {analyticsToolTimelineXAxisTicks.map((x) => (
                            <line
                              key={x}
                              x1={x}
                              x2={x}
                              y1={TOOL_CHART_HEIGHT - TOOL_CHART_PADDING_Y}
                              y2={TOOL_CHART_HEIGHT - TOOL_CHART_PADDING_Y + 4}
                              stroke="#d4d4d8"
                              strokeWidth={1}
                            />
                          ))}
                          {analyticsToolTimelineCoordinates.map((series, seriesIndex) => {
                            if (series.coordinates.length === 0) {
                              return null;
                            }

                            const seriesCount = analyticsToolTimelineCoordinates.length;
                            const barWidth = 8;
                            const baseY = TOOL_CHART_HEIGHT - TOOL_CHART_PADDING_Y;

                            return (
                              <g key={series.id}>
                                {series.coordinates.map((point) => {
                                  const totalWidth = barWidth * seriesCount;
                                  const x =
                                    point.x - totalWidth / 2 + seriesIndex * barWidth;
                                  const height = Math.max(0, baseY - point.y);

                                  return (
                                    <rect
                                      key={`${series.id}-${point.dateKey}`}
                                      x={x}
                                      y={point.y}
                                      width={barWidth}
                                      height={height}
                                      rx={barWidth / 2}
                                      fill={series.color}
                                    />
                                  );
                                })}
                              </g>
                            );
                          })}
                        </svg>
                        <div className="mt-2 flex flex-wrap gap-2">
                          {analyticsToolTimeline.series.map((series) => (
                            <div
                              key={series.id}
                              className="inline-flex items-center gap-1 rounded-full bg-zinc-50 px-2 py-1 text-[10px] text-zinc-600"
                            >
                              <span
                                className="h-2 w-2 rounded-full"
                                style={{ backgroundColor: series.color }}
                              />
                              <span>{series.label}</span>
                            </div>
                          ))}
                        </div>
                        <div className="mt-1 flex justify-between text-[9px] text-zinc-400">
                          <span>Recent days</span>
                          <span>Top tools only</span>
                        </div>
                      </div>
                    )}
                  </div>
                  <div className="rounded-2xl border border-zinc-200 bg-white p-4 shadow-sm sm:p-5">
                    <div className="mb-3 space-y-1">
                      <p className="text-xs font-medium text-zinc-500">Tool analytics</p>
                      <h2 className="text-sm font-semibold text-zinc-900">Per-tool usage</h2>
                      <p className="text-[11px] text-zinc-500">
                        See how often each tool has been opened recently from this browser.
                      </p>
                    </div>
                    {analyticsToolSummary.length === 0 && (
                      <p className="rounded-lg border border-dashed border-zinc-200 bg-zinc-50 px-3 py-2 text-[11px] text-zinc-600">
                        Open any tool to see its usage appear here.
                      </p>
                    )}
                    {analyticsToolSummary.length > 0 && (
                      <div className="space-y-1.5">
                        {analyticsToolSummary.map((item) => {
                          const share =
                            analyticsMaxToolCount > 0 ? item.count / analyticsMaxToolCount : 0;
                          const percent =
                            analyticsTotalToolEvents > 0
                              ? Math.round((item.count / analyticsTotalToolEvents) * 100)
                              : 0;

                          return (
                            <div
                              key={item.id}
                              className="space-y-1 rounded-lg border border-zinc-100 bg-zinc-50 px-3 py-1.5"
                            >
                              <div className="flex items-center justify-between text-[11px] text-zinc-700">
                                <div className="flex items-center gap-2">
                                  <span className="inline-flex h-4 min-w-[20px] items-center justify-center rounded-full bg-zinc-900 text-[9px] font-semibold text-white">
                                    {item.count}
                                  </span>
                                  <span className="font-medium">{item.label}</span>
                                </div>
                                <span className="text-[10px] text-zinc-500">{percent}%</span>
                              </div>
                              <div className="h-1.5 rounded-full bg-zinc-200">
                                <div
                                  className="h-1.5 rounded-full bg-red-500"
                                  style={{
                                    width: `${
                                      share > 0 ? Math.max(8, Math.round(share * 100)) : 0
                                    }%`,
                                  }}
                                />
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>
      </main>
      <Footer />
      {isLogoutConfirmOpen && user && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 px-4"
          onClick={(event) => {
            if (event.target === event.currentTarget) {
              setIsLogoutConfirmOpen(false);
            }
          }}
        >
          <div
            className="w-full max-w-sm overflow-hidden rounded-2xl border border-zinc-200 bg-white shadow-xl"
            onClick={(event) => {
              event.stopPropagation();
            }}
          >
            <div className="h-1 w-full bg-[linear-gradient(to_right,var(--primary-400),var(--primary-500),var(--primary-400))]" />
            <div className="p-5 text-center">
              <div className="mx-auto mb-3 flex h-10 w-10 items-center justify-center rounded-full bg-red-50">
                <div className="flex h-6 w-6 items-center justify-center rounded-full bg-red-500 text-[14px] font-semibold text-white">
                  !
                </div>
              </div>
              <p className="text-[11px] font-medium text-red-600">Confirm log out</p>
              <h2 className="mt-1 text-sm font-semibold text-zinc-900">Are you sure you want to log out?</h2>
              <p className="mt-2 text-[11px] text-zinc-600">
                You can always sign back in with your email or Google account. Your workspace presets stay on this device.
              </p>
              <div className="mt-4 flex justify-center gap-2">
                <button
                  type="button"
                  onClick={() => setIsLogoutConfirmOpen(false)}
                  className="inline-flex items-center justify-center rounded-full border border-zinc-200 px-3 py-1.5 text-[11px] font-medium text-zinc-700 hover:border-zinc-300 hover:bg-zinc-50"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={async () => {
                    await signOut();
                    setIsLogoutConfirmOpen(false);
                    router.push("/");
                  }}
                  className="inline-flex items-center justify-center rounded-full bg-red-500 px-3 py-1.5 text-[11px] font-semibold text-white shadow-sm hover:bg-red-600"
                >
                  Log out
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
