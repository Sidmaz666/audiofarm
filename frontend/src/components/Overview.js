import { Peachy, useState } from "@peach/component";
import {
  getAllHistory,
  getAllFavorites,
  getAllPlaylists,
  getAllDownloads,
} from "@utils/useDB";
import Button from "@components/Button";
import { useMemo } from "@utils/useMemo";
import JSZip from "jszip"; // Import JSZip for ZIP creation

export default function Overview() {
  // State for counts and additional info
  const [historyCount, setHistoryCount] = useState(0);
  const [favoritesCount, setFavoritesCount] = useState(0);
  const [playlistsCount, setPlaylistsCount] = useState(0);
  const [downloadsCount, setDownloadsCount] = useState(0);
  const [storageUsage, setStorageUsage] = useState(0); // In MB
  const [recentVideo, setRecentVideo] = useState(null); // Most recent video
  const [topPlaylist, setTopPlaylist] = useState(null); // Playlist with most videos
  const [isLoad, setLoad] = useState(false); // Loading state

  if (!isLoad) {
    // Fetch counts
    getAllHistory().then((history) => {
      setHistoryCount(history.length);
      // Find most recent video by uploadDate or fallback to first
      const recent = history.sort(
        (a, b) => new Date(b.uploadDate) - new Date(a.uploadDate)
      )[0];
      setRecentVideo(recent || null);
    });
    getAllFavorites().then((favorites) => setFavoritesCount(favorites.length));
    getAllPlaylists().then((playlists) => {
      setPlaylistsCount(playlists.length);
      // Find playlist with most videos
      const top = playlists.reduce(
        (max, pl) => (pl.items.length > (max?.items?.length || 0) ? pl : max),
        null
      );
      setTopPlaylist(top || null);
    });
    getAllDownloads().then((downloads) => {
      setDownloadsCount(downloads.length);
      // Estimate storage usage (sum of binary sizes in MB)
      const totalSize =
        downloads.reduce((sum, d) => sum + (d.binary.blob.size || 0), 0) /
        (1024 * 1024); // Bytes to MB
      setStorageUsage(totalSize.toFixed(2));
    });
    setLoad(true);
  }

  // Generic function to export data as JSON
  const exportData = (data, filename) => {
    const json = JSON.stringify(data, null, 2);
    const blob = new Blob([json], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = filename;
    a.click();
    URL.revokeObjectURL(url);
  };

  // Export handlers
  const exportHistory = () => {
    getAllHistory().then((history) => exportData(history, "history.json"));
  };

  const exportFavorites = () => {
    getAllFavorites().then((favorites) =>
      exportData(favorites, "favorites.json")
    );
  };

  const exportPlaylists = () => {
    getAllPlaylists().then((playlists) =>
      exportData(playlists, "playlists.json")
    );
  };

  // Download all videos as a ZIP using JSZip
  const downloadAllVideos = async () => {
    const downloads = await getAllDownloads();
    if (downloads.length === 0) {
      console.log("No videos to download.");
      return;
    }

    const zip = new JSZip();
    downloads.forEach((download) => {
      // Use download.id for unique filenames, fallback to index if id is missing
      const filename = download.id
        ? `${download.id}.mp4`
        : `video_${downloads.indexOf(download)}.mp4`;
      zip.file(filename, download.binary.blob); // Add video blob to ZIP
    });

    try {
      const content = await zip.generateAsync({ type: "blob" });
      const url = URL.createObjectURL(content);
      const a = document.createElement("a");
      a.href = url;
      a.download = "downloaded_videos.zip";
      a.click();
      URL.revokeObjectURL(url);
    } catch (error) {
      console.error("Failed to generate ZIP file:", error);
    }
  };

  return (
    <div className="flex flex-col gap-8 p-6 min-h-[calc(100dvh-10rem)]">
      {/* Statistics Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
        {/* History Card */}
        <div className="relative group bg-card border border-border rounded-xl p-6  transition-all duration-300 hover:-translate-y-1">
          <div className="flex items-center gap-4">
            <svg
              className="w-10 h-10 text-primary"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
              />
            </svg>
            <div>
              <p className="text-sm text-muted-foreground">History</p>
              <p className="text-3xl font-bold text-foreground">
                {historyCount}
              </p>
            </div>
          </div>
          <div className="mt-4 text-sm text-muted-foreground">
            Videos watched
          </div>
          <Button
            variant="outline"
            className="md:absolute md:top-4 md:right-4 flex items-center md:w-auto w-full justify-end mt-2 md:mt-0 gap-2 text-sm py-1 px-2"
            onClick={exportHistory}
            title="Export history as JSON"
          >
            <svg
              className="w-4 h-4"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4"
              />
            </svg>
            Export
          </Button>
        </div>

        {/* Favorites Card */}
        <div className="relative group bg-card border border-border rounded-xl p-6  transition-all duration-300 hover:-translate-y-1">
          <div className="flex items-center gap-4">
            <svg
              className="w-10 h-10 text-primary"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z"
              />
            </svg>
            <div>
              <p className="text-sm text-muted-foreground">Favorites</p>
              <p className="text-3xl font-bold text-foreground">
                {favoritesCount}
              </p>
            </div>
          </div>
          <div className="mt-4 text-sm text-muted-foreground">Videos saved</div>
          <Button
            variant="outline"
            className="md:absolute md:top-4 md:right-4 flex items-center md:w-auto w-full justify-end mt-2 md:mt-0 gap-2 text-sm py-1 px-2"
            onClick={exportFavorites}
            title="Export favorites as JSON"
          >
            <svg
              className="w-4 h-4"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z"
              />
            </svg>
            Export
          </Button>
        </div>

        {/* Playlists Card */}
        <div className="relative group bg-card border border-border rounded-xl p-6  transition-all duration-300 hover:-translate-y-1">
          <div className="flex items-center gap-4">
            <svg
              className="w-10 h-10 text-primary"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01"
              />
            </svg>
            <div>
              <p className="text-sm text-muted-foreground">Playlists</p>
              <p className="text-3xl font-bold text-foreground">
                {playlistsCount}
              </p>
            </div>
          </div>
          <div className="mt-4 text-sm text-muted-foreground">
            Collections created
          </div>
          <Button
            variant="outline"
            className="md:absolute md:top-4 md:right-4 flex items-center md:w-auto w-full justify-end mt-2 md:mt-0 gap-2 text-sm py-1 px-2"
            onClick={exportPlaylists}
            title="Export playlists as JSON"
          >
            <svg
              className="w-4 h-4"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01"
              />
            </svg>
            Export
          </Button>
        </div>

        {/* Downloads Card */}
        <div className="relative group bg-card border border-border rounded-xl p-6  transition-all duration-300 hover:-translate-y-1">
          <div className="flex items-center gap-4">
            <svg
              className="w-10 h-10 text-primary"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4"
              />
            </svg>
            <div>
              <p className="text-sm text-muted-foreground">Downloads</p>
              <p className="text-3xl font-bold text-foreground">
                {downloadsCount}
              </p>
            </div>
          </div>
          <div className="mt-4 text-sm text-muted-foreground">
            Videos downloaded
          </div>
        </div>
      </div>

      {/* Additional Insights Section */}
      <div className="grid grid-cols-1 gap-6">
        {/* Storage Usage */}
        <div className="relative bg-card border border-border rounded-xl p-6 shadow-lg">
          <div className="flex items-center gap-4">
            <svg
              className="w-8 h-8 text-primary"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M5 8h14M5 8a2 2 0 110-4h14a2 2 0 110 4M5 8v10a2 2 0 002 2h10a2 2 0 002-2V8m-9 4h4"
              />
            </svg>
            <div>
              <p className="text-lg font-semibold text-foreground">
                Storage Usage
              </p>
              <p className="text-2xl font-bold text-foreground">
                {storageUsage} MB
              </p>
            </div>
          </div>
          <p className="mt-2 text-sm text-muted-foreground">
            Total size of downloaded videos
          </p>
          <Button
            variant="outline"
            className="md:absolute md:top-4 md:right-4 flex items-center md:w-auto w-full justify-end mt-2 md:mt-0 gap-2 text-sm py-1 px-2"
            onClick={downloadAllVideos}
            title="Download all videos as a ZIP file"
          >
            <svg
              className="w-4 h-4"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4"
              />
            </svg>
            Download ZIP
          </Button>
        </div>

        {/* Recent Activity */}
        <div className="bg-card border border-border rounded-xl p-6 shadow-lg">
          <div className="flex items-center gap-4">
            <svg
              className="w-8 h-8 text-primary"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M12 6v6h4.5m4.5 0a9 9 0 11-18 0 9 9 0 0118 0z"
              />
            </svg>
            <div>
              <p className="text-lg font-semibold text-foreground">
                Recent Video
              </p>
              <p className="text-sm font-medium text-foreground whitespace-break-spaces break-all">
                {recentVideo ? recentVideo.title : "No recent activity"}
              </p>
            </div>
          </div>
          <p className="mt-2 text-sm text-muted-foreground">
            {recentVideo
              ? `Added on ${new Date(
                  recentVideo.uploadDate
                ).toLocaleDateString()}`
              : "Yet to watch a video"}
          </p>
        </div>

        {/* Top Playlist */}
        <div className="bg-card border border-border rounded-xl p-6 shadow-lg">
          <div className="flex items-center gap-4">
            <svg
              className="w-8 h-8 text-primary"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M14.752 11.168l-3.197-2.2A1 1 0 0010 9.768v4.464a1 1 0 001.555.832l3.197-2.2a1 1 0 000-1.664z"
              />
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
              />
            </svg>
            <div>
              <p className="text-lg font-semibold text-foreground">
                Top Playlist
              </p>
              <p className="text-sm font-medium text-foreground truncate">
                {topPlaylist ? topPlaylist.name : "No playlists"}
              </p>
            </div>
          </div>
          <p className="mt-2 text-sm text-muted-foreground">
            {topPlaylist
              ? `${topPlaylist.items.length} videos`
              : "Create a playlist to start"}
          </p>
        </div>
      </div>
    </div>
  );
}
