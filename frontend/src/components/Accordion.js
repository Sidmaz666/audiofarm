import { Peachy, useState } from "@peach/component";

// SVG Icon Component
const ChevronDownIcon = ({ isOpen }) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
    className={`h-5 w-5 text-muted-foreground transition-transform duration-300 ${
      isOpen ? "rotate-180" : ""
    }`}
  >
    <polyline points="6 9 12 15 18 9" />
  </svg>
);

export default function Accordion({ title, children, defaultOpen = false }) {
  // Handle controlled vs uncontrolled state
  const [isOpen, setIsOpen] = useState(defaultOpen);

  // Toggle accordion state
  const toggleAccordion = () => {
    setIsOpen(!isOpen);
  };

  // Handle keyboard navigation (Enter or Space to toggle)
  const handleKeyDown = (event) => {
    if (event.key === "Enter" || event.key === " ") {
      event.preventDefault();
      toggleAccordion();
    }
  };

  // Edge case: no children
  if (!children) {
    return (
      <div className="border border-border rounded-lg bg-card">
        <div
          className="flex items-center justify-between p-4 bg-card text-card-foreground cursor-not-allowed opacity-50"
          aria-disabled="true"
        >
          <h3 className="text-lg font-medium uppercase tracking-widest font-mono">
            {title || "No Title"}
          </h3>
          <ChevronDownIcon isOpen={false} />
        </div>
      </div>
    );
  }

  return (
    <div
      className="border border-border rounded-lg bg-card overflow-hidden transition-all duration-300"
      role="region"
      aria-labelledby={title ? `accordion-title-${title}` : undefined}
    >
      {/* Header */}
      <button
        type="button"
        className={`flex w-full items-center justify-between p-4 bg-card text-card-foreground hover:bg-accent hover:text-accent-foreground focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 transition-colors ${
          isOpen ? "bg-accent text-accent-foreground" : ""
        }`}
        onClick={toggleAccordion}
        onKeyDown={handleKeyDown}
        aria-expanded={isOpen}
        aria-controls={title ? `accordion-content-${title}` : undefined}
        id={title ? `accordion-title-${title}` : undefined}
      >
        <h3 className="text-lg font-medium text-left uppercase tracking-widest font-mono">
          {title || "Accordion"}
        </h3>
        <ChevronDownIcon isOpen={isOpen} />
      </button>

      {/* Content */}
      <div
        className={`grid transition-all duration-300 ease-in-out ${
          isOpen ? "grid-rows-[1fr] opacity-100" : "grid-rows-[0fr] opacity-0"
        }`}
        id={title ? `accordion-content-${title}` : undefined}
        role="region"
        aria-hidden={!isOpen}
      >
        <div className="overflow-hidden">
          <div className="p-4 bg-background text-foreground border-t border-border">
            {children}
          </div>
        </div>
      </div>
    </div>
  );
}
