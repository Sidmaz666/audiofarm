// API Endpoints
export const API_BASE_URL = process?.env.NODE_ENV === "production" ? "" : "http://localhost:3000" ; //"http://192.168.29.163:3000";

export const DB_NAME = "AudioFarm";
export const DB_VERSION = 1;

export const STORES = {
  HISTORY: "history",
  FAVORITES: "favorites",
  WATCH_LATER: "watchLater",
  PLAYLISTS: "playlists",
  DOWNLOADS: "downloads",
};

export const DEFAULT_FEEDS = [
  {
    label: "Trending Music",
    query: `Trending music |Official Music`,
    page: 1,
    limit: 9,
  },
];
