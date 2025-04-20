// layout.js
// Global layout used as a fallback for all routes.
// Must include an element with id "page-content" where the page component is mounted.

import { Peachy } from "@peach/component";
import Navbar from "@components/Navbar";
import ThemeToggle from "@components/ThemeToggle";
import Hamburger from "@components/Hamburger";
import SearchInput from "@components/Search";
import Link from "@components/Link";
import Player from "@components/Player";

export default function Layout() {
  return (
    <div className="max-h-[100dvh] h-[100dvh] w-screen flex overflow-hidden">
      <Navbar />
      <div className="max-h-[100dvh] h-[100dvh] flex flex-col relative w-full">
        <div className="flex items-center justify-between p-4 pt-2.5 pb-3 border-b border-border sticky top-0 right-2 z-50 w-full">
          <div className="flex items-center space-x-2">
            <Hamburger />
          </div>
          <div className="flex items-center space-x-2">
            <SearchInput />
            <ThemeToggle />
            <Link href={"/settings"}>
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="w-10 h-10 bg-background rounded-full border border-border hover:bg-secondary p-2"
                viewBox="0 0 512 512"
                fill="#00000000"
              >
                <path
                  fill="hsl(var(--foreground))"
                  d="M0 416c0 17.7 14.3 32 32 32l54.7 0c12.3 28.3 40.5 48 73.3 48s61-19.7 73.3-48L480 448c17.7 0 32-14.3 32-32s-14.3-32-32-32l-246.7 0c-12.3-28.3-40.5-48-73.3-48s-61 19.7-73.3 48L32 384c-17.7 0-32 14.3-32 32zm128 0a32 32 0 1 1 64 0 32 32 0 1 1 -64 0zM320 256a32 32 0 1 1 64 0 32 32 0 1 1 -64 0zm32-80c-32.8 0-61 19.7-73.3 48L32 224c-17.7 0-32 14.3-32 32s14.3 32 32 32l246.7 0c12.3 28.3 40.5 48 73.3 48s61-19.7 73.3-48l54.7 0c17.7 0 32-14.3 32-32s-14.3-32-32-32l-54.7 0c-12.3-28.3-40.5-48-73.3-48zM192 128a32 32 0 1 1 0-64 32 32 0 1 1 0 64zm73.3-64C253 35.7 224.8 16 192 16s-61 19.7-73.3 48L32 64C14.3 64 0 78.3 0 96s14.3 32 32 32l86.7 0c12.3 28.3 40.5 48 73.3 48s61-19.7 73.3-48L480 128c17.7 0 32-14.3 32-32s-14.3-32-32-32L265.3 64z"
                />
              </svg>
            </Link>
          </div>
        </div>

        <Player />

        <main
          id="page-content"
          className="h-full max-h-[100dvh] overflow-y-auto font-mono uppercase tracking-widest"
        ></main>
      </div>
    </div>
  );
}
