export function formatTimeToMinSec(totalSeconds) {
  const minutes = Math.floor(totalSeconds / 60);
  const seconds = totalSeconds % 60;
  const formatted = `${minutes}.${seconds.toString().padStart(2, "0")}`;
  return formatted;
}

export const formatRelativeTime = (date) => {
  const now = new Date();
  const created = new Date(date);
  const diffMs = now - created;
  const diffSec = Math.floor(diffMs / 1000);
  const units = [
    { max: 60, value: diffSec, unit: "second" },
    { max: 3600, value: Math.floor(diffSec / 60), unit: "minute" },
    { max: 86400, value: Math.floor(diffSec / 3600), unit: "hour" },
    { max: 2592000, value: Math.floor(diffSec / 86400), unit: "day" },
    { max: 31536000, value: Math.floor(diffSec / 2592000), unit: "month" },
    { max: Infinity, value: Math.floor(diffSec / 31536000), unit: "year" },
  ];
  const { value, unit } = units.find((u) => diffMs < u.max * 1000);
  return new Intl.RelativeTimeFormat("en", { numeric: "auto" }).format(
    -value,
    unit
  );
};
