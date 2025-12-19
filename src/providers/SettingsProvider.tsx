"use client";

import { createContext, useCallback, useContext, useEffect, useState } from "react";

type AppearanceMode = "system" | "light" | "light-high-contrast" | "dark";

type SettingsState = {
  appearance: AppearanceMode;
  nudgeAmount: number;
  emailNotifications: boolean;
  productUpdates: boolean;
  tipsAndGuides: boolean;
  analyticsEnabled: boolean;
};

type SettingsContextValue = SettingsState & {
  setAppearance: (mode: AppearanceMode) => void;
  setNudgeAmount: (value: number) => void;
  setEmailNotifications: (value: boolean) => void;
  setProductUpdates: (value: boolean) => void;
  setTipsAndGuides: (value: boolean) => void;
  setAnalyticsEnabled: (value: boolean) => void;
};

const defaultSettings: SettingsState = {
  appearance: "system",
  nudgeAmount: 8,
  emailNotifications: true,
  productUpdates: true,
  tipsAndGuides: true,
  analyticsEnabled: false,
};

const SettingsContext = createContext<SettingsContextValue | undefined>(undefined);

type SettingsProviderProps = {
  children: React.ReactNode;
};

export function SettingsProvider({ children }: SettingsProviderProps) {
  const [settings, setSettings] = useState<SettingsState>(() => {
    if (typeof window === "undefined") {
      return defaultSettings;
    }

    try {
      const stored = window.localStorage.getItem("you-i-settings");

      if (!stored) {
        return defaultSettings;
      }

      const parsed = JSON.parse(stored) as Partial<SettingsState>;

      return {
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
      };
    } catch {
      return defaultSettings;
    }
  });

  useEffect(() => {
    if (typeof window === "undefined") {
      return;
    }

    window.localStorage.setItem("you-i-settings", JSON.stringify(settings));
  }, [settings]);

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

  const value: SettingsContextValue = {
    ...settings,
    setAppearance,
    setNudgeAmount,
    setEmailNotifications,
    setProductUpdates,
    setTipsAndGuides,
    setAnalyticsEnabled,
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
