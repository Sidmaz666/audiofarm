import { Peachy, useState } from "@peach/component";
import { THEMES, DEFAULT_THEME, applyTheme } from "@utils/theme";
import { PersistedAppState } from "@peach/state";

export default function ThemeSelector() {
  // Determine active theme: use localStorage or default to forest
  const [activeTheme, setActiveTheme] = useState(
    (() => {
      const savedTheme = localStorage.getItem("theme");
      try {
        if (savedTheme) {
          const parsedTheme = JSON.parse(savedTheme);
          // Find the theme key that matches the saved theme
          return (
            Object.keys(THEMES).find(
              (key) =>
                JSON.stringify(THEMES[key]) === JSON.stringify(parsedTheme)
            ) || "forest"
          );
        }
      } catch (error) {
        console.error("Failed to parse saved theme:", error.message);
      }
      return "forest"; // Default to forest
    })()
  );
  const [_t, setT] = useState(null);

  if (!_t)
    setTimeout(() => {
      setT(PersistedAppState.get("theme"));
    }, 100);

  // Apply selected theme
  const handleThemeSelect = (themeKey) => {
    applyTheme(THEMES[themeKey]);
    setActiveTheme(themeKey);
  };

  // Convert REM to percentage (assuming 16px base font size)
  const remToPercentage = (rem) => {
    const remValue = parseFloat(rem); // Extract numeric value from "Xrem"
    const baseFontSize = 16; // Default base font size in pixels
    const pixelValue = remValue * baseFontSize;
    const percentage = (pixelValue / baseFontSize) * 100;
    return Math.round(percentage); // Round to nearest integer
  };

  return (
    <div className="flex flex-col gap-4 p-4">
      <h4 className="text-lg font-semibold text-foreground">Select Theme</h4>
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
        {Object.keys(THEMES).map((themeKey) => {
          const theme = THEMES[themeKey][_t || "light"]; // Use _t or default to "light"
          const radius = theme.radius; // e.g., "0.75rem"
          const roundnessPercentage = remToPercentage(radius); // Convert to percentage

          return (
            <button
              key={themeKey}
              className={`flex flex-col items-start p-4 rounded-lg border transition-all duration-200 ${
                activeTheme === themeKey
                  ? "border-primary bg-accent text-accent-foreground"
                  : "border-border bg-card text-card-foreground hover:bg-accent hover:text-accent-foreground"
              }`}
              onClick={() => handleThemeSelect(themeKey)}
              aria-label={`Select ${themeKey} theme`}
            >
              <span className="text-base font-medium capitalize mb-2">
                {themeKey}
              </span>
              {/* Color Palette Band */}
              <div className="flex items-center mb-2">
                {[
                  "background",
                  "foreground",
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
                  "ring",
                ].map((colorKey) => (
                  <div
                    key={colorKey}
                    className="w-2 h-5"
                    style={`background: hsl(${theme[colorKey]})`}
                    title={`${colorKey}: hsl(${theme[colorKey]})`}
                  />
                ))}
              </div>
              {/* Radius Display */}
              <div className="text-sm text-muted-foreground flex items-center gap-2">
                <div
                  className="w-4 h-4 border"
                  style={`
                    border-color: hsl(${theme["primary"]});
                    border-radius: ${radius};`}
                />
                <span>Roundness: {roundnessPercentage}%</span>
              </div>
              {/* {activeTheme === themeKey && (
                <span className="mt-2 text-sm text-primary">Active</span>
              )} */}
            </button>
          );
        })}
      </div>
    </div>
  );
}
