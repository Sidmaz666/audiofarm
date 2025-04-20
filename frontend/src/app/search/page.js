import { Peachy } from "@peach/component";
import MediaSection from "@components/MediaCard";

export default function SearchPage() {
  const query = new URLSearchParams(window.location.search).get("q");

  if (
    (!query || query.length <= 0) &&
    window.location.pathname?.includes("/search")
  ) {
    setTimeout(document.querySelector("input[type=search]").focus(), 100);
  }

  return (
    <section className="flex-1 container mx-auto px-4 pb-20 relative z-10 py-20 pt-6 flex flex-col">
      {!query || query?.length <= 0 ? (
        <div className="flex flex-col items-center justify-center  h-[calc(100dvh-20rem)]">
          <svg
            xmlns="http://www.w3.org/2000/svg"
            className="w-20 h-20 fill-secondary animate-pulse"
            viewBox="0 0 512 512"
          >
            <path d="M416 208c0 45.9-14.9 88.3-40 122.7L502.6 457.4c12.5 12.5 12.5 32.8 0 45.3s-32.8 12.5-45.3 0L330.7 376c-34.4 25.2-76.8 40-122.7 40C93.1 416 0 322.9 0 208S93.1 0 208 0S416 93.1 416 208zM208 352a144 144 0 1 0 0-288 144 144 0 1 0 0 288z" />
          </svg>
          <span className="mt-8 text-3xl font-bold font-mono text-secondary animate-pulse text-center max-w-md">
            Start Exploring, Search for something.
          </span>
        </div>
      ) : (
        <MediaSection
          label={`results for "${query}"`}
          query={query}
          page={1}
          limit={20}
        />
      )}
    </section>
  );
}
