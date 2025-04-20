import { Peachy, useGlobalState } from "@peach/component";
import { AppState } from "@peach/state";
import { useMemo } from "@utils/useMemo";
import { waitFor } from "@peach/utils";
import { getStreamUrl } from "@utils/api";
import Link from "@components/Link";
import {
  addFavorite,
  removeFavorite,
  getFavorite,
  saveDownload,
  getDownload,
} from "@utils/useDB";
import Image from "@components/Image";

function readBlob(b) {
  return new Promise(function (resolve, reject) {
    const reader = new FileReader();
    reader.onloadend = function () {
      resolve(reader.result);
    };
    reader.readAsDataURL(b);
  });
}

// SVG Icons (Using Fontawesome Icons for reliability)
const PlayIcon = () => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    viewBox="0 0 384 512"
    className="w-6 h-6"
    fill="currentColor"
  >
    <path d="M73 39c-14.8-9.1-33.4-9.4-48.5-.9S0 62.6 0 80L0 432c0 17.4 9.4 33.4 24.5 41.9s33.7 8.1 48.5-.9L361 297c14.3-8.7 23-24.2 23-41s-8.7-32.2-23-41L73 39z" />
  </svg>
);

const PauseIcon = () => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    viewBox="0 0 384 512"
    className="w-6 h-6"
    fill="currentColor"
  >
    <path d="M0 128C0 92.7 28.7 64 64 64H320c35.3 0 64 28.7 64 64V384c0 35.3-28.7 64-64 64H64c-35.3 0-64-28.7-64-64V128z" />
  </svg>
);

const PreviousIcon = () => (
  <svg
    className="w-6 h-6 rotate-180"
    fill="currentColor"
    xmlns="http://www.w3.org/2000/svg"
    viewBox="0 0 512 512"
  >
    <path d="M18.4 445c11.2 5.3 24.5 3.6 34.1-4.4L224 297.7 224 416c0 12.4 7.2 23.7 18.4 29s24.5 3.6 34.1-4.4L448 297.7 448 416c0 17.7 14.3 32 32 32s32-14.3 32-32l0-320c0-17.7-14.3-32-32-32s-32 14.3-32 32l0 118.3L276.5 71.4c-9.5-7.9-22.8-9.7-34.1-4.4S224 83.6 224 96l0 118.3L52.5 71.4c-9.5-7.9-22.8-9.7-34.1-4.4S0 83.6 0 96L0 416c0 12.4 7.2 23.7 18.4 29z" />
  </svg>
);

const NextIcon = () => (
  <svg
    className="w-6 h-6"
    fill="currentColor"
    xmlns="http://www.w3.org/2000/svg"
    viewBox="0 0 512 512"
  >
    <path d="M18.4 445c11.2 5.3 24.5 3.6 34.1-4.4L224 297.7 224 416c0 12.4 7.2 23.7 18.4 29s24.5 3.6 34.1-4.4L448 297.7 448 416c0 17.7 14.3 32 32 32s32-14.3 32-32l0-320c0-17.7-14.3-32-32-32s-32 14.3-32 32l0 118.3L276.5 71.4c-9.5-7.9-22.8-9.7-34.1-4.4S224 83.6 224 96l0 118.3L52.5 71.4c-9.5-7.9-22.8-9.7-34.1-4.4S0 83.6 0 96L0 416c0 12.4 7.2 23.7 18.4 29z" />
  </svg>
);

const Backward5Icon = () => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    viewBox="0 0 512 512"
    className="w-6 h-6 rotate-180"
    fill="currentColor"
  >
    <path d="M52.5 440.6c-9.5 7.9-22.8 9.7-34.1 4.4S0 428.4 0 416L0 96C0 83.6 7.2 72.3 18.4 67s24.5-3.6 34.1 4.4L224 214.3l0 41.7 0 41.7L52.5 440.6zM256 352l0-96 0-128 0-32c0-12.4 7.2-23.7 18.4-29s24.5-3.6 34.1 4.4l192 160c7.3 6.1 11.5 15.1 11.5 24.6s-4.2 18.5-11.5 24.6l-192 160c-9.5 7.9-22.8 9.7-34.1 4.4s-18.4-16.6-18.4-29l0-64z" />
  </svg>
);

const Forward5Icon = () => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    viewBox="0 0 512 512"
    className="w-6 h-6"
    fill="currentColor"
  >
    <path d="M52.5 440.6c-9.5 7.9-22.8 9.7-34.1 4.4S0 428.4 0 416L0 96C0 83.6 7.2 72.3 18.4 67s24.5-3.6 34.1 4.4L224 214.3l0 41.7 0 41.7L52.5 440.6zM256 352l0-96 0-128 0-32c0-12.4 7.2-23.7 18.4-29s24.5-3.6 34.1 4.4l192 160c7.3 6.1 11.5 15.1 11.5 24.6s-4.2 18.5-11.5 24.6l-192 160c-9.5 7.9-22.8 9.7-34.1 4.4s-18.4-16.6-18.4-29l0-64z" />
  </svg>
);

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

const ChevronUpIcon = () => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    className="w-6 h-6"
    fill="none"
    viewBox="0 0 24 24"
    stroke="currentColor"
  >
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth={2}
      d="M5 15l7-7 7 7"
    />
  </svg>
);

const ChevronDownIcon = () => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    className="w-6 h-6"
    fill="none"
    viewBox="0 0 24 24"
    stroke="currentColor"
  >
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth={2}
      d="M19 9l-7 7-7-7"
    />
  </svg>
);

const VolumeIcon = () => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    className="w-6 h-6"
    fill="none"
    viewBox="0 0 24 24"
    stroke="currentColor"
  >
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth={2}
      d="M15.536 8.464a5 5 0 010 7.072m2.828-9.9a9 9 0 010 12.728M5.586 15H4a1 1 0 01-1-1v-4a1 1 0 011-1h1.586l4.707-4.707A1 1 0 0112 5v14a1 1 0 01-1.707.707L5.586 15z"
    />
  </svg>
);

const RepeatIcon = () => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    viewBox="0 0 512 512"
    className="w-4 h-4"
    fill="currentColor"
  >
    <path d="M0 224c0 17.7 14.3 32 32 32s32-14.3 32-32c0-53 43-96 96-96l160 0 0 32c0 12.9 7.8 24.6 19.8 29.6s25.7 2.2 34.9-6.9l64-64c12.5-12.5 12.5-32.8 0-45.3l-64-64c-9.2-9.2-22.9-11.9-34.9-6.9S320 19.1 320 32l0 32L160 64C71.6 64 0 135.6 0 224zm512 64c0-17.7-14.3-32-32-32s-32 14.3-32 32c0 53-43 96-96 96l-160 0 0-32c0-12.9-7.8-24.6-19.8-29.6s-25.7-2.2-34.9 6.9l-64 64c-12.5 12.5-12.5 32.8 0 45.3l64 64c9.2 9.2 22.9 11.9 34.9 6.9s19.8-16.6 19.8-29.6l0-32 160 0c88.4 0 160-71.6 160-160z" />
  </svg>
);

const ArrowCircleIcon = () => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    viewBox="0 0 512 512"
    className="w-4 h-4"
    fill="currentColor"
  >
    <path d="M386.3 160L336 160c-17.7 0-32 14.3-32 32s14.3 32 32 32l128 0c17.7 0 32-14.3 32-32l0-128c0-17.7-14.3-32-32-32s-32 14.3-32 32l0 51.2L414.4 97.6c-87.5-87.5-229.3-87.5-316.8 0s-87.5 229.3 0 316.8s229.3 87.5 316.8 0c12.5-12.5 12.5-32.8 0-45.3s-32.8-12.5-45.3 0c-62.5 62.5-163.8 62.5-226.3 0s-62.5-163.8 0-226.3s163.8-62.5 226.3 0L386.3 160z" />
  </svg>
);

const DownlaodIcon = () => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    viewBox="0 0 512 512"
    className="w-4 h-4"
    fill="currentColor"
  >
    <path d="M288 32c0-17.7-14.3-32-32-32s-32 14.3-32 32l0 242.7-73.4-73.4c-12.5-12.5-32.8-12.5-45.3 0s-12.5 32.8 0 45.3l128 128c12.5 12.5 32.8 12.5 45.3 0l128-128c12.5-12.5 12.5-32.8 0-45.3s-32.8-12.5-45.3 0L288 274.7 288 32zM64 352c-35.3 0-64 28.7-64 64l0 32c0 35.3 28.7 64 64 64l384 0c35.3 0 64-28.7 64-64l0-32c0-35.3-28.7-64-64-64l-101.5 0-45.3 45.3c-25 25-65.5 25-90.5 0L165.5 352 64 352zm368 56a24 24 0 1 1 0 48 24 24 0 1 1 0-48z" />
  </svg>
);

// Main Player component
export default function Player() {
  const [current_media] = useGlobalState(AppState, "player");
  const memoizedOutput = useMemo(
    "PlayerComponent",
    [current_media ? current_media.id : null],
    () => {
      return (
        <div>
          {current_media && current_media.id && current_media.id.length > 0 && (
            <div className="w-full py-2 bg-background text-foreground absolute bottom-0 border-t border-border left-0 z-[99] glass">
              <VideoPlayer
                mediaId={current_media.id}
                uploadDate={
                  current_media.uploadDate || new Date().toISOString()
                }
                approxDurationMs={current_media.duration}
                thumbnail={current_media.thumbnail}
                title={current_media.title}
              />
            </div>
          )}
        </div>
      );
    }
  );

  return memoizedOutput;
}

const VideoPlayer = ({
  mediaId,
  approxDurationMs,
  thumbnail,
  title,
  uploadDate,
}) => {
  const safeMediaId = mediaId.replace(/[^a-zA-Z0-9-_]/g, "_");

  const formatTime = (seconds) => {
    const min = Math.floor(seconds / 60);
    const sec = Math.floor(seconds % 60);
    return `${min}:${sec < 10 ? "0" : ""}${sec}`;
  };

  const initializeVideo = useMemo(
    "VideoPlayerInit",
    [safeMediaId, approxDurationMs],
    () => {
      const setup = async () => {
        try {
          const videoElement = await waitFor(`#player-video-${safeMediaId}`);
          const playPauseBtn = await waitFor(`#play-pause-${safeMediaId}`);
          const seekBar = await waitFor(`#seek-bar-${safeMediaId}`);
          const timeDisplay = await waitFor(`#time-display-${safeMediaId}`);
          const volumeSlider = await waitFor(`#volume-slider-${safeMediaId}`);
          const volumeBtn = await waitFor(`#volume-btn-${safeMediaId}`);
          const collapseBtn = await waitFor(`#collapse-btn-${safeMediaId}`);
          const videoWrapper = await waitFor(`#video-wrapper-${safeMediaId}`);
          const backward5Btn = await waitFor(`#backward-5-${safeMediaId}`);
          const forward5Btn = await waitFor(`#forward-5-${safeMediaId}`);
          const previousBtn = await waitFor(`#previous-${safeMediaId}`);
          const nextBtn = await waitFor(`#next-${safeMediaId}`);
          const favoriteBtn = await waitFor(`#favorite-btn-${safeMediaId}`);
          const repeatPlaylistBtn = await waitFor(
            `#repeat-playlist-btn-${safeMediaId}`
          );
          const repeatSongBtn = await waitFor(
            `#repeat-song-btn-${safeMediaId}`
          );
          const downloadSongBtn = await waitFor(
            `#download-song-btn-${safeMediaId}`
          );

          // Load collapsed state from localStorage
          const _localCollapsed = localStorage.getItem("videoPlayerCollapsed");
          let isCollapsed =
            _localCollapsed !== undefined &&
            typeof _localCollapsed === "string" &&
            _localCollapsed?.length > 0
              ? Boolean(_localCollapsed)
              : true;
          videoWrapper.style.display = isCollapsed ? "none" : "block";
          collapseBtn.innerHTML = "";
          collapseBtn.appendChild(
            isCollapsed ? ChevronDownIcon() : ChevronUpIcon()
          );

          let duration = approxDurationMs
            ? Math.round(approxDurationMs / 1000)
            : 300;
          let currentTime = 0;
          let isPlaying = false;
          let isVolumeSliderVisible = false;

          let isRepeatPlaylist =
            localStorage.getItem("repeatPlaylist") === "true";
          let isRepeatSong = localStorage.getItem("repeatSong") === "true";
          // Check initial favorite
          let isFavorite = !!(await getFavorite(mediaId));

          // Update button appearances based on state
          favoriteBtn.classList.toggle("text-primary", isFavorite);
          repeatPlaylistBtn.classList.toggle("text-primary", isRepeatPlaylist);
          repeatSongBtn.classList.toggle("text-primary", isRepeatSong);

          // Check if the song is downloaded
          const isDownloaded = await getDownload(mediaId);
          downloadSongBtn.classList.toggle(
            "text-primary",
            isDownloaded?.id === mediaId
          );

          let streamUrl;
          if (isDownloaded && isDownloaded.binary.blob instanceof Blob) {
            try {
              streamUrl = URL.createObjectURL(isDownloaded.binary.blob);
              downloadSongBtn.disabled = true;
            } catch (error) {
              console.error("Failed to create object URL:", error);
              streamUrl = getStreamUrl(mediaId); // Fallback to streaming URL
            }
          } else {
            console.warn(
              "No valid Blob found for downloaded media, falling back to stream URL"
            );
            streamUrl = getStreamUrl(mediaId);
          }
          if (!streamUrl) {
            throw new Error("Invalid stream URL");
          }

          // Set video source
          videoElement.src = streamUrl;
          videoElement.preload = "auto";

          videoElement.addEventListener("loadedmetadata", () => {
            duration = Math.round(videoElement.duration) || duration;
            seekBar.max = duration;
            timeDisplay.textContent = `0:00 / ${formatTime(duration)}`;
            console.log("Loaded metadata, duration:", duration);
            videoElement.play();
          });

          videoElement.addEventListener("play", () => {
            isPlaying = true;
            playPauseBtn.innerHTML = "";
            playPauseBtn.appendChild(PauseIcon());
          });

          videoElement.addEventListener("pause", () => {
            isPlaying = false;
            playPauseBtn.innerHTML = "";
            playPauseBtn.appendChild(PlayIcon());
          });

          videoElement.addEventListener("error", (e) => {
            console.error("Video error:", videoElement.error);
            timeDisplay.textContent = "Error loading video";
            playPauseBtn.innerHTML = "";
            playPauseBtn.appendChild(PlayIcon());
          });

          // Handle video end for repeat functionality
          videoElement.addEventListener("ended", async () => {
            if (isRepeatSong) {
              setTimeout(() => {
                videoElement.currentTime = 0;
                videoElement.play();
              }, 100);
            } else if (isRepeatPlaylist) {
              const queue = await AppState.get("queue");
              const currentMedia = await AppState.get("player");
              const currentIndex = queue.findIndex(
                (item) => item.id === currentMedia.id
              );
              const nextIndex =
                currentIndex < queue.length - 1 ? currentIndex + 1 : 0;
              const nextMedia = queue[nextIndex];
              await AppState.set("player", nextMedia);
            } else {
              isPlaying = false;
              playPauseBtn.innerHTML = "";
              playPauseBtn.appendChild(PlayIcon());
              currentTime = duration;
            }
          });

          // Update seek bar and buffer visualization
          setInterval(() => {
            if (isPlaying) {
              currentTime = videoElement.currentTime;
              if (currentTime >= duration) {
                if (!isRepeatSong || !isRepeatPlaylist) {
                  videoElement.pause();
                  isPlaying = false;
                  playPauseBtn.innerHTML = "";
                  playPauseBtn.appendChild(PlayIcon());
                  currentTime = duration;
                }
              }
              seekBar.value = currentTime;
              timeDisplay.textContent = `${formatTime(
                currentTime
              )} / ${formatTime(duration)}`;

              // Update buffer visualization
              const bufferedRanges = videoElement.buffered;
              let bufferedPercentage = 0;
              if (bufferedRanges.length > 0) {
                const bufferedEnd = bufferedRanges.end(
                  bufferedRanges.length - 1
                );
                bufferedPercentage = (bufferedEnd / duration) * 100;
              }
              const playedPercentage = (currentTime / duration) * 100;
              seekBar.style.background = `
              linear-gradient(
                to right,
                hsl(var(--foreground)) 0%,
                hsl(var(--foreground)) ${playedPercentage}%,
                hsl(var(--primary)) ${playedPercentage}%,
                hsl(var(--primary)) ${bufferedPercentage}%,
                hsl(var(--secondary)) ${bufferedPercentage}%,
                hsl(var(--secondary)) 100%
              )
            `;
            }
          }, 500); // Increased frequency for smoother updates

          // Initialize UI
          playPauseBtn.innerHTML = "";
          playPauseBtn.appendChild(PlayIcon());
          timeDisplay.textContent = `0:00 / ${formatTime(duration)}`;
          seekBar.value = 0;
          seekBar.max = duration;
          volumeSlider.value = 1;
          videoElement.volume = 1;

          collapseBtn.addEventListener("click", () => {
            isCollapsed = !isCollapsed;
            videoWrapper.style.display = isCollapsed ? "none" : "block";
            collapseBtn.innerHTML = "";
            collapseBtn.appendChild(
              isCollapsed ? ChevronDownIcon() : ChevronUpIcon()
            );
            // Save collapsed state to localStorage
            localStorage.setItem("videoPlayerCollapsed", isCollapsed);
          });

          volumeBtn.addEventListener("click", () => {
            isVolumeSliderVisible = !isVolumeSliderVisible;
            volumeSlider.style.display = isVolumeSliderVisible
              ? "block"
              : "none";
          });

          backward5Btn.addEventListener("click", () => {
            const newTime = Math.max(0, videoElement.currentTime - 5);
            videoElement.currentTime = newTime;
            currentTime = newTime;
            timeDisplay.textContent = `${formatTime(
              currentTime
            )} / ${formatTime(duration)}`;
            seekBar.value = currentTime;
          });

          forward5Btn.addEventListener("click", () => {
            const newTime = Math.min(duration, videoElement.currentTime + 5);
            videoElement.currentTime = newTime;
            currentTime = newTime;
            timeDisplay.textContent = `${formatTime(
              currentTime
            )} / ${formatTime(duration)}`;
            seekBar.value = currentTime;
          });

          previousBtn.addEventListener("click", async () => {
            try {
              const queue = await AppState.get("queue");
              const currentMedia = await AppState.get("player");
              const currentIndex = queue.findIndex(
                (item) => item.id === currentMedia.id
              );
              if (currentIndex > 0) {
                const prevMedia = queue[currentIndex - 1];
                await AppState.set("player", prevMedia);
              }
            } catch (error) {
              console.error("Previous track error:", error);
            }
          });

          nextBtn.addEventListener("click", async () => {
            try {
              const queue = await AppState.get("queue");
              const currentMedia = await AppState.get("player");
              const currentIndex = queue.findIndex(
                (item) => item.id === currentMedia.id
              );
              if (currentIndex < queue.length - 1) {
                const nextMedia = queue[currentIndex + 1];
                await AppState.set("player", nextMedia);
              }
            } catch (error) {
              console.error("Next track error:", error);
            }
          });
          favoriteBtn.addEventListener("click", async () => {
            try {
              if (isFavorite) {
                await removeFavorite(mediaId);
                isFavorite = false;
                favoriteBtn.classList.remove("text-primary");
              } else {
                await addFavorite({
                  id: mediaId,
                  title,
                  thumbnail,
                  uploadDate: new Date().toISOString(),
                  duration: duration,
                });
                isFavorite = true;
                favoriteBtn.classList.add("text-primary");
              }
            } catch (error) {
              console.error("Favorite toggle error:", error);
            }
          });

          repeatPlaylistBtn.addEventListener("click", () => {
            isRepeatPlaylist = !isRepeatPlaylist;
            if (isRepeatPlaylist && isRepeatSong) {
              isRepeatSong = false;
              localStorage.setItem("repeatSong", "false");
              repeatSongBtn.classList.remove("text-primary");
            }
            localStorage.setItem("repeatPlaylist", isRepeatPlaylist);
            repeatPlaylistBtn.classList.toggle(
              "text-primary",
              isRepeatPlaylist
            );
          });

          repeatSongBtn.addEventListener("click", () => {
            isRepeatSong = !isRepeatSong;
            if (isRepeatSong && isRepeatPlaylist) {
              isRepeatPlaylist = false;
              localStorage.setItem("repeatPlaylist", "false");
              repeatPlaylistBtn.classList.remove("text-primary");
            }
            localStorage.setItem("repeatSong", isRepeatSong);
            repeatSongBtn.classList.toggle("text-primary", isRepeatSong);
          });

          downloadSongBtn.addEventListener("click", async (e) => {
            try {
              e.target.classList.add("animate-pulse");
              e.target.disabled = true;
              const [response_blob, response_thumbnail] = await Promise.all([
                fetch(streamUrl),
                fetch(thumbnail),
              ]);
              const blob = await response_blob.blob();
              const thumbnail_blob = await readBlob(
                await response_thumbnail.blob()
              );
              await saveDownload(mediaId, {
                blob,
                videoDetails: {
                  id: mediaId,
                  duration: approxDurationMs,
                  thumbnail: thumbnail_blob,
                  title,
                  uploadDate,
                },
              });
              e.target.classList.remove("animate-pulse");
              downloadSongBtn.classList.add("text-primary");
            } catch (error) {
              console.error("Download error:", error);
            }
          });
        } catch (error) {
          console.error("Video initialization failed:", error);
        }
      };

      if (safeMediaId) {
        setup();
      }
    }
  );

  const handleSeek = async (targetTime) => {
    try {
      const videoElement = await waitFor(`#player-video-${safeMediaId}`);
      const playPauseBtn = await waitFor(`#play-pause-${safeMediaId}`);
      const timeDisplay = await waitFor(`#time-display-${safeMediaId}`);
      const seekBar = await waitFor(`#seek-bar-${safeMediaId}`);
      const duration = parseInt(seekBar.max);

      const wasPlaying = !videoElement.paused;
      videoElement.currentTime = targetTime;

      // Update UI immediately
      timeDisplay.textContent = `${formatTime(targetTime)} / ${formatTime(
        duration
      )}`;
      seekBar.value = targetTime;

      if (wasPlaying) {
        videoElement.play().catch((error) => {
          console.error("Play after seek failed:", error);
          playPauseBtn.innerHTML = "";
          playPauseBtn.appendChild(PlayIcon());
        });
      }
    } catch (error) {
      console.error("Seek error:", error);
    }
  };

  return (
    <div className="flex flex-col items-center">
      {/* Video Player */}
      <div
        id={`video-wrapper-${safeMediaId}`}
        className="w-full container mx-auto"
        style="display:none;"
      >
        <video
          id={`player-video-${safeMediaId}`}
          className="w-full h-[360px] aspect-video bg-background rounded-lg object-cover"
          preload="auto"
        ></video>
      </div>

      <div className="flex flex-col items-center justify-between w-full relative">
        {/* Volume and Collapse Buttons (Bottom Right) */}
        <div className="flex items-center justify-between space-x-2 w-full">
          <div className="flex items-center space-x-2 px-2">
            <button
              id={`favorite-btn-${safeMediaId}`}
              title="Add to Favorites"
              className="p-1 hover:text-primary text-muted-foreground transition-colors"
            >
              <HeartAddIcon />
            </button>

            <button
              id={`repeat-playlist-btn-${safeMediaId}`}
              title="Repeat Playlist"
              className="p-1 hover:text-primary text-muted-foreground transition-colors"
            >
              <RepeatIcon />
            </button>
            <button
              id={`repeat-song-btn-${safeMediaId}`}
              title="Repeat Song"
              className="p-1 hover:text-primary text-muted-foreground transition-colors"
            >
              <ArrowCircleIcon />
            </button>
            <Link
              href={`/media/${mediaId}`}
              onClick={() => {
                if (
                  window.location.pathname.split("/media")?.length === 2 &&
                  window.location.pathname.replace("/media/", "") === mediaId
                )
                  return { abort: true };
              }}
              className="hover:text-primary text-muted-foreground transition-colors"
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                viewBox="0 0 512 512"
                className="w-4 h-4"
                fill="currentColor"
              >
                <path d="M256 512A256 256 0 1 0 256 0a256 256 0 1 0 0 512zM216 336l24 0 0-64-24 0c-13.3 0-24-10.7-24-24s10.7-24 24-24l48 0c13.3 0 24 10.7 24 24l0 88 8 0c13.3 0 24 10.7 24 24s-10.7 24-24 24l-80 0c-13.3 0-24-10.7-24-24s10.7-24 24-24zm40-208a32 32 0 1 1 0 64 32 32 0 1 1 0-64z" />
              </svg>
            </Link>
            <button
              id={`download-song-btn-${safeMediaId}`}
              title="Download"
              className="p-1 hover:text-primary text-muted-foreground transition-colors"
            >
              <DownlaodIcon />
            </button>
          </div>
          <div className="flex items-center space-x-2 px-2">
            <button
              title="Volume"
              id={`volume-btn-${safeMediaId}`}
              className="p-2 hover:bg-secondary rounded-full transition-colors hidden lg:block"
            >
              <VolumeIcon />
            </button>
            <input
              id={`volume-slider-${safeMediaId}`}
              type="range"
              min="0"
              max="1"
              step="0.01"
              defaultValue="1"
              onChange={async (e) => {
                try {
                  const videoElement = await waitFor(
                    `#player-video-${safeMediaId}`
                  );
                  videoElement.volume = parseFloat(e.target.value);
                } catch (error) {
                  console.error("Volume error:", error);
                }
              }}
              className="w-24 h-1 bg-secondary rounded-lg appearance-none cursor-pointer hidden"
            />
            <button
              title="Toggle Video"
              id={`collapse-btn-${safeMediaId}`}
              className="p-2 hover:bg-secondary rounded-full transition-colors"
            >
              <ChevronUpIcon />
            </button>
          </div>
        </div>

        {/* Playback Controls (Centered) */}
        <div className="flex items-center justify-center space-x-6 text-muted-foreground">
          <button
            id={`previous-${safeMediaId}`}
            className="p-2 hover:bg-primary hover:text-foreground rounded-full transition-colors"
          >
            <PreviousIcon />
          </button>
          <button
            id={`backward-5-${safeMediaId}`}
            className="p-2 hover:bg-primary hover:text-foreground rounded-full transition-colors"
          >
            <Backward5Icon />
          </button>
          <button
            id={`play-pause-${safeMediaId}`}
            className="p-3 bg-secondary text-muted-foreground rounded-full hover:text-foreground hover:bg-primary transition-colors"
            onClick={async () => {
              try {
                const videoElement = await waitFor(
                  `#player-video-${safeMediaId}`
                );
                const playPauseBtn = await waitFor(
                  `#play-pause-${safeMediaId}`
                );
                if (!videoElement.paused) {
                  videoElement.pause();
                } else {
                  videoElement.play().catch((error) => {
                    console.error("Play failed:", error);
                    playPauseBtn.innerHTML = "";
                    playPauseBtn.appendChild(PlayIcon());
                  });
                }
              } catch (error) {
                console.error("Play/pause error:", error);
              }
            }}
          >
            <PlayIcon />
          </button>
          <button
            id={`forward-5-${safeMediaId}`}
            className="p-2 hover:bg-primary hover:text-foreground rounded-full transition-colors"
          >
            <Forward5Icon />
          </button>
          <button
            id={`next-${safeMediaId}`}
            className="p-2 hover:bg-primary hover:text-foreground rounded-full transition-colors"
          >
            <NextIcon />
          </button>
        </div>

        {/* Full-Width Seek Bar and Time Display */}
        <div className="w-full px-4">
          <input
            id={`seek-bar-${safeMediaId}`}
            type="range"
            min="0"
            max={approxDurationMs ? Math.round(approxDurationMs / 1000) : 300}
            defaultValue="0"
            onChange={async (e) => {
              const newTime = parseFloat(e.target.value);
              await handleSeek(newTime);
            }}
            className="w-full h-1 bg-secondary rounded-lg appearance-none cursor-pointer"
            style={{
              background:
                "linear-gradient(to right, hsl(var(--foreground)) 0%, hsl(var(--primary)) 0%, hsl(var(--secondary)) 0%)",
            }}
          />
          <div
            id={`time-display-${safeMediaId}`}
            className="text-sm mt-1 text-center"
          >
            0:00 /{" "}
            {formatTime(
              approxDurationMs ? Math.round(approxDurationMs / 1000) : 300
            )}
          </div>
        </div>

        <div className="px-4 flex items-center justify-between w-full">
          {/* Video Details (Thumbnail, Title) */}
          <div className="flex items-center space-x-4">
            {thumbnail && (
              <Image
                src={thumbnail}
                alt="Video Thumbnail"
                className="w-12 h-12 object-cover rounded-lg"
              />
            )}
            <div className="flex flex-col items-center">
              <span className="max-w-xs md:max-w-sm xl:max-w-full text-base font-bold font-mono tracking-widest uppercase truncate text-ellipsis overflow-hidden">
                {title || "Unknown Title"}
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
