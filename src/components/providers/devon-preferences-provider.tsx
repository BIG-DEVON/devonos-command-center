"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import { ThemeProvider, useTheme } from "next-themes";
import {
  defaultSettings,
  normalizeSettings,
  SETTINGS_UPDATED_EVENT,
  type DevonSettings,
} from "@/lib/devon-settings";

type DevonPreferencesContextValue = {
  settings: DevonSettings;
  loaded: boolean;
  applySettings: (settings: DevonSettings) => void;
  playSound: () => void;
};

const DevonPreferencesContext =
  createContext<DevonPreferencesContextValue | null>(null);

const settingsCacheKey = "devonos:settings-cache";

function DevonPreferenceEffects({ children }: { children: React.ReactNode }) {
  const { setTheme } = useTheme();
  const setThemeRef = useRef(setTheme);
  const [settings, setSettings] = useState<DevonSettings>(defaultSettings);
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    setThemeRef.current = setTheme;
  }, [setTheme]);

  const applySettings = useCallback(
    (nextSettings: DevonSettings) => {
      const normalized = normalizeSettings(nextSettings);
      setSettings(normalized);
      setThemeRef.current(normalized.theme);

      document.documentElement.dataset.density = normalized.density;
      document.documentElement.dataset.motion = normalized.motion;
      window.localStorage.setItem(settingsCacheKey, JSON.stringify(normalized));
    },
    []
  );

  useEffect(() => {
    const cached = window.localStorage.getItem(settingsCacheKey);

    if (cached) {
      try {
        applySettings(JSON.parse(cached) as DevonSettings);
      } catch {
        window.localStorage.removeItem(settingsCacheKey);
      }
    }

    async function loadPreferences() {
      try {
        const response = await fetch("/api/settings", {
          method: "GET",
          cache: "no-store",
        });

        if (!response.ok) return;

        const data = (await response.json()) as {
          ok: boolean;
          settings?: DevonSettings;
        };

        if (data.ok && data.settings) {
          applySettings(data.settings);
        }
      } finally {
        setLoaded(true);
      }
    }

    void loadPreferences();
  }, [applySettings]);

  useEffect(() => {
    function handleSettingsUpdate(event: Event) {
      const customEvent = event as CustomEvent<DevonSettings>;
      if (customEvent.detail) applySettings(customEvent.detail);
    }

    window.addEventListener(SETTINGS_UPDATED_EVENT, handleSettingsUpdate);
    return () =>
      window.removeEventListener(SETTINGS_UPDATED_EVENT, handleSettingsUpdate);
  }, [applySettings]);

  const playSound = useCallback(() => {
    if (!settings.interfaceSounds || settings.soundVolume <= 0) return;

    const AudioContextClass =
      window.AudioContext ||
      (
        window as typeof window & {
          webkitAudioContext?: typeof AudioContext;
        }
      ).webkitAudioContext;

    if (!AudioContextClass) return;

    const context = new AudioContextClass();
    const gain = context.createGain();
    const first = context.createOscillator();
    const second = context.createOscillator();
    const start = context.currentTime;
    const volume = (settings.soundVolume / 100) * 0.12;

    first.type = "sine";
    first.frequency.setValueAtTime(523.25, start);
    first.frequency.exponentialRampToValueAtTime(659.25, start + 0.14);

    second.type = "sine";
    second.frequency.setValueAtTime(783.99, start + 0.055);

    gain.gain.setValueAtTime(0.0001, start);
    gain.gain.exponentialRampToValueAtTime(volume, start + 0.018);
    gain.gain.exponentialRampToValueAtTime(0.0001, start + 0.34);

    first.connect(gain);
    second.connect(gain);
    gain.connect(context.destination);
    first.start(start);
    second.start(start + 0.055);
    first.stop(start + 0.34);
    second.stop(start + 0.28);
    second.addEventListener("ended", () => void context.close(), {
      once: true,
    });
  }, [settings.interfaceSounds, settings.soundVolume]);

  const value = useMemo(
    () => ({ settings, loaded, applySettings, playSound }),
    [applySettings, loaded, playSound, settings]
  );

  return (
    <DevonPreferencesContext.Provider value={value}>
      {children}
    </DevonPreferencesContext.Provider>
  );
}

export function DevonPreferencesProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <ThemeProvider
      attribute="class"
      defaultTheme="system"
      enableSystem
      disableTransitionOnChange={false}
      storageKey="devonos-theme"
    >
      <DevonPreferenceEffects>{children}</DevonPreferenceEffects>
    </ThemeProvider>
  );
}

export function useDevonPreferences() {
  const context = useContext(DevonPreferencesContext);

  if (!context) {
    throw new Error(
      "useDevonPreferences must be used within DevonPreferencesProvider."
    );
  }

  return context;
}
