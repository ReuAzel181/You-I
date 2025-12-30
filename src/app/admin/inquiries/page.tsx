"use client";

import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { useAuth } from "@/providers/AuthProvider";
import { useAnalytics } from "@/providers/SettingsProvider";
import { getSupabaseClient } from "@/lib/supabaseClient";

type AdminInquiryRow = {
  id: string;
  full_name: string | null;
  email: string | null;
  team_size: string | null;
  topic: string | null;
  usage: string | null;
  message: string | null;
  is_read: boolean | null;
  created_at: string | null;
};

export default function AdminInquiriesPage() {
  const { user, isLoading } = useAuth();
  const { analyticsEnabled, trackEvent } = useAnalytics();
  const [inquiries, setInquiries] = useState<AdminInquiryRow[]>([]);
  const [isAdmin, setIsAdmin] = useState(false);
  const [hasCheckedAdmin, setHasCheckedAdmin] = useState(false);
  const [isLoadingData, setIsLoadingData] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [updatingInquiryId, setUpdatingInquiryId] = useState<string | null>(null);
  const [segmentStyle, setSegmentStyle] = useState<{ left: number; width: number } | null>(
    null,
  );

  const toggleContainerRef = useRef<HTMLDivElement | null>(null);
  const overviewLinkRef = useRef<HTMLAnchorElement | null>(null);
  const inquiriesLinkRef = useRef<HTMLAnchorElement | null>(null);

  const unreadCount = inquiries.filter((item) => !item.is_read).length;

  useEffect(() => {
    if (!analyticsEnabled) {
      return;
    }

    trackEvent("view_admin_inquiries", { path: "/admin/inquiries" });
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
        const { data, error: roleError } = await supabase
          .from("users")
          .select("role")
          .eq("id", user.id)
          .maybeSingle();

        if (roleError) {
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

    const loadInquiries = async () => {
      setIsLoadingData(true);
      setError(null);

      try {
        const supabase = getSupabaseClient();
        const { data, error: inquiriesError } = await supabase
          .from("inquiries")
          .select("id, full_name, email, team_size, topic, usage, message");

        if (inquiriesError) {
          setError("Unable to load inquiries right now.");
          return;
        }

        if (data) {
          setInquiries(data as AdminInquiryRow[]);
        }
      } catch {
        setError("Something went wrong while loading inquiries.");
      } finally {
        setIsLoadingData(false);
      }
    };

    void loadInquiries();
  }, [isAdmin]);

  const handleToggleRead = async (id: string, nextIsRead: boolean) => {
    try {
      setUpdatingInquiryId(id);
      const supabase = getSupabaseClient();

      const { error: updateError } = await supabase
        .from("inquiries")
        .update({ is_read: nextIsRead })
        .eq("id", id);

      if (updateError) {
        setError("Unable to update inquiry status right now.");
        return;
      }

      setInquiries((current) =>
        current.map((item) =>
          item.id === id ? { ...item, is_read: nextIsRead } : item,
        ),
      );
    } catch {
      setError("Something went wrong while updating the inquiry status.");
    } finally {
      setUpdatingInquiryId(null);
    }
  };

  const isInquiriesActive = true;

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
  }, [isInquiriesActive, unreadCount]);

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
                    Inquiries
                  </h1>
                  <p className="max-w-2xl text-sm leading-relaxed text-zinc-600">
                    Messages sent from the contact page, including team context and topics.
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
                    <span className="relative inline-flex items-center">
                      <span>Inquiries</span>
                      {unreadCount > 0 && (
                        <span className="pointer-events-none absolute -top-1.5 right-[-6px] inline-flex h-2 w-2 rounded-full bg-red-500 shadow-sm" />
                      )}
                    </span>
                  </Link>
                </div>
              </div>
            </div>
          </div>
        </section>
        <section className="bg-[var(--background)]">
          <div className="admin-section-intro mx-auto max-w-6xl px-4 pb-12 md:px-8 md:pt-4">
            {!hasCheckedAdmin || isLoading ? null : !isAdmin ? (
              <div className="rounded-2xl border border-dashed border-zinc-200 bg-zinc-50 p-5 text-[11px] text-zinc-600 sm:p-6">
                This page is only available to admin accounts.
              </div>
            ) : (
              <div className="space-y-4">
                <div className="rounded-2xl border border-zinc-200 bg-white p-5 shadow-sm sm:p-6">
                  <div className="mb-3 flex items-center justify-between gap-3">
                    <div className="space-y-1">
                      <p className="text-xs font-medium text-zinc-500">Inbox</p>
                      <h2 className="text-sm font-semibold text-zinc-900">
                        Contact inquiries
                      </h2>
                      <p className="text-[11px] text-zinc-500">
                        These messages are sent from the contact page and include team size, topic, and usage context.
                      </p>
                    </div>
                    <div className="inline-flex items-center gap-2 rounded-full bg-zinc-50 px-3 py-1 text-[10px] font-medium text-zinc-600">
                      <span
                        className={`h-1.5 w-1.5 rounded-full ${
                          unreadCount > 0 ? "bg-red-500" : "bg-emerald-400"
                        }`}
                      />
                      <span>
                        {inquiries.length === 1
                          ? "1 inquiry"
                          : `${inquiries.length} inquiries`}
                      </span>
                      {unreadCount > 0 && (
                        <span className="text-[10px] font-semibold text-red-600">
                          {unreadCount} unread
                        </span>
                      )}
                    </div>
                  </div>
                  {error && (
                    <p className="mb-3 text-[10px] font-medium text-red-600">
                      {error}
                    </p>
                  )}
                  {isLoadingData && (
                    <p className="text-[11px] text-zinc-500">Loading inquiries…</p>
                  )}
                  {!isLoadingData && inquiries.length === 0 && !error && (
                    <p className="text-[11px] text-zinc-500">
                      No inquiries have been received yet.
                    </p>
                  )}
                  {!isLoadingData && inquiries.length > 0 && (
                    <div className="mt-2 space-y-2">
                      {inquiries.map((item) => {
                        const isRead = !!item.is_read;

                        return (
                          <div
                            key={item.id}
                            className={`flex flex-col gap-3 rounded-xl border px-4 py-3 text-[11px] sm:flex-row sm:items-start sm:justify-between ${
                              isRead
                                ? "border-zinc-200 bg-zinc-50 text-zinc-700"
                                : "border-violet-200 bg-violet-50 text-zinc-800"
                            }`}
                          >
                            <div className="min-w-0 flex-1 space-y-2">
                              <div className="flex flex-wrap items-center gap-2">
                                <p className="font-medium text-zinc-900">
                                  {item.full_name || "Unknown sender"}
                                </p>
                                {item.email && (
                                  <span className="rounded-full border border-zinc-200 bg-white px-2 py-0.5 text-[10px] text-zinc-700">
                                    {item.email}
                                  </span>
                                )}
                                <span
                                  className={`inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[10px] font-medium ${
                                    isRead
                                      ? "bg-zinc-100 text-zinc-600"
                                      : "bg-violet-600 text-white"
                                  }`}
                                >
                                  {!isRead && (
                                    <span className="h-1.5 w-1.5 rounded-full bg-white" />
                                  )}
                                  <span>{isRead ? "Read" : "Unread"}</span>
                                </span>
                              </div>
                              <div className="flex flex-wrap items-center gap-2 text-[10px] text-zinc-500">
                                {item.team_size && (
                                  <span className="rounded-full bg-zinc-100 px-2 py-0.5">
                                    Team size: {item.team_size}
                                  </span>
                                )}
                                {item.topic && (
                                  <span className="rounded-full bg-zinc-100 px-2 py-0.5">
                                    Topic: {item.topic}
                                  </span>
                                )}
                                {item.usage && (
                                  <span className="rounded-full bg-zinc-100 px-2 py-0.5">
                                    Usage: {item.usage}
                                  </span>
                                )}
                                {item.created_at && (
                                  <span className="text-zinc-400">
                                    {new Date(item.created_at).toLocaleString()}
                                  </span>
                                )}
                              </div>
                              {item.message && (
                                <div className="mt-1 rounded-xl border border-zinc-200 bg-white/80 px-3 py-2 text-[11px] leading-relaxed text-zinc-800 shadow-[0_1px_0_rgba(0,0,0,0.02)]">
                                  <p className="whitespace-pre-wrap">{item.message}</p>
                                </div>
                              )}
                            </div>
                            <div className="flex items-start gap-2">
                              <button
                                type="button"
                                disabled={updatingInquiryId === item.id}
                                onClick={() => handleToggleRead(item.id, !isRead)}
                                className="inline-flex items-center justify-center rounded-full border border-zinc-200 bg-white px-3 py-1 text-[10px] font-medium text-zinc-700 hover:border-violet-300 hover:bg-violet-50 disabled:opacity-60"
                              >
                                {isRead ? "Mark as unread" : "Mark as read"}
                              </button>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>
        </section>
      </main>
      <Footer />
    </div>
  );
}
