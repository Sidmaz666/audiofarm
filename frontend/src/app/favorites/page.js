import { Peachy, useState } from "@peach/component";
import MediaSection from "@components/MediaCard";
import Button from "@components/Button";
import { formatTimeToMinSec } from "@utils/formatTime";
import { useMemo } from "@utils/useMemo";
import {
  addFavorite,
  getFavorite,
  getAllFavorites,
  removeFavorite,
  clearFavorites,
} from "@utils/useDB.js";

export default function FavoritesPage() {
  let [data, setData] = useState([]);
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10; // Consistent with HistoryPage

  // Calculate paginated data
  const paginatedData = useMemo(
    "PaginatedFavorites",
    [data, currentPage],
    () => {
      // Initialize data if not already set
      if (data.length === 0) {
        getAllFavorites().then((e) => {
          setData(e);
        });
      }
      const startIndex = (currentPage - 1) * itemsPerPage;
      return data.slice(startIndex, startIndex + itemsPerPage);
    }
  );

  // Calculate total pages
  const totalPages = Math.ceil(data.length / itemsPerPage);

  // Handle page navigation
  const handlePrevious = () => {
    setCurrentPage((prev) => Math.max(prev - 1, 1));
  };

  const handleNext = () => {
    setCurrentPage((prev) => Math.min(prev + 1, totalPages));
  };

  const memoizedOutput = useMemo(
    "Favorites",
    [
      paginatedData ? paginatedData?.length > 0 : null,
      paginatedData,
      currentPage,
    ],
    () => {
      return (
        <section className="flex-1 container mx-auto px-4 relative z-10 py-20 pb-40 pt-6 flex flex-col">
          <div className="flex justify-end items-center">
            {paginatedData?.length > 0 && (
              <Button
                variant="ghost"
                onClick={async () => {
                  await clearFavorites();
                  setData([]);
                }}
                className="border border-border hover:border-none"
              >
                Clear Favorites
              </Button>
            )}
          </div>
          {(paginatedData && paginatedData?.length > 0 && (
            <MediaSection
              isLoading={false}
              isError={false}
              label={`Favorites`}
              data={paginatedData}
            />
          )) ||
            (paginatedData?.length === 0 && (
              <div className="flex flex-col items-center justify-center h-[calc(100dvh-20rem)]">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="w-20 h-20 fill-secondary animate-pulse"
                  viewBox="0 0 512 512"
                >
                  <path d="M225.8 468.2L208 480l-17.8-11.8C77.3 389.3 0 279.7 0 256c0-23.7 77.3-133.3 190.2-212.2L208 32l17.8 11.8C338.7 122.7 416 232.3 416 256s-77.3 133.3-190.2 212.2zM208 112c-79.5 0-144 64.5-144 144s64.5 144 144 144 144-64.5 144-144-64.5-144-144-144zm0 208c-35.3 0-64-28.7-64-64s28.7-64 64-64 64 28.7 64 64-28.7 64-64 64z" />
                </svg>
                <span className="mt-8 text-3xl font-bold font-mono text-secondary animate-pulse text-center max-w-md">
                  No Favorites, Start Adding Some!
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
