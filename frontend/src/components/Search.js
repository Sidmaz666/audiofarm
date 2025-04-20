import { Peachy } from "@peach/component";
import { peachyRouter } from "@peach/router";

export default function SearchInput() {
  // Vanilla JS: On form submit, grab the input's value from the DOM.
  function handleSubmit(e) {
    e.preventDefault();
    const form = e.currentTarget;
    const query = form.elements.search.value.trim();
    if (query) {
      window.history.pushState(
        {},
        "",
        `/search?q=${encodeURIComponent(query)}`
      );
      peachyRouter.handleRoute(`/search`);
    }
  }

  return (
    <form
      onSubmit={handleSubmit}
      className="relative w-full md:max-w-md max-w-[200px]"
    >
      <button
        onClick={(e) => {
          e.preventDefault();
          const query =
            new URLSearchParams(window.location.search).get("q") || "";

          if (query?.length > 0) {
            const path = window.location.pathname?.split("?")[0];
            window.history.pushState({}, "", path);
            //peachyRouter.handleRoute(path);
            document.querySelector("input[type=search]").value = "";
          }
        }}
        className="w-4 h-full absolute right-4 top-0 opacity-0"
      ></button>
      <input
        type="search"
        name="search"
        value={new URLSearchParams(window.location.search).get("q") || ""}
        onKeyDown={(e) => {
          if (e.key === "Enter") {
            e.preventDefault();
            const form = e.currentTarget.form;
            const query = form.elements.search.value.trim();
            if (query) {
              window.history.pushState(
                {},
                "",
                `/search?q=${encodeURIComponent(query)}`
              );
              peachyRouter.handleRoute(`/search`);
            }
          }
        }}
        defaultValue=""
        placeholder="Search..."
        autoComplete="off"
        className="w-full bg-background border border-border
        text-foreground py-2 pl-10 pr-4 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-background transition-colors
        placeholder:font-mono placeholder:tracking-wider placeholder:uppercase
        "
      />
      <button
        type="submit"
        className="absolute inset-y-0 left-0 flex items-center pl-3"
      >
        <svg
          xmlns="http://www.w3.org/2000/svg"
          className="h-5 w-5 text-primary"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth="2"
            d="M21 21l-4.35-4.35M6.5 11a4.5 4.5 0 119 0 4.5 4.5 0 01-9 0z"
          />
        </svg>
      </button>
    </form>
  );
}
