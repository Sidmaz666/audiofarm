import { useGlobalState, Peachy } from "@peach/component";
import Link from "@components/Link";
import Button from "@components/Button";
import { PersistedAppState } from "@peach/state";
import { isMobile } from "@utils/isMobile";

export default function Navbar() {
  // Manage mobile collapse state
  const [isCollapsed, setIsCollapsed] = useGlobalState(
    PersistedAppState,
    "sidebar",
    isMobile()
  );
  // Get current pathname (update this logic if your router provides a hook)
  const currentPath =
    typeof window !== "undefined" ? window.location.pathname : "/";

  // Navigation items without icons
  const navItems = [
    { name: "Home", href: "/" },
    { name: "Search", href: "/search" },
    { name: "Favorites", href: "/favorites" },
    { name: "Playlists", href: "/playlists" },
    { name: "Downloads", href: "/downloads" },
    { name: "History", href: "/history" },
  ];

  // Toggle collapse on mobile devices
  const toggleCollapse = () => {
    setIsCollapsed(!isCollapsed);
  };

  return (
    <aside
      className={`bg-background text-foreground md:w-64 flex-shrink-0 h-full flex-col border-r border-border absolute z-[999] md:relative ${
        isCollapsed ? "hidden" : "flex"
      }`}
    >
      {/* Header: Branding & Mobile Toggle */}
      <div className="flex items-center justify-between p-4 border-b border-border">
        <div className="flex items-center w-full space-x-4 text-primary">
          <svg
            xmlns="http://www.w3.org/2000/svg"
            width="24"
            height="24"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            stroke-width="2"
            stroke-linecap="round"
            stroke-linejoin="round"
          >
            <circle cx="8" cy="18" r="4" />
            <path d="M12 18V2l7 4" />
          </svg>
          <h1 className="text-2xl font-normal uppercase tracking-widest font-mono">
            Audiofarm
          </h1>
        </div>
      </div>

      {/* Navigation Items */}
      <nav className={`flex-1 overflow-y-auto`}>
        <ul className="mt-4 space-y-2">
          {navItems.map((item) => {
            const isActive = currentPath === item.href;
            return (
              <li key={item.name} className="px-2">
                <Link
                  href={item.href}
                  onClick={(e) => {
                    if (isMobile()) {
                      toggleCollapse();
                    }
                  }}
                  className={`block font-bold uppercase tracking-widest font-mono px-4 py-2 rounded-md transition-colors hover:bg-primary ${
                    isActive ? "bg-primary font-semibold" : ""
                  }`}
                >
                  {item.name}
                </Link>
              </li>
            );
          })}
        </ul>
      </nav>
      <div className="p-4 border-t border-border flex justify-center items-center">
        <Button variant="ghost" size="md" onClick={toggleCollapse}>
          {isCollapsed ? ">" : "<"}
        </Button>
      </div>
    </aside>
  );
}
