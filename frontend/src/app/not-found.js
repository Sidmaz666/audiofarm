import { Peachy } from "@peach/component";
import Link from "@components/Link";
import ThemeToggle from "@components/ThemeToggle";

export default function NotFound() {
  return (
    <section className="flex-1 container mx-auto px-4 py-20 flex flex-col items-center justify-center min-h-[calc(100dvh-10rem)]">
      <div className="bg-card border border-border rounded-xl p-8 shadow-lg max-w-md w-full text-center relative">
        {/* Theme Toggle in top-right corner */}
        <div className="absolute top-4 right-4">
          <ThemeToggle className="p-2 rounded-full hover:bg-muted/50 transition-colors" />
        </div>
        <div className="flex justify-center mb-4">
          <svg
            className="w-16 h-16 text-primary"
            xmlns="http://www.w3.org/2000/svg"
            width="24"
            height="24"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <circle cx="8" cy="18" r="4"></circle>
            <path d="M12 18V2l7 4"></path>
          </svg>
        </div>
        <h1 className="text-3xl font-bold text-foreground mb-2">
          404 - Page Not Found
        </h1>
        <p className="text-sm text-muted-foreground mb-6">
          Oops! It looks like this page doesn’t exist. You might have mistyped
          the URL or the page has been moved.
        </p>
        <Link
          href="/"
          className="inline-flex items-center gap-2 bg-primary text-primary-foreground px-4 py-2 rounded-md hover:bg-primary/90 transition-colors"
        >
          <svg
            className="w-4 h-4"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
            xmlns="http://www.w3.org/2000/svg"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1-1h-3M6 21h12a1 1 0 001-1v-7"
            />
          </svg>
          Back to Home
        </Link>
      </div>
    </section>
  );
}
