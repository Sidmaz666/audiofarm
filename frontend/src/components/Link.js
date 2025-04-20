import { Peachy } from "@peach/component";
import { peachyRouter } from "@peach/router";

export default function Link({ href, children, onClick, ...props }) {
  const handleClick = (e) => {
    e.preventDefault();

    // Optional: call user's onClick first
    if (onClick) {
      const _f = onClick(e);
      if(_f?.abort) return
    }

    // Split path and query from href
    const [path, newQueryString] = href.split("?");

    const newQuery = new URLSearchParams(newQueryString);
    const existingQuery = new URLSearchParams(window.location.search);

    for (const [key, value] of newQuery.entries()) {
      existingQuery.set(key, value);
    }

    const finalQueryString = existingQuery.toString();
    const finalUrl = `${path}${finalQueryString ? `?${finalQueryString}` : ""}`;

    window.history.pushState(window.location.href, "", finalUrl);
    peachyRouter.handleRoute(path);
  };

  return (
    <a href={href} onClick={handleClick} {...props}>
      {children}
    </a>
  );
}
