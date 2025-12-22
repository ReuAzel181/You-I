"use client";

import { useEffect, useMemo } from "react";
import { useRouter } from "next/navigation";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { useAuth } from "@/providers/AuthProvider";
import { useAnalytics } from "@/providers/SettingsProvider";

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

export default function AnalyticsPage() {
  const router = useRouter();
  const { user, isLoading } = useAuth();
  const { analyticsEnabled, trackEvent } = useAnalytics();

  useEffect(() => {
    if (isLoading) {
      return;
    }

    if (!user) {
      router.replace("/");
    }
  }, [isLoading, user, router]);

  useEffect(() => {
    if (!analyticsEnabled) {
      return;
    }

    trackEvent("view_analytics", { path: "/analytics" });
  }, [analyticsEnabled, trackEvent]);

  const entries: AnalyticsEntry[] = (() => {
    if (typeof window === "undefined") {
      return [];
    }

    try {
      const raw = window.localStorage.getItem("you-i-analytics-log");

      if (!raw) {
        return [];
      }

      const parsed = JSON.parse(raw) as unknown[];

      return parsed
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
    } catch {
      return [];
    }
  })();

  const totalEvents = entries.length;

  const categorySummary = useMemo<CategorySummaryItem[]>(() => {
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

      if (
        path === "/" ||
        path === "/solutions" ||
        path === "/resources" ||
        path === "/pricing"
      ) {
        return "marketing";
      }

      if (path === "/analytics") {
        return "analytics";
      }

      return "other";
    };

    for (const entry of entries) {
      const category = getCategory(entry);
      counts.set(category, (counts.get(category) ?? 0) + 1);
    }

    const palette: Record<AnalyticsCategory, { label: string; color: string }> = {
      tools: { label: "Tools", color: "#f97316" },
      workspace: { label: "Workspace", color: "#22c55e" },
      settings: { label: "Settings", color: "#6366f1" },
      marketing: { label: "Marketing pages", color: "#ef4444" },
      analytics: { label: "Analytics", color: "#0ea5e9" },
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
  }, [entries]);

  const toolSummary = useMemo<ToolSummaryItem[]>(() => {
    const counts = new Map<string, number>();

    for (const entry of entries) {
      const rawPath = entry.properties.path;
      const path = typeof rawPath === "string" ? rawPath : "";

      if (!path.startsWith("/tools/")) {
        continue;
      }

      counts.set(path, (counts.get(path) ?? 0) + 1);
    }

    const labelForPath = (path: string) => {
      if (path === "/tools/color-contrast-checker") {
        return "Color contrast checker";
      }

      if (path === "/tools/ratio-calculator") {
        return "Ratio calculator";
      }

      if (path === "/tools/em-to-percent-converter") {
        return "EM to percent converter";
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
  }, [entries]);

  const toolTimeline = (() => {
    const dateBuckets = new Map<string, Map<string, number>>();

    for (const entry of entries) {
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

    if (dateBuckets.size === 0 || toolSummary.length === 0) {
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

    const palette = ["#ef4444", "#0ea5e9", "#22c55e", "#a855f7"];
    const topTools = toolSummary.slice(0, 4);

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

  const toolTimelineCoordinates = (() => {
    if (toolTimeline.series.length === 0 || toolTimeline.maxCount === 0) {
      return [];
    }

    const innerWidth =
      TOOL_CHART_WIDTH - TOOL_CHART_Y_AXIS_LABEL_WIDTH - TOOL_CHART_PADDING_X;
    const innerHeight = TOOL_CHART_HEIGHT - TOOL_CHART_PADDING_Y * 2;

    if (innerWidth <= 0 || innerHeight <= 0) {
      return [];
    }

    const step =
      toolTimeline.dateKeys.length === 1
        ? 0
        : innerWidth / (toolTimeline.dateKeys.length - 1);

    const chartMax = TOOL_CHART_MAX_VALUE;

    return toolTimeline.series.map((series) => {
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

  const toolTimelineGridLines = (() => {
    if (toolTimeline.series.length === 0 || toolTimeline.maxCount === 0) {
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

  const toolTimelineGridLineValues = (() => {
    if (toolTimeline.series.length === 0 || toolTimeline.maxCount === 0) {
      return [];
    }

    return TOOL_CHART_GRID_FRACTIONS.map((fraction) =>
      Math.round(TOOL_CHART_MAX_VALUE * (1 - fraction)),
    );
  })();

  const toolTimelineXAxisTicks = (() => {
    if (toolTimeline.series.length === 0 || toolTimeline.maxCount === 0) {
      return [];
    }

    const innerWidth =
      TOOL_CHART_WIDTH - TOOL_CHART_Y_AXIS_LABEL_WIDTH - TOOL_CHART_PADDING_X;

    if (innerWidth <= 0) {
      return [];
    }

    const count = toolTimeline.dateKeys.length;

    if (count === 0) {
      return [];
    }

    const step = count === 1 ? 0 : innerWidth / (count - 1);

    return toolTimeline.dateKeys.map(
      (_, index) => TOOL_CHART_Y_AXIS_LABEL_WIDTH + step * index,
    );
  })();

  const maxToolCount = toolSummary.reduce(
    (max, item) => (item.count > max ? item.count : max),
    0,
  );

  const totalToolEvents = toolSummary.reduce(
    (sum, item) => sum + item.count,
    0,
  );

  const pieStyle = (() => {
    if (categorySummary.length === 0 || totalEvents === 0) {
      return {};
    }

    let currentAngle = 0;
    const segments: string[] = [];
    const lastIndex = categorySummary.length - 1;

    categorySummary.forEach((item, index) => {
      const share = item.count / totalEvents;
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

  const hasData = entries.length > 0;

  return (
    <div className="min-h-screen font-sans bg-[var(--background)] text-[var(--foreground)]">
      <Header />
      <main>
        <section className="border-b border-zinc-200 bg-white/80">
          <div className="mx-auto flex max-w-6xl items-center justify-between px-4 py-6 md:px-8 md:py-8">
            <div className="space-y-2">
              <div className="inline-flex items-center gap-2 rounded-full border border-red-100 bg-red-50 px-3 py-1 text-[11px] font-medium text-red-600">
                <span className="h-1.5 w-1.5 rounded-full bg-red-500" />
                Analytics
              </div>
              <h1 className="text-2xl font-semibold tracking-tight text-zinc-900 sm:text-3xl">
                Usage analytics for this browser
              </h1>
              <p className="max-w-2xl text-sm leading-relaxed text-zinc-600">
                See a quick summary of which pages and tools you have opened recently. These logs
                are stored locally in this browser and only appear when basic analytics are enabled
                in your settings.
              </p>
            </div>
          </div>
        </section>
        <section className="py-8 md:py-10">
          <div className="mx-auto flex max-w-6xl flex-col gap-6 px-4 md:flex-row md:px-8">
            <div className="flex-1 space-y-4">
              <div className="rounded-2xl border border-zinc-200 bg-white p-5 shadow-sm sm:p-6">
                <h2 className="text-sm font-semibold text-zinc-900">Event overview</h2>
                <p className="mt-1 text-[11px] leading-relaxed text-zinc-600">
                  A quick breakdown of recent analytics events from this browser, grouped by where
                  they happened.
                </p>
                {!hasData && (
                  <p className="mt-4 rounded-lg border border-dashed border-zinc-200 bg-zinc-50 px-3 py-2 text-[11px] text-zinc-600">
                    There are no analytics events recorded yet. Turn on basic usage analytics in
                    your settings, then browse tools and pages to see activity appear here.
                  </p>
                )}
                {hasData && (
                  <div className="mt-4 flex flex-col gap-4 md:flex-row md:items-center">
                    <div className="flex w-full justify-center md:w-auto">
                      <div className="relative h-36 w-36 rounded-full bg-zinc-100" style={pieStyle}>
                        <div className="absolute inset-7 rounded-full bg-white" />
                        <div className="absolute inset-0 flex items-center justify-center text-center">
                          <div className="px-4">
                            <p className="text-[10px] font-medium text-zinc-500">Events</p>
                            <p className="text-base font-semibold text-zinc-900">
                              {totalEvents.toLocaleString()}
                            </p>
                            <p className="mt-0.5 text-[10px] text-zinc-500">
                              Last {entries.length} recorded in this browser
                            </p>
                          </div>
                        </div>
                      </div>
                    </div>
                    <div className="flex-1 space-y-1.5 text-[11px]">
                      {categorySummary.map((item) => {
                        const share = item.count / totalEvents;
                        const percent = Math.round(share * 100);

                        return (
                          <div
                            key={item.id}
                            className="flex items-center justify-between gap-3 rounded-lg border border-zinc-100 bg-zinc-50 px-3 py-1.5 text-zinc-700"
                          >
                            <div className="flex items-center gap-2">
                              <span
                                className="h-2.5 w-2.5 rounded-full"
                                style={{ backgroundColor: item.color }}
                              />
                              <span className="font-medium">{item.label}</span>
                            </div>
                            <div className="flex items-center gap-2 text-[10px] text-zinc-500">
                              <span className="rounded-full bg-white px-2 py-0.5 font-semibold">
                                {item.count}
                              </span>
                              <span>{percent}%</span>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                )}
              </div>
              <div className="rounded-2xl border border-zinc-200 bg-white p-5 shadow-sm sm:p-6">
                <h2 className="text-sm font-semibold text-zinc-900">Tool usage over time</h2>
                <p className="mt-1 text-[11px] leading-relaxed text-zinc-600">
                  Daily opens for the most used tools in this browser.
                </p>
                {toolTimeline.series.length === 0 && (
                  <p className="mt-4 rounded-lg border border-dashed border-zinc-200 bg-zinc-50 px-3 py-2 text-[11px] text-zinc-600">
                    Open tools on different days to see how usage changes over time.
                  </p>
                )}
                {toolTimeline.series.length > 0 && toolTimeline.maxCount > 0 && (
                  <div className="mt-4">
                    <div className="flex items-center justify-between text-[11px] text-zinc-500">
                      <span>
                        Last {toolTimeline.dateKeys.length} day
                        {toolTimeline.dateKeys.length === 1 ? "" : "s"}
                      </span>
                      <span>
                        Peak: {toolTimeline.maxCount} open
                        {toolTimeline.maxCount === 1 ? "" : "s"} in a day
                      </span>
                    </div>
                    <div className="mt-3 rounded-xl border border-zinc-100 bg-zinc-50 px-3 py-3">
                      <svg
                        viewBox={`0 0 ${TOOL_CHART_WIDTH} ${TOOL_CHART_HEIGHT}`}
                        className="h-48 w-full"
                        preserveAspectRatio="none"
                      >
                        <g
                          className="w-full align-left"
                          fontSize={7}
                          fill="rgba(148, 163, 184, 0.7)"
                          textAnchor="end"
                        >
                          {toolTimelineGridLines.map((y, index) => (
                            <text
                              key={index}
                              x={TOOL_CHART_Y_AXIS_LABEL_WIDTH - 16}
                              y={y}
                              dominantBaseline="middle"
                            >
                              {toolTimelineGridLineValues[index] ?? ""}
                            </text>
                          ))}
                          <text
                            x={TOOL_CHART_Y_AXIS_LABEL_WIDTH - 16}
                            y={TOOL_CHART_HEIGHT - TOOL_CHART_PADDING_Y}
                            dominantBaseline="middle"
                          >
                            0
                          </text>
                        </g>
                        <g strokeLinecap="round">
                          {toolTimelineGridLines.map((y, index) => (
                            <line
                              key={index}
                              x1={TOOL_CHART_Y_AXIS_LABEL_WIDTH}
                              x2={TOOL_CHART_WIDTH}
                              y1={y}
                              y2={y}
                              stroke="rgba(148, 163, 184, 0.18)"
                              strokeWidth={1}
                            />
                          ))}
                          {toolTimelineXAxisTicks.map((x, index) => (
                            <line
                              key={`v-${index}`}
                              x1={x}
                              x2={x}
                              y1={TOOL_CHART_PADDING_Y}
                              y2={TOOL_CHART_HEIGHT - TOOL_CHART_PADDING_Y}
                              stroke="rgba(148, 163, 184, 0.12)"
                              strokeWidth={0.75}
                              strokeDasharray="2 3"
                            />
                          ))}
                          <line
                            x1={TOOL_CHART_Y_AXIS_LABEL_WIDTH}
                            x2={TOOL_CHART_WIDTH}
                            y1={TOOL_CHART_HEIGHT - TOOL_CHART_PADDING_Y}
                            y2={TOOL_CHART_HEIGHT - TOOL_CHART_PADDING_Y}
                            stroke="rgba(15, 23, 42, 0.22)"
                            strokeWidth={1}
                          />
                        </g>
                        {toolTimelineCoordinates.map((series, seriesIndex) => {
                          const columnCount = toolTimelineCoordinates.length;
                          const seriesOffset =
                            (seriesIndex - (columnCount - 1) / 2) * 9;

                          return (
                            <g key={series.id}>
                              {series.coordinates.map((point) => {
                                const xCenter = point.x + seriesOffset;
                                const baselineY =
                                  TOOL_CHART_HEIGHT - TOOL_CHART_PADDING_Y;
                                const height = baselineY - point.y;

                                if (height <= 0) {
                                  return null;
                                }

                                return (
                                  <g key={`${series.id}-${point.dateKey}`}>
                                    <rect
                                      x={xCenter - 5}
                                      y={point.y}
                                      width={10}
                                      height={height}
                                      rx={4}
                                      fill={series.color}
                                      opacity={0.85}
                                    />
                                    {point.count > 0 && (
                                      <text
                                        x={xCenter}
                                        y={point.y - 4}
                                        textAnchor="middle"
                                        fontSize={7}
                                        fill="rgba(15,23,42,0.55)"
                                      >
                                        {point.count}
                                      </text>
                                    )}
                                  </g>
                                );
                              })}
                            </g>
                          );
                        })}
                      </svg>
                      <div className="mt-2 flex justify-between text-[10px] text-zinc-500">
                        {toolTimeline.dateLabels.map((label, index) => (
                          <span key={toolTimeline.dateKeys[index]}>{label}</span>
                        ))}
                      </div>
                      <div className="mt-3 flex flex-wrap gap-2 text-[10px] text-zinc-600">
                        {toolTimelineCoordinates.map((series) => (
                          <div
                            key={series.id}
                            className="inline-flex items-center gap-1 rounded-full bg-white px-2 py-0.5"
                          >
                            <span
                              className="h-2 w-2 rounded-full"
                              style={{ backgroundColor: series.color }}
                            />
                            <span>{series.label}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </div>
            <div className="w-full space-y-4 md:w-[340px]">
              <div className="rounded-2xl border border-zinc-200 bg-white p-5 text-[11px] leading-relaxed text-zinc-600 shadow-sm sm:p-6">
                <h2 className="text-sm font-semibold text-zinc-900">Tool usage</h2>
                <p className="mt-1">
                  See how often each tool has been opened recently from this browser.
                </p>
                {toolSummary.length === 0 && (
                  <p className="mt-3 rounded-lg border border-dashed border-zinc-200 bg-zinc-50 px-3 py-2">
                    Open any tool to see its usage appear here.
                  </p>
                )}
                {toolSummary.length > 0 && (
                  <div className="mt-3 space-y-1.5">
                        {toolSummary.map((item) => {
                          const share =
                            maxToolCount > 0 ? item.count / maxToolCount : 0;
                          const percent =
                        totalToolEvents > 0
                          ? Math.round((item.count / totalToolEvents) * 100)
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
                            <span className="text-[10px] text-zinc-500">
                              {percent}%
                            </span>
                          </div>
                          <div className="h-1.5 rounded-full bg-zinc-200">
                            <div
                              className="h-1.5 rounded-full bg-red-500"
                              style={{
                                width: `${
                                  share > 0
                                    ? Math.max(8, Math.round(share * 100))
                                    : 0
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
              <div className="rounded-2xl border border-zinc-200 bg-white p-5 text-[11px] leading-relaxed text-zinc-600 shadow-sm sm:p-6">
                <h2 className="text-sm font-semibold text-zinc-900">
                  What this page shows
                </h2>
                <p className="mt-1">
                  Analytics in YOU-I are intentionally simple. When enabled, pages and tools log
                  lightweight events like which screens you open and when that happens.
                </p>
                <ul className="mt-3 space-y-1.5">
                  <li className="flex items-start gap-2">
                    <span className="mt-1 h-1.5 w-1.5 rounded-full bg-red-500" />
                    <span>
                      Events are stored in your browser under a single log and are not sent to a
                      backend service.
                    </span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="mt-1 h-1.5 w-1.5 rounded-full bg-red-500" />
                    <span>
                      You can clear analytics data at any time by clearing your browser&apos;s site
                      data for YOU-I.
                    </span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="mt-1 h-1.5 w-1.5 rounded-full bg-red-500" />
                    <span>
                      Turning analytics off in settings stops new events from being added to this
                      log.
                    </span>
                  </li>
                </ul>
              </div>
            </div>
          </div>
        </section>
      </main>
      <Footer />
    </div>
  );
}
