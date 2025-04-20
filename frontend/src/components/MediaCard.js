import { Peachy, useState, useGlobalState } from "@peach/component";
import { searchVideos } from "@utils/api";
import Link from "@components/Link";
import { formatTimeToMinSec } from "@utils/formatTime";
import { AppState } from "@peach/state";
import {
  addHistory,
  addFavorite,
  removeFavorite,
  getFavorite,
  addToPlaylist,
  removeFromPlaylist,
} from "@utils/useDB.js";
import { DialogManager, AddToPlaylistDialogContent } from "@components/Dialog";
import Image from "@components/Image";


const HeartAddIcon = () => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    viewBox="0 0 576 512"
    className="w-4 h-4"
    fill="currentColor"
  >
    <path d="M47.6 300.4L228.3 469.1c7.5 7 17.4 10.9 27.7 10.9s20.2-3.9 27.7-10.9l2.6-2.4C267.2 438.6 256 404.6 256 368c0-97.2 78.8-176 176-176c28.3 0 55 6.7 78.7 18.5c.9-6.5 1.3-13 1.3-19.6l0-5.8c0-69.9-50.5-129.5-119.4-141C347 36.5 300.6 51.4 268 84L256 96 244 84c-32.6-32.6-79-47.5-124.6-39.9C50.5 55.6 0 115.2 0 185.1l0 5.8c0 41.5 17.2 81.2 47.6 109.5zM432 512a144 144 0 1 0 0-288 144 144 0 1 0 0 288zm16-208l0 48 48 0c8.8 0 16 7.2 16 16s-7.2 16-16 16l-48 0 0 48c0 8.8-7.2 16-16 16s-16-7.2-16-16l0-48-48 0c-8.8 0-16-7.2-16-16s7.2-16 16-16l48 0 0-48c0-8.8 7.2-16 16-16s16 7.2 16 16z" />
  </svg>
);

const AddQueueIcon = () => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    viewBox="0 0 512 512"
    className="w-4 h-4"
    fill="currentColor"
  >
    <path d="M152.1 38.2c9.9 8.9 10.7 24 1.8 33.9l-72 80c-4.4 4.9-10.6 7.8-17.2 7.9s-12.9-2.4-17.6-7L7 113C-2.3 103.6-2.3 88.4 7 79s24.6-9.4 33.9 0l22.1 22.1 55.1-61.2c8.9-9.9 24-10.7 33.9-1.8zm0 160c9.9 8.9 10.7 24 1.8 33.9l-72 80c-4.4 4.9-10.6 7.8-17.2 7.9s-12.9-2.4-17.6-7L7 273c-9.4-9.4-9.4-24.6 0-33.9s24.6-9.4 33.9 0l22.1 22.1 55.1-61.2c8.9-9.9 24-10.7 33.9-1.8zM224 96c0-17.7 14.3-32 32-32l224 0c17.7 0 32 14.3 32 32s-14.3 32-32 32l-224 0c-17.7 0-32-14.3-32-32zm0 160c0-17.7 14.3-32 32-32l224 0c17.7 0 32 14.3 32 32s-14.3 32-32 32l-224 0c-17.7 0-32-14.3-32-32zM160 416c0-17.7 14.3-32 32-32l288 0c17.7 0 32 14.3 32 32s-14.3 32-32 32l-288 0c-17.7 0-32-14.3-32-32zM48 368a48 48 0 1 1 0 96 48 48 0 1 1 0-96z" />
  </svg>
);

const CheckedIcon = () => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    viewBox="0 0 512 512"
    className="w-4 h-4"
    fill="currentColor"
  >
    <path d="M438.6 105.4c12.5 12.5 12.5 32.8 0 45.3l-256 256c-12.5 12.5-32.8 12.5-45.3 0l-128-128c-12.5-12.5-12.5-32.8 0-45.3s32.8-12.5 45.3 0L160 338.7 393.4 105.4c12.5-12.5 32.8-12.5 45.3 0z" />
  </svg>
);

const AddPlaylistIcon = () => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    viewBox="0 0 512 512"
    className="w-4 h-4"
    fill="currentColor"
  >
    <path d="M0 96C0 60.7 28.7 32 64 32H448c35.3 0 64 28.7 64 64V416c0 35.3-28.7 64-64 64H64c-35.3 0-64-28.7-64-64V96zm64 64V416H448V160H64zm80 80c0-8.8 7.2-16 16-16H352c8.8 0 16 7.2 16 16s-7.2 16-16 16H160c-8.8 0-16-7.2-16-16zm0 64c0-8.8 7.2-16 16-16H352c8.8 0 16 7.2 16 16s-7.2 16-16 16H160c-8.8 0-16-7.2-16-16zm0 64c0-8.8 7.2-16 16-16H352c8.8 0 16 7.2 16 16s-7.2 16-16 16H160c-8.8 0-16-7.2-16-16z" />
  </svg>
);

const AddToQueueButton = ({ id, title, thumbnail, uploadDate, duration }) => {
  const [currentQueue, setCurrentQueue] = useGlobalState(AppState, "queue");
  const handleQueue = (e) => {
    if (currentQueue?.length > 0) {
      e.preventDefault();
      e.stopPropagation();
    }
    if (currentQueue?.find((e) => e?.id === id)) {
      setCurrentQueue([...currentQueue?.filter((e) => e?.id !== id)]);
    } else {
      const _cq = currentQueue ? [...currentQueue] : [];
      setCurrentQueue([
        ..._cq,
        {
          id,
          title,
          thumbnail,
          uploadDate,
          duration,
        },
      ]);
    }
  };
  // console.log(currentQueue);

  return (
    <button
      onClick={handleQueue}
      className={`absolute top-9 right-2 p-1 rounded-full transition 
      ${
        currentQueue?.find((e) => e?.id === id)
          ? "bg-primary text-primary-foreground hover:bg-background/70"
          : "bg-background/70 backdrop-blur-sm hover:text-primary"
      }`}
    >
      {currentQueue?.find((e) => e?.id === id) ? (
        <CheckedIcon />
      ) : (
        <AddQueueIcon />
      )}
    </button>
  );
};

const AddToPlaylistButton = ({
  id,
  title,
  thumbnail,
  uploadDate,
  duration,
}) => {
  const handleAddToPlaylist = (e) => {
    e.preventDefault();
    e.stopPropagation();
    DialogManager.show(
      "add-to-playlist-dialog",
      AddToPlaylistDialogContent,
      {
        video: { id, title, thumbnail, uploadDate, duration },
        onSubmit: async (selectedPlaylists) => {
          try {
            for (const [playlistName, checked] of selectedPlaylists) {
              if (checked) {
                await addToPlaylist(playlistName, {
                  id,
                  title,
                  thumbnail,
                  uploadDate,
                  duration,
                });
              } else {
                await removeFromPlaylist(playlistName, id);
              }
            }
            DialogManager.hide("add-to-playlist-dialog");
          } catch (error) {
            console.error("Error adding to playlists:", error);
            DialogManager.show(
              "error-dialog",
              ErrorDialogContent,
              { message: "Failed to add video to playlists" },
              () => DialogManager.hide("error-dialog")
            );
          }
        },
        onCancel: () => DialogManager.hide("add-to-playlist-dialog"),
      },
      () => DialogManager.hide("add-to-playlist-dialog")
    );
  };

  return (
    <button
      onClick={handleAddToPlaylist}
      className="absolute top-16 right-2 p-1 rounded-full transition bg-background/70 backdrop-blur-sm hover:text-primary"
      title="Add to Playlist"
    >
      <AddPlaylistIcon />
    </button>
  );
};

export function MediaCard({ id, title, thumbnail, uploadDate, duration }) {
  // local highlight state
  const [isFav, setIsFav] = useState(false);

  // immediately fetch current DB state (runs every render, but setState only if it changes)
  (async () => {
    const favRec = await getFavorite(id);
    if (!!favRec !== isFav) setIsFav(!!favRec);
  })();

  // handle marking as favorite
  const handleFavorite = async (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (isFav) {
      await removeFavorite(id);
      setIsFav(false);
    } else {
      await addFavorite({ id, title, thumbnail, uploadDate, duration });
      setIsFav(true);
    }
  };

  // log history when navigating
  const handleNavigate = async () => {
    await addHistory({ id, title, thumbnail, uploadDate, duration });
  };

  return (
    <Link
      href={`/media/${id}`}
      onClick={handleNavigate}
      key={id}
      className="w-full overflow-hidden rounded-lg bg-background shadow-md transition hover:scale-[1.01314] cursor-pointer relative"
    >
      <Image
        src={thumbnail}
        className="h-38 w-full bg-muted flex items-center justify-center text-muted-foreground text-sm font-medium"
      />

      <AddToQueueButton
        id={id}
        title={title}
        thumbnail={thumbnail}
        uploadDate={uploadDate}
        duration={duration}
      />

      <AddToPlaylistButton
        id={id}
        title={title}
        thumbnail={thumbnail}
        uploadDate={uploadDate}
        duration={duration}
      />

      {/* Favorite button */}
      <button
        title="Add to Favorite"
        onClick={handleFavorite}
        className={`absolute top-2 right-2 p-1 rounded-full transition  
          ${
            isFav
              ? "bg-primary text-primary-foreground hover:bg-background/70"
              : "bg-background/70 backdrop-blur-sm hover:text-primary"
          }`}
      >
        <HeartAddIcon />
      </button>

      <div className="p-4 space-y-2">
        <h3 className="text-base font-semibold text-foreground line-clamp-2 break-all">
          {title}
        </h3>
        <div className="text-sm text-muted-foreground flex flex-col gap-1">
          <span>
            {uploadDate} • {formatTimeToMinSec(duration)} min
          </span>
        </div>
      </div>
    </Link>
  );
}

// The skeleton loader version with animation.
export function MediaSkeleton() {
  return (
    <div className="w-full h-full justify-self-stretch rounded-lg bg-background shadow-md">
      <div className="h-32 w-full flex items-center justify-center text-muted-foreground text-sm font-medium ">
        <div className="h-full w-full bg-secondary rounded-lg animate-pulse"></div>
      </div>

      <div className="py-2 px-1 space-y-2">
        <div className="h-5 w-4/5 bg-secondary animate-pulse rounded-lg" />
        <div className="h-5 w-1/2 bg-secondary animate-pulse rounded-lg" />
      </div>
    </div>
  );
}

export default function MediaSection({
  label,
  button,
  query,
  page,
  limit,
  data,
  isLoading,
  isError,
}) {
  // Use query-based fetching if query is provided, otherwise use prop-based data
  const [fetchLoading, fetchResponse, fetchError] = query
    ? searchVideos(query, page, limit)
    : [isLoading ?? false, data ?? null, isError ?? false];

  // Determine final state
  const getLoading = fetchLoading;
  const getResponse = query ? fetchResponse : { results: data ?? [] };
  const getError = fetchError;

  return (
    <div className="flex-1 container mx-auto px-4 pb-8 relative flex flex-col">
      <div className="flex w-full justify-between items-center">
        <span className="font-bold font-mono text-2xl">{label}</span>
      </div>
      <div className="media-container grid md:grid-cols-3 sm:grid-cols-2 grid-cols-1 gap-4 mt-4 place-items-center">
        {getError && !getLoading && (
          <div className="bg-secondary rounded-md p-4 w-full">
            <p className="text-muted-foreground font-medium text-center">
              An error occurred. Please try again later.
            </p>
          </div>
        )}

        {getLoading
          ? Array.from({ length: 9 }, (_, i) => <MediaSkeleton key={i} />)
          : getResponse?.results?.map((d, i) => (
              <MediaCard key={d.id || i} {...d} />
            ))}
      </div>
      {button && (
        <div className="flex items-center justify-center mt-4">{button}</div>
      )}
    </div>
  );
}
