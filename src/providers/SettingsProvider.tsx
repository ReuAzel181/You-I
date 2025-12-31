"use client";

import { createContext, useCallback, useContext, useEffect, useState } from "react";
import { useAuth } from "@/providers/AuthProvider";
import { getSupabaseClient } from "@/lib/supabaseClient";

type AppearanceMode = "system" | "light" | "light-high-contrast" | "dark";

type SubscriptionMode = "free" | "starter" | "top";

type SettingsState = {
  appearance: AppearanceMode;
  nudgeAmount: number;
  emailNotifications: boolean;
  productUpdates: boolean;
  tipsAndGuides: boolean;
  analyticsEnabled: boolean;
  profileEmail: string;
  profileUsername: string;
  profileBio: string;
  profileStatus: string;
  profileCountry: string;
  subscriptionMode: SubscriptionMode;
  focusMode: boolean;
  profileBannerColor: "red" | "sky" | "emerald" | "violet" | "amber";
  adminUnreadInquiries: number;
};

type SettingsContextValue = SettingsState & {
  setAppearance: (mode: AppearanceMode) => void;
  setNudgeAmount: (value: number) => void;
  setEmailNotifications: (value: boolean) => void;
  setProductUpdates: (value: boolean) => void;
  setTipsAndGuides: (value: boolean) => void;
  setAnalyticsEnabled: (value: boolean) => void;
  setProfileEmail: (value: string) => void;
  setProfileUsername: (value: string) => void;
  setProfileBio: (value: string) => void;
  setProfileStatus: (value: string) => void;
  setProfileCountry: (value: string) => void;
  setSubscriptionMode: (mode: SubscriptionMode) => void;
  setFocusMode: (value: boolean) => void;
  setProfileBannerColor: (value: SettingsState["profileBannerColor"]) => void;
  setAdminUnreadInquiries: (value: number) => void;
};

function getDefaultCountryCode() {
  if (typeof window === "undefined") {
    return "US";
  }

  try {
    const language = window.navigator.language || "";
    const lower = language.toLowerCase();

    if (lower.includes("us")) {
      return "US";
    }

    if (lower.includes("gb") || lower.includes("uk")) {
      return "GB";
    }

    if (
      lower.includes("de") ||
      lower.includes("fr") ||
      lower.includes("es") ||
      lower.includes("it") ||
      lower.includes("nl")
    ) {
      return "EU";
    }

    if (lower.includes("in")) {
      return "IN";
    }

    if (lower.includes("jp")) {
      return "JP";
    }

    const match = language.match(/-([A-Za-z]{2})$/);

    if (match) {
      return match[1]?.toUpperCase() ?? "US";
    }

    return "US";
  } catch {
    return "US";
  }
}

const defaultSettings: SettingsState = {
  appearance: "system",
  nudgeAmount: 8,
  emailNotifications: true,
  productUpdates: true,
  tipsAndGuides: true,
  analyticsEnabled: false,
  profileEmail: "",
  profileUsername: "",
  profileBio: "",
  profileStatus: "online",
  profileCountry: "US",
  subscriptionMode: "starter",
  focusMode: false,
  profileBannerColor: "red",
  adminUnreadInquiries: 0,
};

const SettingsContext = createContext<SettingsContextValue | undefined>(undefined);

type SettingsProviderProps = {
  children: React.ReactNode;
};

export function SettingsProvider({ children }: SettingsProviderProps) {
  const { user } = useAuth();
  const [settings, setSettings] = useState<SettingsState>(defaultSettings);
  const [hasLoadedFromStorage, setHasLoadedFromStorage] = useState(false);

  useEffect(() => {
    if (typeof window === "undefined") {
      setHasLoadedFromStorage(true);
      return;
    }

    try {
      const stored = window.localStorage.getItem("you-i-settings");

      if (!stored) {
        setHasLoadedFromStorage(true);
        return;
      }

      const parsed = JSON.parse(stored) as Partial<SettingsState>;

      setSettings({
        appearance: parsed.appearance ?? defaultSettings.appearance,
        nudgeAmount:
          typeof parsed.nudgeAmount === "number" && Number.isFinite(parsed.nudgeAmount)
            ? parsed.nudgeAmount
            : defaultSettings.nudgeAmount,
        emailNotifications:
          typeof parsed.emailNotifications === "boolean"
            ? parsed.emailNotifications
            : defaultSettings.emailNotifications,
        productUpdates:
          typeof parsed.productUpdates === "boolean"
            ? parsed.productUpdates
            : defaultSettings.productUpdates,
        tipsAndGuides:
          typeof parsed.tipsAndGuides === "boolean"
            ? parsed.tipsAndGuides
            : defaultSettings.tipsAndGuides,
        analyticsEnabled:
          typeof parsed.analyticsEnabled === "boolean"
            ? parsed.analyticsEnabled
            : defaultSettings.analyticsEnabled,
        profileEmail:
          typeof parsed.profileEmail === "string"
            ? parsed.profileEmail
            : defaultSettings.profileEmail,
        profileUsername:
          typeof parsed.profileUsername === "string"
            ? parsed.profileUsername
            : defaultSettings.profileUsername,
        profileBio:
          typeof parsed.profileBio === "string" ? parsed.profileBio : defaultSettings.profileBio,
        profileStatus:
          parsed.profileStatus === "online" ||
          parsed.profileStatus === "idle" ||
          parsed.profileStatus === "offline"
            ? parsed.profileStatus
            : defaultSettings.profileStatus,
        profileCountry:
          typeof parsed.profileCountry === "string"
            ? parsed.profileCountry
            : getDefaultCountryCode(),
        subscriptionMode:
          parsed.subscriptionMode === "free" ||
          parsed.subscriptionMode === "starter" ||
          parsed.subscriptionMode === "top"
            ? parsed.subscriptionMode
            : defaultSettings.subscriptionMode,
        focusMode:
          typeof parsed.focusMode === "boolean" ? parsed.focusMode : defaultSettings.focusMode,
        profileBannerColor:
          parsed.profileBannerColor === "red" ||
          parsed.profileBannerColor === "emerald" ||
          parsed.profileBannerColor === "violet" ||
          parsed.profileBannerColor === "amber" ||
          parsed.profileBannerColor === "sky"
            ? parsed.profileBannerColor
            : defaultSettings.profileBannerColor,
        adminUnreadInquiries:
          typeof parsed.adminUnreadInquiries === "number" &&
          Number.isFinite(parsed.adminUnreadInquiries) &&
          parsed.adminUnreadInquiries >= 0
            ? parsed.adminUnreadInquiries
            : defaultSettings.adminUnreadInquiries,
      });
    } catch {
    } finally {
      setHasLoadedFromStorage(true);
    }
  }, []);

  useEffect(() => {
    if (typeof window === "undefined" || !hasLoadedFromStorage) {
      return;
    }

    window.localStorage.setItem("you-i-settings", JSON.stringify(settings));
  }, [settings, hasLoadedFromStorage]);

  useEffect(() => {
    if (typeof document === "undefined") {
      return;
    }

    const root = document.documentElement;
    const mode = settings.appearance;

    if (mode === "system") {
      root.removeAttribute("data-theme");
      return;
    }

    root.setAttribute("data-theme", mode);
  }, [settings.appearance]);

  useEffect(() => {
    if (typeof document === "undefined") {
      return;
    }

    const root = document.documentElement;
    root.setAttribute("data-accent", settings.profileBannerColor);
  }, [settings.profileBannerColor]);

  useEffect(() => {
    if (!user) {
      return;
    }

    const run = async () => {
      const supabase = getSupabaseClient();
      const email = user.email ?? null;

      if (!email) {
        return;
      }

      const { data, error } = await supabase
        .from("users")
        .select("id, country, subscription_mode")
        .eq("email", email)
        .maybeSingle();

      if (error) {
        return;
      }

      let nextCountry = (data?.country as string | null | undefined) ?? null;
      const rawSubscriptionMode =
        (data?.subscription_mode as string | null | undefined) ?? null;
      let nextSubscriptionMode: SubscriptionMode | null = null;

      if (
        rawSubscriptionMode === "free" ||
        rawSubscriptionMode === "starter" ||
        rawSubscriptionMode === "top"
      ) {
        nextSubscriptionMode = rawSubscriptionMode;
      }

      if (!nextCountry || nextCountry === "Unknown") {
        let inferred: string | null = null;

        try {
          const response = await fetch("https://ipapi.co/json/");

          if (response.ok) {
            const json = (await response.json()) as { country_code?: string | null };

            if (json.country_code && typeof json.country_code === "string") {
              inferred = json.country_code.toUpperCase();
            }
          }
        } catch {
        }

        if (!inferred) {
          inferred = getDefaultCountryCode();
        }

        nextCountry = inferred;

        if (nextCountry) {
          await supabase
            .from("users")
            .update({ country: nextCountry })
            .eq("id", user.id);
        }
      }

      setSettings((current) => {
        let changed = false;
        let draft = current;

        if (nextCountry && current.profileCountry !== nextCountry) {
          draft = {
            ...draft,
            profileCountry: nextCountry as string,
          };
          changed = true;
        }

        if (nextSubscriptionMode && current.subscriptionMode !== nextSubscriptionMode) {
          if (!changed) {
            draft = {
              ...draft,
            };
            changed = true;
          }

          draft.subscriptionMode = nextSubscriptionMode;
        }

        if (!changed) {
          return current;
        }

        return draft;
      });
    };

    void run();
  }, [user]);

  const setAppearance = (mode: AppearanceMode) => {
    setSettings((current) => ({
      ...current,
      appearance: mode,
    }));
  };

  const setNudgeAmount = (value: number) => {
    const next = Number.isFinite(value) && value > 0 ? value : defaultSettings.nudgeAmount;

    setSettings((current) => ({
      ...current,
      nudgeAmount: next,
    }));
  };

  const setEmailNotifications = (value: boolean) => {
    setSettings((current) => ({
      ...current,
      emailNotifications: value,
    }));
  };

  const setProductUpdates = (value: boolean) => {
    setSettings((current) => ({
      ...current,
      productUpdates: value,
    }));
  };

  const setTipsAndGuides = (value: boolean) => {
    setSettings((current) => ({
      ...current,
      tipsAndGuides: value,
    }));
  };

  const setAnalyticsEnabled = (value: boolean) => {
    setSettings((current) => ({
      ...current,
      analyticsEnabled: value,
    }));
  };

  const setProfileEmail = (value: string) => {
    setSettings((current) => ({
      ...current,
      profileEmail: value,
    }));
  };

  const setProfileUsername = (value: string) => {
    setSettings((current) => ({
      ...current,
      profileUsername: value,
    }));
  };

  const setProfileBio = (value: string) => {
    setSettings((current) => ({
      ...current,
      profileBio: value,
    }));
  };

  const setProfileStatus = (value: string) => {
    setSettings((current) => ({
      ...current,
      profileStatus: value,
    }));
  };

  const setProfileCountry = (value: string) => {
    setSettings((current) => ({
      ...current,
      profileCountry: value,
    }));
  };

  const setProfileBannerColor = (value: SettingsState["profileBannerColor"]) => {
    setSettings((current) => ({
      ...current,
      profileBannerColor: value,
    }));
  };

  const setSubscriptionMode = (mode: SubscriptionMode) => {
    setSettings((current) => ({
      ...current,
      subscriptionMode: mode,
    }));
  };

  const setFocusMode = (value: boolean) => {
    setSettings((current) => ({
      ...current,
      focusMode: value,
    }));
  };

  const setAdminUnreadInquiries = (value: number) => {
    const next =
      typeof value === "number" && Number.isFinite(value) && value >= 0 ? value : 0;

    setSettings((current) => ({
      ...current,
      adminUnreadInquiries: next,
    }));
  };

  const value: SettingsContextValue = {
    ...settings,
    setAppearance,
    setNudgeAmount,
    setEmailNotifications,
    setProductUpdates,
    setTipsAndGuides,
    setAnalyticsEnabled,
    setProfileEmail,
    setProfileUsername,
    setProfileBio,
    setProfileStatus,
    setProfileCountry,
    setSubscriptionMode,
    setFocusMode,
    setProfileBannerColor,
    setAdminUnreadInquiries,
  };

  return <SettingsContext.Provider value={value}>{children}</SettingsContext.Provider>;
}

export function useSettings() {
  const context = useContext(SettingsContext);

  if (!context) {
    throw new Error("useSettings must be used within a SettingsProvider");
  }

  return context;
}

export function useAnalytics() {
  const { analyticsEnabled } = useSettings();

  const trackEvent = useCallback(
    (name: string, properties?: Record<string, unknown>) => {
      if (!analyticsEnabled || typeof window === "undefined") {
        return;
      }

      const payload = {
        name,
        properties: properties ?? {},
        timestamp: new Date().toISOString(),
      };

      try {
        const raw = window.localStorage.getItem("you-i-analytics-log");
        const existing = raw ? (JSON.parse(raw) as unknown[]) : [];
        const next = [...existing, payload].slice(-200);

        window.localStorage.setItem("you-i-analytics-log", JSON.stringify(next));
      } catch {
        // ignore storage errors
      }
    },
    [analyticsEnabled],
  );

  return { analyticsEnabled, trackEvent };
}
