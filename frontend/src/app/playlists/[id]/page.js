import { Peachy, useState } from "@peach/component";
import MediaSection from "@components/MediaCard";
import Button from "@components/Button";
import { useMemo } from "@utils/useMemo";
import {
  getPlaylist,
  removeFromPlaylist,
  renamePlaylist,
} from "@utils/useDB.js";
import { formatTimeToMinSec } from "@utils/formatTime";
import { AppState } from "@peach/state";

export default function MainPlaylistPage({ params }) {
  const playlistName = decodeURIComponent(params.id);
  let [playlist, setPlaylist] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

  if (!playlist || (playlist === null && playlistName)) {
    getPlaylist(playlistName).then((data) => {
      setPlaylist(data);
    });
  }

  // Calculate paginated items

  const startIndex = (currentPage - 1) * itemsPerPage;
  const paginatedItems = !playlist?.items
    ? []
    : playlist.items.slice(startIndex, startIndex + itemsPerPage);

  // Calculate total pages
  const totalPages = playlist
    ? Math.ceil(playlist.items.length / itemsPerPage)
    : 1;

  // Handle page navigation
  const handlePrevious = () => setCurrentPage((prev) => Math.max(prev - 1, 1));
  const handleNext = () =>
    setCurrentPage((prev) => Math.min(prev + 1, totalPages));

  // Calculate total duration
  const totalDuration = playlist
    ? playlist.items.reduce((sum, item) => sum + (item.duration || 0), 0)
    : 0;

  const memoizedOutput = useMemo(
    "MainPlaylistPage",
    [paginatedItems ? paginatedItems.length > 0 : null, currentPage, playlist],
    () => {
      const handlePlaylistPlay = async () => {
        if(!playlist && playlist?.length <= 0) return;
        AppState.set("player", playlist?.items[0]);
        AppState.set("queue", [...playlist?.items]);
      };
      return (
        <section className="flex-1 container mx-auto px-4 relative z-10 py-20 pb-40 pt-6 flex flex-col bg-background">
          <div className="flex justify-between items-center mb-6 px-4 relative">
            <div>
              <h1 className="text-3xl font-bold font-mono tracking-widest text-foreground word-break break-all">
                {playlist?.name}
              </h1>
              <div className="flex space-x-2 items-center my-2">
                <button
                  onClick={handlePlaylistPlay}
                  title="Play Playlist"
                  className="mt-1.5 p-2 bg-secondary text-muted-foreground rounded-full hover:text-foreground hover:bg-primary transition-colors"
                >
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    viewBox="0 0 384 512"
                    className="w-5 h-5"
                    fill="currentColor"
                  >
                    <path d="M73 39c-14.8-9.1-33.4-9.4-48.5-.9S0 62.6 0 80L0 432c0 17.4 9.4 33.4 24.5 41.9s33.7 8.1 48.5-.9L361 297c14.3-8.7 23-24.2 23-41s-8.7-32.2-23-41L73 39z" />
                  </svg>
                </button>
                <span className="text-sm text-muted-foreground mt-2">
                  {playlist && `${playlist?.items?.length} Item`}
                  {playlist?.items?.length !== 1 ? "s" : ""} •{" "}
                  {formatTimeToMinSec(totalDuration)} min
                </span>
              </div>
            </div>
          </div>
          {(paginatedItems && paginatedItems.length > 0 && (
            <MediaSection
              isLoading={false}
              isError={false}
              label={`Added List`}
              data={paginatedItems}
            />
          )) || (
            <div className="flex flex-col items-center justify-center h-[calc(100vh-200px)]">
              <svg
                className="w-20 h-20 fill-secondary animate-pulse"
                xmlns="http://www.w3.org/2000/svg"
                viewBox="0 0 512 512"
              >
                <path d="M0 96C0 60.7 28.7 32 64 32H448c35.3 0 64 28.7 64 64V416c0 35.3-28.7 64-64 64H64c-35.3 0-64-28.7-64-64V96zm64 64V416H448V160H64zm80 80c0-8.8 7.2-16 16-16H352c8.8 0 16 7.2 16 16s-7.2 16-16 16H160c-8.8 0-16-7.2-16-16zm0 64c0-8.8 7.2-16 16-16H352c8.8 0 16 7.2 16 16s-7.2 16-16 16H160c-8.8 0-16-7.2-16-16zm0 64c0-8.8 7.2-16 16-16H352c8.8 0 16 7.2 16 16s-7.2 16-16 16H160c-8.8 0-16-7.2-16-16z" />
              </svg>
              <span className="mt-8 text-3xl font-bold font-mono text-secondary animate-pulse text-center max-w-md">
                No Videos in This Playlist
              </span>
            </div>
          )}
          {totalPages > 1 && (
            <div className="flex justify-center items-center gap-4 mt-6">
              <Button
                variant="outline"
                onClick={handlePrevious}
                disabled={currentPage === 1}
              >
                Previous
              </Button>
              <span className="text-sm text-foreground">
                Page {currentPage} of {totalPages}
              </span>
              <Button
                variant="outline"
                onClick={handleNext}
                disabled={currentPage === totalPages}
              >
                Next
              </Button>
            </div>
          )}
        </section>
      );
    }
  );

  return memoizedOutput;
}
