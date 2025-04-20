import { useState, Peachy } from "@peach/component";
import { AppState } from "@peach/state";
import { getVideoInfo } from "@utils/api";
import MediaSection from "@components/MediaCard";
import { formatTimeToMinSec } from "@utils/formatTime";
import Image from "@components/Image";


export default function MediaPage({ params }) {
  const { id } = params;
  if (!id) return null;
  const [getLoading, getResponse, getError] = getVideoInfo(id);
  const [showDescription, setShowDescription] = useState(false);

  if (!getLoading && !getError && getResponse) {
    const newMedia = {
      id,
      title: getResponse?.videoDetails?.title?.replace(
        /[^A-Za-z0-9+/=\s]/g,
        ""
      ),
      thumbnail: getResponse?.videoDetails?.thumbnails[0]?.url,
      author: getResponse?.videoDetails?.author,
      duration: getResponse?.videoDetails?.lengthSeconds,
      // ...getResponse?.bestFormat,
    };

    AppState.set("player", newMedia);

    // Update the Queue
    const currentQueue = AppState.get("queue");
    const queue = currentQueue || [];
    const existingIndex = queue.findIndex((item) => item.id === id);

    if (existingIndex === -1) {
      // Add new media to queue if not already present
      AppState.set("queue", [...queue, newMedia]);
    }
  }
  //console.log(getResponse?.videoDetails);

  const related_videos = getResponse?.related_videos.map((video) => ({
    id: video.id,
    title: video.title,
    thumbnail: video.thumbnails[0]?.url,
    uploadDate: video.published,
    duration: video.length_seconds,
  }));

  return (
    <section className="flex-1 container mx-auto px-4 relative z-10 py-20 pb-40 pt-6 flex flex-col">
      <div className="relative h-[40vh] md:h-[50vh] rounded-t-lg overflow-hidden">
        {(getLoading && (
          <div className="absolute inset-0 flex items-center justify-center bg-secondary animate-pulse"></div>
        )) || (
          <Image
            src={getResponse?.videoDetails.thumbnails[0].url}
            alt=""
            className="w-full h-full object-cover rounded-xl rounded-t-lg filter blur-sm"
          />
        )}

        <div className="absolute inset-0 rounded-t-lg bg-gradient-to-t from-background via-background/40 to-transparent" />

        {/* Overlay Content */}
        <div className="absolute bottom-0 left-0 right-0 p-6 space-y-4">
          <div className="max-w-6xl mx-auto">
            <h1 className="text-2xl line-clamp-2 md:text-4xl font-bold text-foreground drop-shadow-lg">
              {!getLoading && getResponse?.videoDetails.title}
            </h1>
            <div className="flex flex-wrap items-center gap-4 mt-4">
              <div
                className="flex items-center gap-3 shadow-md
              bg-secondary/30 backdrop-blur-sm px-4 py-2 rounded-full"
              >
                {(getLoading && (
                  <div className="w-10 h-10 bg-primary rounded-full animate-pulse" />
                )) || (
                  <Image
                    src={getResponse?.videoDetails.author.thumbnails[0].url}
                    alt={getResponse?.videoDetails.author.name}
                    className="w-10 h-10 rounded-full ring-2 ring-primary/20"
                  />
                )}

                <div>
                  <a
                    href={getResponse?.videoDetails.author.user_url}
                    className="font-semibold text-foreground hover:text-primary transition-colors"
                  >
                    {getResponse?.videoDetails.author.name}
                  </a>
                  <p className="text-sm text-foreground/80">
                    {getResponse?.videoDetails.author.subscriber_count.toLocaleString() ||
                      0}{" "}
                    subscribers
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-2 bg-secondary/30 backdrop-blur-sm px-4 py-2 rounded-full text-foreground shadow-md">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  width="20"
                  height="20"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <circle cx="12" cy="12" r="10" />
                  <polyline points="12 6 12 12 16 14" />
                </svg>
                {formatTimeToMinSec(
                  getResponse?.videoDetails.lengthSeconds || 0
                )}{" "}
                min
              </div>
              {getLoading && (
                <div className="animate-pulse">
                  <span>{getLoading && "loading..."}</span>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="w-full px-4 py-8 space-y-6">
        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="bg-secondary/10 rounded-xl p-4 flex items-center gap-3">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="24"
              height="24"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
              className="text-primary"
            >
              <path d="M2 12s3-7 10-7 10 7 10 7-3 7-10 7-10-7-10-7Z" />
              <circle cx="12" cy="12" r="3" />
            </svg>
            <div>
              <div className="text-xl font-semibold">
                {Number(
                  getResponse?.videoDetails.viewCount || 0
                ).toLocaleString()}
              </div>
              <div className="text-sm text-muted-foreground">Views</div>
            </div>
          </div>

          <div className="bg-secondary/10 rounded-xl p-4 flex items-center gap-3">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="24"
              height="24"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
              className="text-red-500"
            >
              <path d="M19 14c1.49-1.46 3-3.21 3-5.5A5.5 5.5 0 0 0 16.5 3c-1.76 0-3 .5-4.5 2-1.5-1.5-2.74-2-4.5-2A5.5 5.5 0 0 0 2 8.5c0 2.3 1.5 4.05 3 5.5l7 7Z" />
            </svg>
            <div>
              <div className="text-xl font-semibold">
                {Number(
                  getResponse?.videoDetails.likeCount || 0
                ).toLocaleString()}
              </div>
              <div className="text-sm text-muted-foreground">Likes</div>
            </div>
          </div>

          <div className="bg-secondary/10 rounded-xl p-4 flex items-center gap-3">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="24"
              height="24"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
              className="text-purple-500"
            >
              <path d="M12 3v20" />
              <path d="M3 16c0 1 1 3 4 3 2 0 3-1 3-2 0-2-3-3-3-4 0-.5.5-1 2-1 1 0 2 .5 2 1" />
              <path d="M15 12c0 1 1 3 4 3 2 0 3-1 3-2 0-2-3-3-3-4 0-.5.5-1 2-1 1 0 2 .5 2 1" />
            </svg>
            <div>
              <div className="text-xl font-semibold">
                {getResponse?.videoDetails.category || "loading..."}
              </div>
              <div className="text-sm text-muted-foreground">Category</div>
            </div>
          </div>
        </div>

        {/* Tags */}

        {/* Description */}
        <div
          className={`bg-secondary/10 rounded-xl w-full overflow-hidden 
          ${getLoading ? "animate-pulse" : ""}`}
        >
          <button
            onClick={() => setShowDescription(!showDescription)}
            className="w-full p-4 text-left font-medium flex items-center justify-between hover:bg-secondary/20 transition-colors"
          >
            <span>Description</span>
            <span className="text-primary">{showDescription ? "▼" : "▲"}</span>
          </button>
          {showDescription && (
            <div className="p-4 whitespace-pre-wrap text-sm leading-relaxed border-t border-secondary/20 overflow-y-auto">
              {getResponse?.videoDetails.description}
              <div className="flex flex-wrap gap-2 mt-4">
                {getResponse?.videoDetails?.keywords.map((keyword, index) => (
                  <span
                    key={index}
                    className="px-3 py-1.5 text-sm rounded-full bg-primary/5 text-primary border border-primary/10 hover:bg-primary/10 transition-colors"
                  >
                    #{keyword}
                  </span>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Footer Stats */}
        <div
          className={`bg-secondary/10 rounded-xl p-4 space-y-3 w-full
          ${getLoading ? "animate-pulse" : ""}`}
        >
          <div className="flex items-center gap-2">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="16"
              height="16"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <rect x="3" y="4" width="18" height="18" rx="2" ry="2" />
              <line x1="16" y1="2" x2="16" y2="6" />
              <line x1="8" y1="2" x2="8" y2="6" />
              <line x1="3" y1="10" x2="21" y2="10" />
            </svg>
            Published on{" "}
            {new Date(getResponse?.videoDetails.uploadDate).toLocaleDateString(
              "en-US",
              {
                year: "numeric",
                month: "long",
                day: "numeric",
              }
            )}
          </div>
          <div className="flex items-center gap-2">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="16"
              height="16"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <circle cx="12" cy="12" r="10" />
              <line x1="2" y1="12" x2="22" y2="12" />
              <path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z" />
            </svg>
            Available in {getResponse?.videoDetails.availableCountries.length}{" "}
            countries
          </div>
        </div>
      </div>

      <MediaSection
        isLoading={getLoading}
        isError={getError}
        label={`Related Videos`}
        data={related_videos}
      />
    </section>
  );
}
