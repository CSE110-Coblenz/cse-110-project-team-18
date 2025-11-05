// Keep  color keys centralized and semantic. Can later swap palettes without touching screens.
import { Theme } from "../ui";

export const theme = new Theme({
  colors: {
    // --- Base / UI structure ---
    stroke: "#0B1220",
    text_primary: "#0B1220",
    text_inverse: "#FFFFFF",
    primary: "#60A5FA",          // bright blue
    primary_hover: "#3B82F6",
    surface: "#0F172A",          // dark panel background
    surface_alt: "#111827",

    // --- Feedback / State colors ---
    success: "#22C55E",          // standard green
    success_hover: "#16A34A",
    error: "#EF4444",            // red for errors or danger
    error_hover: "#DC2626",
    warning: "#FACC15",          // yellow warning tone
    warning_hover: "#EAB308",
    info: "#38BDF8",             // cyan info
    info_hover: "#0EA5E9",

    // --- Game-specific or themed colors ---
    alien_green: "#4CBB17",      // bright sci-fi "alien" green
    cosmic_purple: "#8B5CF6",
    meteor_orange: "#F97316",
    asteroid_gray: "#9CA3AF",
    nebula_pink: "#EC4899",

    // --- Utility / Neutral variants ---
    black: "#000000",
    white: "#FFFFFF",
    transparent: "rgba(0,0,0,0)",

    // Optional accent sets
    accent_blue: "#2563EB",
    accent_green: "#10B981",
    accent_red: "#DC2626",
    accent_yellow: "#FBBF24",
  },
  fontFamilyDefault: "Inter, system-ui, -apple-system, Roboto",
  fontSizeDefault: 24,
  fontWeightDefault: 600,
  strokeColorKey: "stroke",
  textColorKey: "text_primary",
});