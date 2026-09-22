export type DevonTheme = "light" | "dark" | "system";
export type DevonDensity = "comfortable" | "compact";
export type DevonMotion = "system" | "full" | "reduced";
export type DevonTone =
  | "Premium"
  | "Official"
  | "Warm"
  | "Bold"
  | "Simple"
  | "Luxury"
  | "Professional";
export type DevonMode = "Personal" | "Work" | "Executive" | "Creative";
export type WeekStartsOn = "monday" | "sunday";

export type DevonSettings = {
  displayName: string;
  roleTitle: string;
  organization: string;
  defaultTone: DevonTone;
  defaultMode: DevonMode;
  signature: string;
  brandDirection: string;
  designRules: string;
  writingRules: string;
  postingRules: string;
  systemNotes: string;
  theme: DevonTheme;
  density: DevonDensity;
  motion: DevonMotion;
  interfaceSounds: boolean;
  soundVolume: number;
  inAppNotifications: boolean;
  browserNotifications: boolean;
  emailNotifications: boolean;
  smsNotifications: boolean;
  notificationEmail: string;
  notificationPhone: string;
  externalMinimumSeverity: "info" | "warning" | "critical";
  quietHoursEnabled: boolean;
  quietHoursStart: string;
  quietHoursEnd: string;
  dailyBriefTime: string;
  timezone: string;
  weekStartsOn: WeekStartsOn;
  confirmDestructiveTasks: boolean;
  updatedAt: string;
};

export const defaultSettings: DevonSettings = {
  displayName: "Big Devon",
  roleTitle: "Communications Intelligence Lead",
  organization: "Morrow",
  defaultTone: "Premium",
  defaultMode: "Work",
  signature: "Big Devon",
  brandDirection:
    "Premium white interface, soft platinum depth, deep ink text, blue-violet accents, champagne highlights, elegant spacing, and no green.",
  designRules:
    "Use clean negative space, refined typography, subtle glass effects, cinematic cards, soft shadows, and premium editorial layouts. Avoid clutter, fake logos, random data, and cheap AI-looking designs.",
  writingRules:
    "Write with clarity, confidence, polish, and structure. Keep official messages respectful, concise, and easy to understand.",
  postingRules:
    "Review captions before posting. Confirm sensitive details. Keep public communication accurate, calm, and professional.",
  systemNotes:
    "Morrow is currently private and local-first. Hosted access, role-based accounts, scheduled intelligence, integrations, and secure file storage will be enabled through the production rollout.",
  theme: "system",
  density: "comfortable",
  motion: "system",
  interfaceSounds: true,
  soundVolume: 35,
  inAppNotifications: true,
  browserNotifications: false,
  emailNotifications: false,
  smsNotifications: false,
  notificationEmail: "",
  notificationPhone: "",
  externalMinimumSeverity: "warning",
  quietHoursEnabled: true,
  quietHoursStart: "22:00",
  quietHoursEnd: "07:00",
  dailyBriefTime: "07:30",
  timezone: "Africa/Lagos",
  weekStartsOn: "monday",
  confirmDestructiveTasks: true,
  updatedAt: new Date(0).toISOString(),
};

export const devonTones: DevonTone[] = [
  "Premium",
  "Official",
  "Warm",
  "Bold",
  "Simple",
  "Luxury",
  "Professional",
];

export const devonModes: DevonMode[] = [
  "Personal",
  "Work",
  "Executive",
  "Creative",
];

export const devonTimezones = [
  { value: "Africa/Lagos", label: "Lagos · WAT" },
  { value: "Africa/Accra", label: "Accra · GMT" },
  { value: "Europe/London", label: "London · GMT/BST" },
  { value: "Asia/Dubai", label: "Dubai · GST" },
  { value: "America/New_York", label: "New York · ET" },
] as const;

export function normalizeSettings(
  settings?: Partial<DevonSettings>
): DevonSettings {
  return {
    ...defaultSettings,
    ...settings,
    soundVolume: Math.min(
      100,
      Math.max(0, Number(settings?.soundVolume ?? defaultSettings.soundVolume))
    ),
    updatedAt:
      settings?.updatedAt && !Number.isNaN(Date.parse(settings.updatedAt))
        ? settings.updatedAt
        : new Date().toISOString(),
  };
}

export const SETTINGS_UPDATED_EVENT = "devonos:settings-updated";
