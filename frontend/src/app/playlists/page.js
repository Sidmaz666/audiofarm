import { Peachy, useState } from "@peach/component";
import Button from "@components/Button";
import { useMemo } from "@utils/useMemo";
import {
  getAllPlaylists,
  createPlaylist,
  deletePlaylist,
  renamePlaylist,
} from "@utils/useDB.js";
import Link from "@components/Link";
import { formatTimeToMinSec, formatRelativeTime } from "@utils/formatTime";
import { AppState } from "@peach/state";
import {
  DialogManager,
  ErrorDialogContent,
  CreatePlaylistDialogContent,
  DeleteConfirmDialogContent,
  RenamePlaylistDialogContent,
} from "@components/Dialog";

export default function PlaylistsPage() {
  const [playlists, setPlaylists] = useState([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [editingPlaylist, setEditingPlaylist] = useState(null);
  const [deletePlaylistName, setDeletePlaylistName] = useState(null);

  const itemsPerPage = 10;

  // Fetch playlists
  const fetchPlaylists = async () => {
    try {
      const allPlaylists = await getAllPlaylists();
      if (allPlaylists?.length > 0) setPlaylists([...allPlaylists]);
    } catch (error) {
      console.error("Error fetching playlists:", error);
      showError("Failed to load playlists");
    }
  };

  // Initialize playlists
  if (playlists.length === 0) {
    fetchPlaylists();
  }

  const startIndex = (currentPage - 1) * itemsPerPage;
  // Calculate paginated playlists
  const paginatedPlaylists = playlists
    .slice()
    .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
    .slice(startIndex, startIndex + itemsPerPage);

  // Calculate total pages
  const totalPages = Math.ceil(playlists.length / itemsPerPage);

  // Handle page navigation
  const handlePrevious = () => setCurrentPage((prev) => Math.max(prev - 1, 1));
  const handleNext = () =>
    setCurrentPage((prev) => Math.min(prev + 1, totalPages));

  // Calculate total duration of a playlist
  const calculateDuration = (items) =>
    items.reduce((sum, item) => sum + (item.duration || 0), 0);

  // Show error dialog
  const showError = (message) => {
    DialogManager.show(
      "error-dialog",
      ErrorDialogContent,
      { message, onClose: () => DialogManager.hide("error-dialog") },
      () => DialogManager.hide("error-dialog")
    );
  };

  // Show create playlist dialog
  const showCreatePlaylist = () => {
    DialogManager.show(
      "create-playlist-dialog",
      CreatePlaylistDialogContent,
      {
        onSubmit: handleCreatePlaylist,
        onCancel: () => DialogManager.hide("create-playlist-dialog"),
      },
      () => DialogManager.hide("create-playlist-dialog")
    );
  };

  // Show rename playlist dialog
  const showRenamePlaylist = (name) => {
    setEditingPlaylist(name);
    DialogManager.show(
      "rename-playlist-dialog",
      RenamePlaylistDialogContent,
      {
        playlistName: name,
        onSubmit: handleSaveRename,
        onCancel: () => {
          setEditingPlaylist(null);
          DialogManager.hide("rename-playlist-dialog");
        },
      },
      () => {
        setEditingPlaylist(null);
        DialogManager.hide("rename-playlist-dialog");
      }
    );
  };

  // Show delete confirmation dialog
  const showDeleteConfirm = (name) => {
    setDeletePlaylistName(name);
    DialogManager.show(
      "delete-confirm-dialog",
      DeleteConfirmDialogContent,
      {
        name,
        onConfirm: handleDeletePlaylist,
        onCancel: () => DialogManager.hide("delete-confirm-dialog"),
      },
      () => DialogManager.hide("delete-confirm-dialog")
    );
  };

  // Handle create playlist
  const handleCreatePlaylist = async (name, form) => {
    try {
      await createPlaylist(name?.trim()?.toLowerCase());
      await fetchPlaylists();
      if (form) form.reset();
      DialogManager.hide("create-playlist-dialog");
    } catch (error) {
      showError(error.message || "Failed to create playlist");
    }
  };

  // Handle rename playlist
  const handleSaveRename = async (oldName, newName, form) => {
    if (newName.trim() && newName !== oldName) {
      try {
        await renamePlaylist(oldName, newName.trim()?.toLowerCase());
        await fetchPlaylists();
        if (form) form.reset();
      } catch (error) {
        showError(error.message || "Failed to rename playlist");
      }
    }
    setEditingPlaylist(null);
    DialogManager.hide("rename-playlist-dialog");
  };

  // Handle delete playlist
  const handleDeletePlaylist = async (name) => {
    try {
      await deletePlaylist(name);
      await fetchPlaylists();
      DialogManager.hide("delete-confirm-dialog");
    } catch (error) {
      showError(error.message || "Failed to delete playlist");
    }
  };

  // Lifecycle for cleanup
  PlaylistsPage.__lifecycle = {
    unmount() {
      DialogManager.hide("error-dialog");
      DialogManager.hide("create-playlist-dialog");
      DialogManager.hide("delete-confirm-dialog");
      DialogManager.hide("rename-playlist-dialog");
    },
  };

  return (
    <section className="flex-1 container mx-auto px-4 pb-20 relative z-10 py-20 pt-6 flex flex-col">
      {/* Header Section */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6 gap-4">
        <h1 className="font-bold font-mono text-2xl text-foreground">
          Playlists
        </h1>
        <div className="flex flex-wrap gap-2 w-full justify-end">
          <Button
            variant="default"
            className="bg-primary text-primary-foreground text-sm sm:text-base"
            onClick={showCreatePlaylist}
            aria-label="Open create playlist dialog"
          >
            <svg
              className="w-4 h-4 sm:w-5 sm:h-5 mr-2 fill-current"
              xmlns="http://www.w3.org/2000/svg"
              viewBox="0 0 512 512"
            >
              <path d="M256 512c141.4 0 256-114.6 256-256S397.4 0 256 0S0 114.6 0 256S114.6 512 256 512zM232 344V280H168c-13.3 0-24-10.7-24-24s10.7-24 24-24h64V168c0-13.3 10.7-24 24-24s24 10.7 24 24v64h64c13.3 0 24 10.7 24 24s-10.7 24-24 24H280v64c0 13.3-10.7 24-24 24s-24-10.7-24-24z" />
            </svg>
            New Playlist
          </Button>
          <Button
            variant="outline"
            className="text-sm sm:text-base"
            onClick={async () => {
              const queue = AppState.get("queue") || [];
              if (queue.length === 0) {
                await showError("Queue is empty!");
                return;
              }
              const name = `Queue_Playlist_${new Date().toLocaleDateString()}`;
              await handleCreatePlaylist(name, null);
            }}
            aria-label="Create playlist from queue"
          >
            <svg
              className="w-4 h-4 sm:w-5 sm:h-5 mr-2 fill-current"
              xmlns="http://www.w3.org/2000/svg"
              viewBox="0 0 512 512"
            >
              <path d="M152.1 38.2c9.9 8.9 10.7 24 1.8 33.9l-72 80c-4.4 4.9-10.6 7.8-17.2 7.9s-12.9-2.4-17.6-7L7 113C-2.3 103.6-2.3 88.4 7 79s24.6-9.4 33.9 0l22.1 22.1 55.1-61.2c8.9-9.9 24-10.7 33.9-1.8zm0 160c9.9 8.9 10.7 24 1.8 33.9l-72 80c-4.4 4.9-10.6 7.8-17.2 7.9s-12.9-2.4-17.6-7L7 273c-9.4-9.4-9.4-24.6 0-33.9s24.6-9.4 33.9 0l22.1 22.1 55.1-61.2c8.9-9.9 24-10.7 33.9-1.8zM224 96c0-17.7 14.3-32 32-32l224 0c17.7 0 32 14.3 32 32s-14.3 32-32 32l-224 0c-17.7 0-32-14.3-32-32zm0 160c0-17.7 14.3-32 32-32l224 0c17.7 0 32 14.3 32 32s-14.3 32-32 32l-224 0c-17.7 0-32-14.3-32-32zM160 416c0-17.7 14.3-32 32-32l288 0c17.7 0 32 14.3 32 32s-14.3 32-32 32l-288 0c-17.7 0-32-14.3-32-32zM48 368a48 48 0 1 1 0 96 48 48 0 1 1 0-96z" />
            </svg>
            Create from Queue
          </Button>
        </div>
      </div>

      {(paginatedPlaylists && paginatedPlaylists.length > 0 && (
        <div className="overflow-x-auto">
          {/* Table for larger screens */}
          <table className="w-full border-collapse hidden sm:table">
            <tbody>
              {paginatedPlaylists.map((playlist) => (
                <tr
                  key={playlist.name}
                  className="border-b border-border hover:bg-muted/50"
                >
                  <td className="p-2 sm:p-4 min-w-[150px]">
                    <Link
                      href={`/playlists/${encodeURIComponent(playlist.name)}`}
                      className="text-foreground hover:underline text-sm sm:text-base"
                    >
                      {playlist.name}
                    </Link>
                  </td>
                  <td className="p-2 sm:p-4 text-sm sm:text-base">
                    {playlist.items.length} item
                    {playlist.items.length !== 1 ? "s" : ""}
                  </td>
                  <td className="p-2 sm:p-4 text-sm sm:text-base">
                    {formatTimeToMinSec(calculateDuration(playlist.items))} MIN
                  </td>
                  <td className="p-2 sm:p-4 text-sm sm:text-base text-muted-foreground">
                    {playlist.createdAt
                      ? formatRelativeTime(playlist.createdAt)
                      : "Unknown"}
                  </td>
                  <td className="p-2 sm:p-4 text-right flex justify-end gap-2">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => {
                        showRenamePlaylist(playlist.name);
                      }}
                      aria-label={`Rename playlist ${playlist.name}`}
                    >
                      <svg
                        className="w-5 h-5 fill-current"
                        xmlns="http://www.w3.org/2000/svg"
                        viewBox="0 0 512 512"
                      >
                        <path d="M471.6 21.7c-21.9-21.9-57.3-21.9-79.2 0L362.3 51.7l97.9 97.9 30.1-30.1c21.9-21.9 21.9-57.3 0-79.2L471.6 21.7zm-299.2 220c-6.1 6.1-10.8 13.6-13.5 21.9l-29.6 88.8c-2.9 8.6-.6 18.1 5.8 24.6s15.9 8.7 24.6 5.8l88.8-29.6c8.2-2.7 15.7-7.4 21.9-13.5L437.7 172.3 339.7 74.3 172.4 241.7zM96 64C43 64 0 107 0 160V416c0 53 43 96 96 96H352c53 0 96-43 96-96V320c0-17.7-14.3-32-32-32s-32 14.3-32 32V416c0 17.7-14.3 32-32 32H96c-17.7 0-32-14.3-32-32V160c0-17.7 14.3-32 32-32H192c17.7 0 32-14.3 32-32s-14.3-32-32-32H96z" />
                      </svg>
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => showDeleteConfirm(playlist.name)}
                      aria-label={`Delete playlist ${playlist.name}`}
                    >
                      <svg
                        className="w-5 h-5 fill-current"
                        xmlns="http://www.w3.org/2000/svg"
                        viewBox="0 0 512 512"
                      >
                        <path d="M256 512c141.4 0 256-114.6 256-256S397.4 0 256 0S0 114.6 0 256S114.6 512 256 512zM184 232H328c13.3 0 24 10.7 24 24s-10.7 24-24 24H184c-13.3 0-24-10.7-24-24s10.7-24 24-24z" />
                      </svg>
                    </Button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          {/* Card layout for mobile */}
          <div className="sm:hidden flex flex-col gap-4">
            {paginatedPlaylists.map((playlist) => (
              <div
                key={playlist.name}
                className="p-4 bg-background border border-border rounded-lg shadow-sm hover:bg-muted/50"
              >
                <div className="flex flex-col gap-2">
                  <div className="flex justify-between items-center">
                    <Link
                      href={`/playlists/${encodeURIComponent(playlist.name)}`}
                      className="text-foreground hover:underline text-sm font-medium"
                    >
                      {playlist.name}
                    </Link>
                  </div>
                  <div className="text-sm text-foreground">
                    <span>
                      {playlist.items.length} video
                      {playlist.items.length !== 1 ? "s" : ""}
                    </span>
                    <span className="mx-2">•</span>
                    <span>
                      {formatTimeToMinSec(calculateDuration(playlist.items))}{" "}
                      MIN
                    </span>
                  </div>
                  <div className="text-sm text-muted-foreground">
                    {playlist.createdAt
                      ? formatRelativeTime(playlist.createdAt)
                      : "Unknown"}
                  </div>
                  <div className="flex justify-end gap-2">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => {
                        showRenamePlaylist(playlist.name);
                      }}
                      aria-label={`Rename playlist ${playlist.name}`}
                    >
                      <svg
                        className="w-4 h-4 fill-current"
                        xmlns="http://www.w3.org/2000/svg"
                        viewBox="0 0 512 512"
                      >
                        <path d="M471.6 21.7c-21.9-21.9-57.3-21.9-79.2 0L362.3 51.7l97.9 97.9 30.1-30.1c21.9-21.9 21.9-57.3 0-79.2L471.6 21.7zm-299.2 220c-6.1 6.1-10.8 13.6-13.5 21.9l-29.6 88.8c-2.9 8.6-.6 18.1 5.8 24.6s15.9 8.7 24.6 5.8l88.8-29.6c8.2-2.7 15.7-7.4 21.9-13.5L437.7 172.3 339.7 74.3 172.4 241.7zM96 64C43 64 0 107 0 160V416c0 53 43 96 96 96H352c53 0 96-43 96-96V320c0-17.7-14.3-32-32-32s-32 14.3-32 32V416c0 17.7-14.3 32-32 32H96c-17.7 0-32-14.3-32-32V160c0-17.7 14.3-32 32-32H192c17.7 0 32-14.3 32-32s-14.3-32-32-32H96z" />
                      </svg>
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => showDeleteConfirm(playlist.name)}
                      aria-label={`Delete playlist ${playlist.name}`}
                    >
                      <svg
                        className="w-4 h-4 fill-current"
                        xmlns="http://www.w3.org/2000/svg"
                        viewBox="0 0 512 512"
                      >
                        <path d="M256 512c141.4 0 256-114.6 256-256S397.4 0 256 0S0 114.6 0 256S114.6 512 256 512zM184 232H328c13.3 0 24 10.7 24 24s-10.7 24-24 24H184c-13.3 0-24-10.7-24-24s10.7-24 24-24z" />
                      </svg>
                    </Button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )) || (
        <div className="flex flex-col items-center justify-center h-[calc(100dvh-25rem)]">
          <svg
            className="w-16 sm:w-20 h-16 sm:h-20 fill-secondary animate-pulse"
            xmlns="http://www.w3.org/2000/svg"
            viewBox="0 0 512 512"
          >
            <path d="M0 96C0 60.7 28.7 32 64 32H448c35.3 0 64 28.7 64 64V416c0 35.3-28.7 64-64 64H64c-35.3 0-64-28.7-64-64V96zm64 64V416H448V160H64zm80 80c0-8.8 7.2-16 16-16H352c8.8 0 16 7.2 16 16s-7.2 16-16 16H160c-8.8 0-16-7.2-16-16zm0 64c0-8.8 7.2-16 16-16H352c8.8 0 16 7.2 16 16s-7.2 16-16 16H160c-8.8 0-16-7.2-16-16zm0 64c0-8.8 7.2-16 16-16H352c8.8 0 16 7.2 16 16s-7.2 16-16 16H160c-8.8 0-16-7.2-16-16z" />
          </svg>
          <span className="mt-6 sm:mt-8 text-2xl sm:text-3xl font-bold font-mono text-secondary animate-pulse text-center max-w-md">
            No Playlists, Create One to Start!
          </span>
        </div>
      )}
      {totalPages > 1 && (
        <div className="flex justify-center items-center gap-4 mt-6">
          <Button
            variant="outline"
            onClick={handlePrevious}
            disabled={currentPage === 1}
            aria-label="Previous page"
            className="text-sm sm:text-base"
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
            aria-label="Next page"
            className="text-sm sm:text-base"
          >
            Next
          </Button>
        </div>
      )}
    </section>
  );
}
