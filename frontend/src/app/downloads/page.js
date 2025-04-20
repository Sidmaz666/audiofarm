import { Peachy, useState } from "@peach/component";
import Button from "@components/Button";
import {
  getAllDownloads,
  removeDownload,
  clearStore,
  STORES,
} from "@utils/useDB.js";
import Link from "@components/Link";
import { formatTimeToMinSec, formatRelativeTime } from "@utils/formatTime";
import {
  DialogManager,
  ErrorDialogContent,
  DeleteConfirmDialogContent,
} from "@components/Dialog";
import { AppState } from "@peach/state";
import Image from "@components/Image";

export default function DownloadsPage() {
  let [downloads, setDownloads] = useState([]);
  let [currentPage, setCurrentPage] = useState(1);
  let [deleteDownloadId, setDeleteDownloadId] = useState(null);

  const itemsPerPage = 10; // Consistent with PlaylistsPage and FavoritesPage

  // Fetch downloads
  const fetchDownloads = async () => {
    try {
      const allDownloads = await getAllDownloads();
      if (allDownloads?.length > 0) setDownloads([...allDownloads]);
    } catch (error) {
      console.error("Error fetching downloads:", error);
      showError("Failed to load downloads");
    }
  };

  // Initialize downloads
  if (downloads.length === 0) {
    fetchDownloads();
  }

  const startIndex = (currentPage - 1) * itemsPerPage;
  // Calculate paginated downloads
  const paginatedDownloads = downloads
    .slice()
    .sort(
      (a, b) =>
        new Date(b.binary?.videoDetails?.uploadDate) -
        new Date(a.binary?.videoDetails?.uploadDate)
    )
    .slice(startIndex, startIndex + itemsPerPage);

  // Calculate total pages
  const totalPages = Math.ceil(downloads.length / itemsPerPage);

  // Handle page navigation
  const handlePrevious = () => setCurrentPage((prev) => Math.max(prev - 1, 1));
  const handleNext = () =>
    setCurrentPage((prev) => Math.min(prev + 1, totalPages));

  // Show error dialog
  const showError = (message) => {
    DialogManager.show(
      "error-dialog",
      ErrorDialogContent,
      { message, onClose: () => DialogManager.hide("error-dialog") },
      () => DialogManager.hide("error-dialog")
    );
  };

  // Show delete confirmation dialog for individual download
  const showDeleteConfirm = (e, id, title) => {
    e.preventDefault();
    e.stopPropagation();
    setDeleteDownloadId(id);
    DialogManager.show(
      "delete-confirm-dialog",
      DeleteConfirmDialogContent,
      {
        name: title || id, // Use title if available, else id
        title: "Delete Download",
        onConfirm: () => handleDeleteDownload(id),
        onCancel: () => {
          setDeleteDownloadId(null);
          DialogManager.hide("delete-confirm-dialog");
        },
      },
      () => {
        setDeleteDownloadId(null);
        DialogManager.hide("delete-confirm-dialog");
      }
    );
  };

  // Show clear all downloads confirmation dialog
  const showClearConfirm = () => {
    DialogManager.show(
      "clear-downloads-confirm-dialog",
      DeleteConfirmDialogContent,
      {
        name: "all downloads",
        title: "Clear All Downloads",
        onConfirm: handleClearDownloads,
        onCancel: () => DialogManager.hide("clear-downloads-confirm-dialog"),
      },
      () => DialogManager.hide("clear-downloads-confirm-dialog")
    );
  };

  // Handle delete download
  const handleDeleteDownload = async (id) => {
    try {
      await removeDownload(id);
      await fetchDownloads();
      DialogManager.hide("delete-confirm-dialog");
    } catch (error) {
      showError(error.message || "Failed to delete download");
    }
  };

  // Handle clear all downloads
  const handleClearDownloads = async () => {
    try {
      await clearStore(STORES.DOWNLOADS);
      setDownloads([]);
      DialogManager.hide("clear-downloads-confirm-dialog");
    } catch (error) {
      showError(error.message || "Failed to clear downloads");
    }
  };

  // Handle local download
  const handleLocalDownload = (e, blob, title) => {
    e.preventDefault();
    e.stopPropagation();
    try {
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = title ? `${title}.mp3` : `download_${Date.now()}.mp3`; // Default to .mp4, adjust extension if needed
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url); // Clean up
    } catch (error) {
      console.error("Local download error:", error);
      showError("Failed to download file locally");
    }
  };

  // Lifecycle for cleanup
  DownloadsPage.__lifecycle = {
    unmount() {
      DialogManager.hide("error-dialog");
      DialogManager.hide("delete-confirm-dialog");
      DialogManager.hide("clear-downloads-confirm-dialog");
    },
  };

  return (
    <section className="flex-1 container mx-auto px-4 pb-20 relative z-10 py-20 pt-6 flex flex-col">
      {/* Header Section */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6 gap-4">
        <h1 className="font-bold font-mono text-2xl text-foreground">
          Downloads
        </h1>
        {downloads.length > 0 && (
          <div className="w-full md:w-auto flex justify-end space-x-2">
            <Button
              variant="ghost"
              className="border border-border hover:border-none text-sm sm:text-base"
              onClick={showClearConfirm}
              aria-label="Clear all downloads"
            >
              Clear Downloads
            </Button>
          </div>
        )}
      </div>

      {(paginatedDownloads && paginatedDownloads.length > 0 && (
        <div className="overflow-x-auto">
          {/* Table for larger screens */}
          <table className="w-full border-collapse hidden sm:table">
            <tbody>
              {paginatedDownloads.map((download) => (
                <tr
                  key={download.id}
                  onClick={() => {
                    AppState.set("player", download.binary.videoDetails);
                    const queue = AppState.get("queue") || [];
                    AppState.set("queue", [
                      ...downloads.map((e) => {
                        return { ...e.videoDetails };
                      }),
                      ...queue,
                    ]);
                  }}
                  className="border-b border-border hover:bg-muted/50 cursor-pointer"
                >
                  <td className="p-2 sm:p-4 min-w-[150px] flex items-center gap-2">
                    {download.binary?.videoDetails?.thumbnail && (
                      <Image
                        src={download.binary.videoDetails.thumbnail}
                        alt={download.binary.videoDetails.title}
                        className="w-12 h-12 object-cover rounded"
                      />
                    )}
                    <Link
                      href={`/media/${encodeURIComponent(download.id)}`}
                      className="text-foreground hover:underline text-sm sm:text-base"
                    >
                      {download.binary?.videoDetails?.title}
                    </Link>
                  </td>
                  <td className="p-2 sm:p-4 text-sm sm:text-base">
                    {formatTimeToMinSec(
                      download.binary?.videoDetails?.duration || 0
                    )}{" "}
                    MIN
                  </td>
                  <td className="p-2 sm:p-4 text-sm sm:text-base text-muted-foreground">
                    {download.binary?.videoDetails?.uploadDate
                      ? formatRelativeTime(
                          download.binary.videoDetails.uploadDate
                        )
                      : "Unknown"}
                  </td>
                  <td className="p-2 sm:p-4 flex justify-center items-center gap-2">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={(e) =>
                        handleLocalDownload(
                          e,
                          download.binary.blob,
                          download.binary.videoDetails?.title
                        )
                      }
                      aria-label={`Download ${download.binary?.videoDetails?.title} locally`}
                    >
                      <svg
                        className="w-5 h-5 fill-current"
                        xmlns="http://www.w3.org/2000/svg"
                        viewBox="0 0 512 512"
                      >
                        <path d="M288 32c0-17.7-14.3-32-32-32s-32 14.3-32 32V274.7l-73.4-73.4c-12.5-12.5-32.8-12.5-45.3 0s-12.5 32.8 0 45.3l128 128c12.5 12.5 32.8 12.5 45.3 0l128-128c12.5-12.5 12.5-32.8 0-45.3s-32.8-12.5-45.3 0L288 274.7V32zM64 352c-35.3 0-64 28.7-64 64v32c0 35.3 28.7 64 64 64H448c35.3 0 64-28.7 64-64V416c0-35.3-28.7-64-64-64H346.5l-45.3 45.3c-25 25-65.5 25-90.5 0L165.5 352H64zm368 56a24 24 0 1 1 0 48 24 24 0 1 1 0-48z" />
                      </svg>
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={(e) =>
                        showDeleteConfirm(
                          e,
                          download.id,
                          download.binary?.videoDetails?.title
                        )
                      }
                      aria-label={`Delete download ${download.binary?.videoDetails?.title}`}
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
            {paginatedDownloads.map((download) => (
              <div
                key={download.id}
                className="p-4 bg-background border border-border rounded-lg shadow-sm hover:bg-muted/50"
              >
                <div className="flex flex-col gap-2">
                  <div className="flex items-center gap-2">
                    {download.binary?.videoDetails?.thumbnail && (
                      <Image
                        src={download.binary.videoDetails.thumbnail}
                        alt={download.binary.videoDetails.title}
                        className="w-10 h-10 object-cover rounded"
                      />
                    )}
                    <Link
                      href={`/media/${encodeURIComponent(download.id)}`}
                      className="text-foreground hover:underline text-sm font-medium"
                    >
                      {download.binary?.videoDetails?.title}
                    </Link>
                  </div>
                  <div className="text-sm text-foreground">
                    <span>
                      {formatTimeToMinSec(
                        download.binary?.videoDetails?.duration || 0
                      )}{" "}
                      MIN
                    </span>
                  </div>
                  <div className="text-sm text-muted-foreground">
                    {download.binary?.videoDetails?.uploadDate
                      ? formatRelativeTime(
                          download.binary.videoDetails.uploadDate
                        )
                      : "Unknown"}
                  </div>
                  <div className="flex justify-end gap-2">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() =>
                        handleLocalDownload(
                          download.binary.blob,
                          download.binary.videoDetails?.title
                        )
                      }
                      aria-label={`Download ${download.binary?.videoDetails?.title} locally`}
                    >
                      <svg
                        className="w-4 h-4 fill-current"
                        xmlns="http://www.w3.org/2000/svg"
                        viewBox="0 0 512 512"
                      >
                        <path d="M288 32c0-17.7-14.3-32-32-32s-32 14.3-32 32V274.7l-73.4-73.4c-12.5-12.5-32.8-12.5-45.3 0s-12.5 32.8 0 45.3l128 128c12.5 12.5 32.8 12.5 45.3 0l128-128c12.5-12.5 12.5-32.8 0-45.3s-32.8-12.5-45.3 0L288 274.7V32zM64 352c-35.3 0-64 28.7-64 64v32c0 35.3 28.7 64 64 64H448c35.3 0 64-28.7 64-64V416c0-35.3-28.7-64-64-64H346.5l-45.3 45.3c-25 25-65.5 25-90.5 0L165.5 352H64zm368 56a24 24 0 1 1 0 48 24 24 0 1 1 0-48z" />
                      </svg>
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() =>
                        showDeleteConfirm(
                          download.id,
                          download.binary?.videoDetails?.title
                        )
                      }
                      aria-label={`Delete download ${download.binary?.videoDetails?.title}`}
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
            <path d="M288 32c0-17.7-14.3-32-32-32s-32 14.3-32 32l0 242.7-73.4-73.4c-12.5-12.5-32.8-12.5-45.3 0s-12.5 32.8 0 45.3l128 128c12.5 12.5 32.8 12.5 45.3 0l128-128c12.5-12.5 12.5-32.8 0-45.3s-32.8-12.5-45.3 0L288 274.7 288 32zM64 352c-35.3 0-64 28.7-64 64l0 32c0 35.3 28.7 64 64 64H448c35.3 0 64-28.7 64-64l0-32c0-35.3-28.7-64-64-64l-101.5 0-45.3 45.3c-25 25-65.5 25-90.5 0L165.5 352 64 352zm368 56a24 24 0 1 1 0 48 24 24 0 1 1 0-48z" />
          </svg>
          <span className="mt-6 sm:mt-8 text-2xl sm:text-3xl font-bold font-mono text-secondary animate-pulse text-center max-w-md">
            No Downloads, Start Downloading Some!
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
