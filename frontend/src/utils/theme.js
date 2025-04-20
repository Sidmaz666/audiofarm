// Run this in the browser console
export function applyTheme(theme) {
  try {
    // Validate theme object
    if (!theme || typeof theme !== "object" || !theme.light || !theme.dark) {
      throw new Error(
        'Theme object must include "light" and "dark" properties'
      );
    }

    // List of expected CSS properties (based on your CSS)
    const cssProperties = [
      "background",
      "foreground",
      "card",
      "card-foreground",
      "popover",
      "popover-foreground",
      "primary",
      "primary-foreground",
      "secondary",
      "secondary-foreground",
      "muted",
      "muted-foreground",
      "accent",
      "accent-foreground",
      "destructive",
      "destructive-foreground",
      "border",
      "input",
      "ring",
      "radius",
    ];

    // Validate light and dark themes
    ["light", "dark"].forEach((mode) => {
      const modeTheme = theme[mode];
      if (!modeTheme || typeof modeTheme !== "object") {
        throw new Error(`Invalid ${mode} theme configuration`);
      }
      cssProperties.forEach((prop) => {
        if (!(prop in modeTheme)) {
          throw new Error(`Missing ${prop} in ${mode} theme`);
        }
        if (
          prop !== "radius" &&
          !/^\d+\s\d+(\.\d+)?%\s\d+(\.\d+)?%$/.test(modeTheme[prop])
        ) {
          throw new Error(
            `Invalid HSL value for ${prop} in ${mode} theme: ${modeTheme[prop]}`
          );
        }
      });
    });

    // Remove inline styles from <html>
    document.documentElement.removeAttribute("style");

    // Create or update <style> element for themes
    let themeStyle = document.getElementById("theme-style");
    if (!themeStyle) {
      themeStyle = document.createElement("style");
      themeStyle.id = "theme-style";
      document.head.appendChild(themeStyle);
    }

    // Generate CSS for :root and .dark
    const rootStyles = cssProperties
      .map((prop) => `--${prop}: ${theme.light[prop]};`)
      .join("\n");
    const darkStyles = cssProperties
      .map((prop) => `--${prop}: ${theme.dark[prop]};`)
      .join("\n");
    themeStyle.textContent = `
        :root {
          ${rootStyles}
        }
        .dark {
          ${darkStyles}
        }
      `;

    // Save theme to localStorage
    localStorage.setItem("theme", JSON.stringify(theme));
  } catch (error) {
    console.error("Failed to apply theme:", error.message);
  }
}

export const THEMES = {
  forest: {
    light: {
      background: "120 20% 98%", // Light green-white
      foreground: "140 40% 20%", // Dark green
      card: "0 0% 100%",
      "card-foreground": "140 40% 20%",
      popover: "0 0% 100%",
      "popover-foreground": "140 40% 20%",
      primary: "160 60% 45%", // Forest teal
      "primary-foreground": "0 0% 100%",
      secondary: "130 30% 90%",
      "secondary-foreground": "140 40% 20%",
      muted: "130 30% 90%",
      "muted-foreground": "140 20% 40%",
      accent: "130 30% 90%",
      "accent-foreground": "140 40% 20%",
      destructive: "0 80% 60%",
      "destructive-foreground": "0 0% 100%",
      border: "140 20% 85%",
      input: "140 20% 85%",
      ring: "160 60% 45%",
      radius: "0.75rem",
    },
    dark: {
      background: "140 40% 10%", // Dark green
      foreground: "120 20% 95%",
      card: "140 40% 10%",
      "card-foreground": "120 20% 95%",
      popover: "140 40% 10%",
      "popover-foreground": "120 20% 95%",
      primary: "160 60% 45%", // Forest teal
      "primary-foreground": "0 0% 100%",
      secondary: "130 30% 20%",
      "secondary-foreground": "120 20% 95%",
      muted: "130 30% 20%",
      "muted-foreground": "120 20% 60%",
      accent: "130 30% 20%",
      "accent-foreground": "120 20% 95%",
      destructive: "0 60% 40%",
      "destructive-foreground": "0 0% 100%",
      border: "130 30% 25%",
      input: "130 30% 25%",
      ring: "160 60% 45%",
      radius: "0.75rem",
    },
  },
  ocean: {
    light: {
      background: "210 20% 98%", // Soft blue-white
      foreground: "220 40% 20%", // Deep blue
      card: "0 0% 100%",
      "card-foreground": "220 40% 20%",
      popover: "0 0% 100%",
      "popover-foreground": "220 40% 20%",
      primary: "200 80% 50%", // Bright cyan
      "primary-foreground": "0 0% 100%",
      secondary: "190 30% 90%",
      "secondary-foreground": "220 40% 20%",
      muted: "190 30% 90%",
      "muted-foreground": "220 20% 40%",
      accent: "190 30% 90%",
      "accent-foreground": "220 40% 20%",
      destructive: "0 80% 60%",
      "destructive-foreground": "0 0% 100%",
      border: "200 20% 85%",
      input: "200 20% 85%",
      ring: "200 80% 50%",
      radius: "0.5rem",
    },
    dark: {
      background: "220 40% 10%", // Dark blue
      foreground: "200 20% 95%",
      card: "220 40% 10%",
      "card-foreground": "200 20% 95%",
      popover: "220 40% 10%",
      "popover-foreground": "200 20% 95%",
      primary: "200 80% 50%", // Bright cyan
      "primary-foreground": "0 0% 100%",
      secondary: "210 30% 20%",
      "secondary-foreground": "200 20% 95%",
      muted: "210 30% 20%",
      "muted-foreground": "200 20% 60%",
      accent: "210 30% 20%",
      "accent-foreground": "200 20% 95%",
      destructive: "0 60% 40%",
      "destructive-foreground": "0 0% 100%",
      border: "210 30% 25%",
      input: "210 30% 25%",
      ring: "200 80% 50%",
      radius: "0.5rem",
    },
  },
  sunset: {
    light: {
      background: "30 20% 98%", // Warm white
      foreground: "20 40% 20%", // Deep orange
      card: "0 0% 100%",
      "card-foreground": "20 40% 20%",
      popover: "0 0% 100%",
      "popover-foreground": "20 40% 20%",
      primary: "15 80% 50%", // Sunset orange
      "primary-foreground": "0 0% 100%",
      secondary: "25 30% 90%",
      "secondary-foreground": "20 40% 20%",
      muted: "25 30% 90%",
      "muted-foreground": "20 20% 40%",
      accent: "25 30% 90%",
      "accent-foreground": "20 40% 20%",
      destructive: "0 80% 60%",
      "destructive-foreground": "0 0% 100%",
      border: "20 20% 85%",
      input: "20 20% 85%",
      ring: "15 80% 50%",
      radius: "1rem",
    },
    dark: {
      background: "20 40% 10%", // Dark orange
      foreground: "30 20% 95%",
      card: "20 40% 10%",
      "card-foreground": "30 20% 95%",
      popover: "20 40% 10%",
      "popover-foreground": "30 20% 95%",
      primary: "15 80% 50%", // Sunset orange
      "primary-foreground": "0 0% 100%",
      secondary: "25 30% 20%",
      "secondary-foreground": "30 20% 95%",
      muted: "25 30% 20%",
      "muted-foreground": "30 20% 60%",
      accent: "25 30% 20%",
      "accent-foreground": "30 20% 95%",
      destructive: "0 60% 40%",
      "destructive-foreground": "0 0% 100%",
      border: "25 30% 25%",
      input: "25 30% 25%",
      ring: "15 80% 50%",
      radius: "1rem",
    },
  },
  amethyst: {
    light: {
      background: "270 20% 98%", // Light purple-white
      foreground: "280 40% 20%", // Deep purple
      card: "0 0% 100%",
      "card-foreground": "280 40% 20%",
      popover: "0 0% 100%",
      "popover-foreground": "280 40% 20%",
      primary: "265 80% 50%", // Amethyst purple
      "primary-foreground": "0 0% 100%",
      secondary: "275 30% 90%",
      "secondary-foreground": "280 40% 20%",
      muted: "275 30% 90%",
      "muted-foreground": "280 20% 40%",
      accent: "275 30% 90%",
      "accent-foreground": "280 40% 20%",
      destructive: "0 80% 60%",
      "destructive-foreground": "0 0% 100%",
      border: "280 20% 85%",
      input: "280 20% 85%",
      ring: "265 80% 50%",
      radius: "0.25rem",
    },
    dark: {
      background: "280 40% 10%", // Dark purple
      foreground: "270 20% 95%",
      card: "280 40% 10%",
      "card-foreground": "270 20% 95%",
      popover: "280 40% 10%",
      "popover-foreground": "270 20% 95%",
      primary: "265 80% 50%", // Amethyst purple
      "primary-foreground": "0 0% 100%",
      secondary: "275 30% 20%",
      "secondary-foreground": "270 20% 95%",
      muted: "275 30% 20%",
      "muted-foreground": "270 20% 60%",
      accent: "275 30% 20%",
      "accent-foreground": "270 20% 95%",
      destructive: "0 60% 40%",
      "destructive-foreground": "0 0% 100%",
      border: "275 30% 25%",
      input: "275 30% 25%",
      ring: "265 80% 50%",
      radius: "0.25rem",
    },
  },
  slate: {
    light: {
      background: "220 15% 98%", // Light gray
      foreground: "220 40% 20%", // Dark slate
      card: "0 0% 100%",
      "card-foreground": "220 40% 20%",
      popover: "0 0% 100%",
      "popover-foreground": "220 40% 20%",
      primary: "220 50% 50%", // Slate blue
      "primary-foreground": "0 0% 100%",
      secondary: "210 20% 90%",
      "secondary-foreground": "220 40% 20%",
      muted: "210 20% 90%",
      "muted-foreground": "220 20% 40%",
      accent: "210 20% 90%",
      "accent-foreground": "220 40% 20%",
      destructive: "0 80% 60%",
      "destructive-foreground": "0 0% 100%",
      border: "220 15% 85%",
      input: "220 15% 85%",
      ring: "220 50% 50%",
      radius: "0.875rem",
    },
    dark: {
      background: "220 40% 10%", // Dark slate
      foreground: "210 20% 95%",
      card: "220 40% 10%",
      "card-foreground": "210 20% 95%",
      popover: "220 40% 10%",
      "popover-foreground": "210 20% 95%",
      primary: "220 50% 50%", // Slate blue
      "primary-foreground": "0 0% 100%",
      secondary: "210 20% 20%",
      "secondary-foreground": "210 20% 95%",
      muted: "210 20% 20%",
      "muted-foreground": "210 20% 60%",
      accent: "210 20% 20%",
      "accent-foreground": "210 20% 95%",
      destructive: "0 60% 40%",
      "destructive-foreground": "0 0% 100%",
      border: "210 20% 25%",
      input: "210 20% 25%",
      ring: "220 50% 50%",
      radius: "0.875rem",
    },
  },
  rose: {
    light: {
      background: "350 20% 98%", // Light pink-white
      foreground: "340 40% 20%", // Deep rose
      card: "0 0% 100%",
      "card-foreground": "340 40% 20%",
      popover: "0 0% 100%",
      "popover-foreground": "340 40% 20%",
      primary: "345 80% 50%", // Rose pink
      "primary-foreground": "0 0% 100%",
      secondary: "355 30% 90%",
      "secondary-foreground": "340 40% 20%",
      muted: "355 30% 90%",
      "muted-foreground": "340 20% 40%",
      accent: "355 30% 90%",
      "accent-foreground": "340 40% 20%",
      destructive: "0 80% 60%",
      "destructive-foreground": "0 0% 100%",
      border: "340 20% 85%",
      input: "340 20% 85%",
      ring: "345 80% 50%",
      radius: "0.625rem",
    },
    dark: {
      background: "340 40% 10%", // Dark rose
      foreground: "350 20% 95%",
      card: "340 40% 10%",
      "card-foreground": "350 20% 95%",
      popover: "340 40% 10%",
      "popover-foreground": "350 20% 95%",
      primary: "345 80% 50%", // Rose pink
      "primary-foreground": "0 0% 100%",
      secondary: "355 30% 20%",
      "secondary-foreground": "350 20% 95%",
      muted: "355 30% 20%",
      "muted-foreground": "350 20% 60%",
      accent: "355 30% 20%",
      "accent-foreground": "350 20% 95%",
      destructive: "0 60% 40%",
      "destructive-foreground": "0 0% 100%",
      border: "355 30% 25%",
      input: "355 30% 25%",
      ring: "345 80% 50%",
      radius: "0.625rem",
    },
  },
  emerald: {
    light: {
      background: "150 20% 98%", // Light emerald-white
      foreground: "160 40% 20%", // Deep emerald
      card: "0 0% 100%",
      "card-foreground": "160 40% 20%",
      popover: "0 0% 100%",
      "popover-foreground": "160 40% 20%",
      primary: "155 70% 45%", // Emerald green
      "primary-foreground": "0 0% 100%",
      secondary: "145 30% 90%",
      "secondary-foreground": "160 40% 20%",
      muted: "145 30% 90%",
      "muted-foreground": "160 20% 40%",
      accent: "145 30% 90%",
      "accent-foreground": "160 40% 20%",
      destructive: "0 80% 60%",
      "destructive-foreground": "0 0% 100%",
      border: "160 20% 85%",
      input: "160 20% 85%",
      ring: "155 70% 45%",
      radius: "0.375rem",
    },
    dark: {
      background: "160 40% 10%", // Dark emerald
      foreground: "150 20% 95%",
      card: "160 40% 10%",
      "card-foreground": "150 20% 95%",
      popover: "160 40% 10%",
      "popover-foreground": "150 20% 95%",
      primary: "155 70% 45%", // Emerald green
      "primary-foreground": "0 0% 100%",
      secondary: "145 30% 20%",
      "secondary-foreground": "150 20% 95%",
      muted: "145 30% 20%",
      "muted-foreground": "150 20% 60%",
      accent: "145 30% 20%",
      "accent-foreground": "150 20% 95%",
      destructive: "0 60% 40%",
      "destructive-foreground": "0 0% 100%",
      border: "145 30% 25%",
      input: "145 30% 25%",
      ring: "155 70% 45%",
      radius: "0.375rem",
    },
  },
  crimson: {
    light: {
      background: "0 20% 98%", // Light red-white
      foreground: "0 40% 20%", // Deep crimson
      card: "0 0% 100%",
      "card-foreground": "0 40% 20%",
      popover: "0 0% 100%",
      "popover-foreground": "0 40% 20%",
      primary: "0 80% 50%", // Crimson red
      "primary-foreground": "0 0% 100%",
      secondary: "10 30% 90%",
      "secondary-foreground": "0 40% 20%",
      muted: "10 30% 90%",
      "muted-foreground": "0 20% 40%",
      accent: "10 30% 90%",
      "accent-foreground": "0 40% 20%",
      destructive: "0 80% 60%",
      "destructive-foreground": "0 0% 100%",
      border: "0 20% 85%",
      input: "0 20% 85%",
      ring: "0 80% 50%",
      radius: "1.25rem",
    },
    dark: {
      background: "0 40% 10%", // Dark crimson
      foreground: "0 20% 95%",
      card: "0 40% 10%",
      "card-foreground": "0 20% 95%",
      popover: "0 40% 10%",
      "popover-foreground": "0 20% 95%",
      primary: "0 80% 50%", // Crimson red
      "primary-foreground": "0 0% 100%",
      secondary: "10 30% 20%",
      "secondary-foreground": "0 20% 95%",
      muted: "10 30% 20%",
      "muted-foreground": "0 20% 60%",
      accent: "10 30% 20%",
      "accent-foreground": "0 20% 95%",
      destructive: "0 60% 40%",
      "destructive-foreground": "0 0% 100%",
      border: "10 30% 25%",
      input: "10 30% 25%",
      ring: "0 80% 50%",
      radius: "1.25rem",
    },
  },
  amber: {
    light: {
      background: "40 20% 98%", // Light amber-white
      foreground: "50 40% 20%", // Deep amber
      card: "0 0% 100%",
      "card-foreground": "50 40% 20%",
      popover: "0 0% 100%",
      "popover-foreground": "50 40% 20%",
      primary: "45 80% 50%", // Amber yellow
      "primary-foreground": "0 0% 100%",
      secondary: "35 30% 90%",
      "secondary-foreground": "50 40% 20%",
      muted: "35 30% 90%",
      "muted-foreground": "50 20% 40%",
      accent: "35 30% 90%",
      "accent-foreground": "50 40% 20%",
      destructive: "0 80% 60%",
      "destructive-foreground": "0 0% 100%",
      border: "50 20% 85%",
      input: "50 20% 85%",
      ring: "45 80% 50%",
      radius: "0.125rem",
    },
    dark: {
      background: "50 40% 10%", // Dark amber
      foreground: "40 20% 95%",
      card: "50 40% 10%",
      "card-foreground": "40 20% 95%",
      popover: "50 40% 10%",
      "popover-foreground": "40 20% 95%",
      primary: "45 80% 50%", // Amber yellow
      "primary-foreground": "0 0% 100%",
      secondary: "35 30% 20%",
      "secondary-foreground": "40 20% 95%",
      muted: "35 30% 20%",
      "muted-foreground": "40 20% 60%",
      accent: "35 30% 20%",
      "accent-foreground": "40 20% 95%",
      destructive: "0 60% 40%",
      "destructive-foreground": "0 0% 100%",
      border: "35 30% 25%",
      input: "35 30% 25%",
      ring: "45 80% 50%",
      radius: "0.125rem",
    },
  },
  highContrast: {
    light: {
      background: "0 0% 100%", // Pure white
      foreground: "0 0% 0%", // Pure black
      card: "0 0% 100%",
      "card-foreground": "0 0% 0%",
      popover: "0 0% 100%",
      "popover-foreground": "0 0% 0%",
      primary: "210 100% 50%", // Vivid blue
      "primary-foreground": "0 0% 100%",
      secondary: "0 0% 90%",
      "secondary-foreground": "0 0% 0%",
      muted: "0 0% 90%",
      "muted-foreground": "0 0% 40%",
      accent: "0 0% 90%",
      "accent-foreground": "0 0% 0%",
      destructive: "0 100% 50%",
      "destructive-foreground": "0 0% 100%",
      border: "0 0% 80%",
      input: "0 0% 80%",
      ring: "210 100% 50%",
      radius: "0.5rem",
    },
    dark: {
      background: "0 0% 0%", // Pure black
      foreground: "0 0% 100%", // Pure white
      card: "0 0% 10%",
      "card-foreground": "0 0% 100%",
      popover: "0 0% 10%",
      "popover-foreground": "0 0% 100%",
      primary: "210 100% 50%", // Vivid blue
      "primary-foreground": "0 0% 100%",
      secondary: "0 0% 20%",
      "secondary-foreground": "0 0% 100%",
      muted: "0 0% 20%",
      "muted-foreground": "0 0% 60%",
      accent: "0 0% 20%",
      "accent-foreground": "0 0% 100%",
      destructive: "0 100% 50%",
      "destructive-foreground": "0 0% 100%",
      border: "0 0% 30%",
      input: "0 0% 30%",
      ring: "210 100% 50%",
      radius: "0.5rem",
    },
  },
  teal: {
    light: {
      background: "180 20% 98%", // Light teal-white
      foreground: "190 40% 20%", // Deep teal
      card: "0 0% 100%",
      "card-foreground": "190 40% 20%",
      popover: "0 0% 100%",
      "popover-foreground": "190 40% 20%",
      primary: "185 70% 45%", // Teal
      "primary-foreground": "0 0% 100%",
      secondary: "175 30% 90%",
      "secondary-foreground": "190 40% 20%",
      muted: "175 30% 90%",
      "muted-foreground": "190 20% 40%",
      accent: "175 30% 90%",
      "accent-foreground": "190 40% 20%",
      destructive: "0 80% 60%",
      "destructive-foreground": "0 0% 100%",
      border: "190 20% 85%",
      input: "190 20% 85%",
      ring: "185 70% 45%",
      radius: "1.5rem",
    },
    dark: {
      background: "190 40% 10%", // Dark teal
      foreground: "180 20% 95%",
      card: "190 40% 10%",
      "card-foreground": "180 20% 95%",
      popover: "190 40% 10%",
      "popover-foreground": "180 20% 95%",
      primary: "185 70% 45%", // Teal
      "primary-foreground": "0 0% 100%",
      secondary: "175 30% 20%",
      "secondary-foreground": "180 20% 95%",
      muted: "175 30% 20%",
      "muted-foreground": "180 20% 60%",
      accent: "175 30% 20%",
      "accent-foreground": "180 20% 95%",
      destructive: "0 60% 40%",
      "destructive-foreground": "0 0% 100%",
      border: "175 30% 25%",
      input: "175 30% 25%",
      ring: "185 70% 45%",
      radius: "1.5rem",
    },
  },
};

export const DEFAULT_THEME = THEMES.forest;

export function initializeTheme() {
  const savedTheme = localStorage.getItem("theme");
  try {
    if (savedTheme) {
      applyTheme(JSON.parse(savedTheme));
    }
  } catch (error) {
    console.error("Failed to parse saved theme:", error.message);
  }
}
