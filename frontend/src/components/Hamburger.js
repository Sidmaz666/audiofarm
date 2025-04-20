import { Peachy, useGlobalState } from "@peach/component";
import { PersistedAppState } from "@peach/state";

export default function Hamburger() {
  const [isCollapsed, setIsCollapsed] = useGlobalState(
    PersistedAppState,
    "sidebar"
  );
  return (
    <div>
      {isCollapsed ? (
        <button
          onClick={() => {
            setIsCollapsed(!isCollapsed);
          }}
          className="flex items-center cursor-pointer justify-center w-10 h-10 rounded-full bg-background/50 backdrop-blur-sm border border-border transition-all hover:bg-accent"
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            className="w-10 h-10 bg-background rounded-full border border-border hover:bg-secondary p-2"
            viewBox="0 0 448 512"
            fill="#00000000"
          >
            <path
              fill="hsl(var(--foreground))"
              d="M0 96C0 78.3 14.3 64 32 64l384 0c17.7 0 32 14.3 32 32s-14.3 32-32 32L32 128C14.3 128 0 113.7 0 96zM0 256c0-17.7 14.3-32 32-32l384 0c17.7 0 32 14.3 32 32s-14.3 32-32 32L32 288c-17.7 0-32-14.3-32-32zM448 416c0 17.7-14.3 32-32 32L32 448c-17.7 0-32-14.3-32-32s14.3-32 32-32l384 0c17.7 0 32 14.3 32 32z"
            />
          </svg>
        </button>
      ) : null}
    </div>
  );
}
