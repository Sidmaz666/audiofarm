import { Peachy, useState } from "@peach/component";
import MediaSection from "@components/MediaCard";
import Button from "@components/Button"; // Added Button import
import { formatTimeToMinSec } from "@utils/formatTime";
import { useMemo } from "@utils/useMemo";
import { getAllHistory, clearHistory } from "@utils/useDB.js";
import {
  DialogManager,
  ErrorDialogContent,
  DeleteConfirmDialogContent,
} from "@components/Dialog";

export default function HistoryPage() {
  let [data, setData] = useState([]);
  const [currentPage, setCurrentPage] = useState(1); // Added page state
  const itemsPerPage = 10; // Adjust this number as needed

  // Calculate paginated data
  const paginatedData = useMemo("PaginatedHistory", [data, currentPage], () => {
    const startIndex = (currentPage - 1) * itemsPerPage;
    return data.slice(startIndex, startIndex + itemsPerPage);
  });

  // Calculate total pages
  const totalPages = Math.ceil(data.length / itemsPerPage);

  // Handle page navigation
  const handlePrevious = () => {
    setCurrentPage((prev) => Math.max(prev - 1, 1));
  };

  const handleNext = () => {
    setCurrentPage((prev) => Math.min(prev + 1, totalPages));
  };

  // Show clear history confirmation dialog
  const showClearConfirm = () => {
    DialogManager.show(
      "clear-history-confirm-dialog",
      DeleteConfirmDialogContent,
      {
        name: "all history",
        title: "Clear History",
        onConfirm: handleClearHistory,
        onCancel: () => DialogManager.hide("clear-history-confirm-dialog"),
      },
      () => DialogManager.hide("clear-history-confirm-dialog")
    );
  };

  // Handle clear history
  const handleClearHistory = async () => {
    try {
      await clearHistory();
      setData([]);
      DialogManager.hide("clear-history-confirm-dialog");
    } catch (error) {
      DialogManager.show(
        "error-dialog",
        ErrorDialogContent,
        {
          message: error.message || "Failed to clear history",
          onClose: () => DialogManager.hide("error-dialog"),
        },
        () => DialogManager.hide("error-dialog")
      );
    }
  };

  // Lifecycle for cleanup
  HistoryPage.__lifecycle = {
    unmount() {
      DialogManager.hide("error-dialog");
      DialogManager.hide("clear-history-confirm-dialog");
    },
  };

  const memoizedOutput = useMemo(
    "History",
    [paginatedData ? paginatedData?.length > 0 : null, currentPage],
    () => {
      getAllHistory().then((e) => {
        setData(e);
      });
      return (
        <section className="flex-1 container mx-auto px-4 relative z-10 py-20 pb-40 pt-6 flex flex-col">
          <div className="flex justify-end items-center">
            {paginatedData?.length > 0 && (
              <Button
                variant="ghost"
                onClick={showClearConfirm}
                className="border border-border hover:border-none"
              >
                Clear History
              </Button>
            )}
          </div>
          {(paginatedData && paginatedData?.length > 0 && (
            <MediaSection
              isLoading={false}
              isError={false}
              label={`History`}
              data={paginatedData} // Use paginated data instead of full data
            />
          )) ||
            (paginatedData?.length === 0 && (
              <div className="flex flex-col items-center justify-center  h-[calc(100dvh-20rem)]">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="w-20 h-20 fill-secondary animate-pulse"
                  viewBox="0 0 512 512"
                >
                  <path d="M75 75L41 41C25.9 25.9 0 36.6 0 57.9L0 168c0 13.3 10.7 24 24 24l110.1 0c21.4 0 32.1-25.9 17-41l-30.8-30.8C155 85.5 203 64 256 64c106 0 192 86 192 192s-86 192-192 192c-40.8 0-78.6-12.7-109.7-34.4c-14.5-10.1-34.4-6.6-44.6 7.9s-6.6 34.4 7.9 44.6C151.2 495 201.7 512 256 512c141.4 0 256-114.6 256-256S397.4 0 256 0C185.3 0 121.3 28.7 75 75zm181 53c-13.3 0-24 10.7-24 24l0 104c0 6.4 2.5 12.5 7 17l72 72c9.4 9.4 24.6 9.4 33.9 0s9.4-24.6 0-33.9l-65-65 0-94.1c0-13.3-10.7-24-24-24z" />
                </svg>
                <span className="mt-8 text-3xl font-bold font-mono text-secondary animate-pulse text-center max-w-md">
                  No History, Start Exploring.
                </span>
              </div>
            ))}

          {/* Pagination Controls */}
          {totalPages > 1 && (
            <div className="flex justify-center items-center gap-4 mt-6">
              <Button
                variant="outline"
                onClick={handlePrevious}
                disabled={currentPage === 1}
              >
                Previous
              </Button>
              <span className="text-sm">
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
