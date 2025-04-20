import { API_BASE_URL } from "@utils/constants";
import { useFetch } from "@peach/fetch";


// Search videos (returns hook state tuple)
export function searchVideos(query, page = 1, limit = 10) {
  // if(!query)  return [false, [], false];
  const params = new URLSearchParams({
    q: query, // Explicitly encode query
    page: page.toString(),
    limit: limit.toString(),
  });
  const url = `${API_BASE_URL}/search?${params.toString()}`;
  return useFetch(url, { cacheTime: 60000 * 5 });
}

// Get video info (returns hook state tuple)
export function getVideoInfo(id) {
  const url = `${API_BASE_URL}/info?id=${encodeURIComponent(id)}`;
  return useFetch(url, { cacheTime: 60000 * 5 });
}

// Get streaming URL
export function getStreamUrl(id, audioOnly = false) {
  return `${API_BASE_URL}/stream?id=${encodeURIComponent(id)}${
    audioOnly ? "&audioOnly=true" : ""
  }`;
}
