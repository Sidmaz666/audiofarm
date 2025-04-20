import { Peachy, useState } from "@peach/component";
import MediaSection from "@components/MediaCard";
import { PersistedAppState } from "@peach/state";
import Link from "@components/Link";
import { DEFAULT_FEEDS } from "@utils/constants";

const categories = [
  {
    label: "Pop",
    lightBg: "bg-gradient-to-tr from-pink-400 to-fuchsia-500",
    darkBg: "dark:bg-gradient-to-tr dark:from-pink-600 dark:to-fuchsia-700",
    query: "latest pop hits official music videos",
  },
  {
    label: "Rock",
    lightBg: "bg-gradient-to-tr from-red-600 to-orange-500",
    darkBg: "dark:bg-gradient-to-tr dark:from-red-700 dark:to-orange-600",
    query: "classic rock hits playlist",
  },
  {
    label: "Hip Hop",
    lightBg: "bg-gradient-to-tr from-yellow-400 to-amber-500",
    darkBg: "dark:bg-gradient-to-tr dark:from-yellow-600 dark:to-amber-600",
    query: "trending hip hop rap songs 2024",
  },
  {
    label: "Electronic",
    lightBg: "bg-gradient-to-tr from-cyan-300 to-blue-500",
    darkBg: "dark:bg-gradient-to-tr dark:from-cyan-500 dark:to-blue-700",
    query: "electronic dance music edm mix 2024",
  },
  {
    label: "Classical",
    lightBg: "bg-gradient-to-tr from-amber-200 to-yellow-300",
    darkBg: "dark:bg-gradient-to-tr dark:from-amber-500 dark:to-yellow-500",
    query: "relaxing classical music full symphony orchestra",
  },
  {
    label: "Jazz",
    lightBg: "bg-gradient-to-tr from-indigo-500 to-purple-600",
    darkBg: "dark:bg-gradient-to-tr dark:from-indigo-700 dark:to-purple-700",
    query: "smooth jazz instrumental chill playlist",
  },
  {
    label: "R&B",
    lightBg: "bg-gradient-to-tr from-rose-500 to-pink-500",
    darkBg: "dark:bg-gradient-to-tr dark:from-rose-700 dark:to-pink-700",
    query: "best r&b soul music playlist 2024",
  },
  {
    label: "Country",
    lightBg: "bg-gradient-to-tr from-lime-400 to-green-500",
    darkBg: "dark:bg-gradient-to-tr dark:from-lime-600 dark:to-green-600",
    query: "top country music hits 2024 playlist",
  },
  {
    label: "Reggae",
    lightBg: "bg-gradient-to-tr from-green-500 to-yellow-400",
    darkBg: "dark:bg-gradient-to-tr dark:from-green-700 dark:to-yellow-500",
    query: "best reggae music mix bob marley vibes",
  },
  {
    label: "Alternative",
    lightBg: "bg-gradient-to-tr from-sky-400 to-violet-500",
    darkBg: "dark:bg-gradient-to-tr dark:from-sky-600 dark:to-violet-700",
    query: "alternative indie rock playlist 2024",
  },
];

export default function Index() {
  const [feed, setFeed] = useState([]);

  if (feed?.length === 0) {
    setTimeout(() => {
      const feeds = PersistedAppState.get("feed");
      if (feeds && feeds?.length > 0) {
        setFeed(feeds);
      } else {
        setFeed(DEFAULT_FEEDS);
        PersistedAppState.set("feed", DEFAULT_FEEDS);
      }
    }, 100);
  }

  return (
    <section className="flex-1 container mx-auto px-4 pb-20 relative z-10 py-20 pt-6 flex flex-col">
      <h2 className="text-xl font-bold mb-4 px-4">Categories</h2>

      {/* Mobile (flex badges) */}
      <div className="inline-flex flex-wrap gap-3 gap-y-5 sm:hidden items-center pt-0 p-4">
        {categories.map((cat, index) => (
          <Link
            href={`/search?q=${cat.query}`}
            key={index}
            className={`
        px-4 py-2 text-sm font-medium rounded-full border border-border
        text-background
        ${cat.lightBg} ${cat.darkBg}
      `}
          >
            {cat.label}
          </Link>
        ))}
      </div>

      {/* Desktop & Tablet (grid cards) */}
      <div className="p-4 pt-0 hidden sm:grid grid-cols-2 gap-4 md:grid-cols-3 lg:grid-cols-5">
        {categories.map((cat, index) => (
          <Link
            href={`/search?q=${cat.query}`}
            key={index}
            className={`
        flex items-center justify-center h-24 rounded-md border border-border
        font-semibold text-background
        shadow-sm
        ${cat.lightBg} ${cat.darkBg}
      `}
          >
            {cat.label}
          </Link>
        ))}
      </div>

      {feed?.map((item, index) => (
        <MediaSection
          key={index}
          label={item.label}
          query={item.query}
          page={item.page}
          limit={item.limit}
          button={
            index === feed?.length - 1 ? (
              <Link
                className="mb-32 inline-flex items-center justify-center rounded-full font-medium transition-all focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500 bg-primary text-primary-foreground hover:bg-primary/90 px-4 py-2"
                href="/settings"
              >
                {"Customize Feed >"}
              </Link>
            ) : null
          }
        />
      ))}
    </section>
  );
}
