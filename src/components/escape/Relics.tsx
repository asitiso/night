import type { ItemId } from "@/game/content";

export function RelicGlyph({ id, className }: { id: ItemId; className?: string }) {
  const common = {
    className,
    viewBox: "0 0 32 32",
    fill: "none",
    "aria-hidden": true as const,
  };
  switch (id) {
    case "wax":
      return (
        <svg {...common}>
          <circle cx="16" cy="16" r="11" stroke="currentColor" strokeWidth="1.6" />
          <circle cx="16" cy="16" r="6" stroke="currentColor" strokeWidth="1.4" />
          <path d="M16 8.5v3.2M16 20.3V23.5M8.5 16h3.2M20.3 16H23.5" stroke="currentColor" strokeWidth="1.3" />
        </svg>
      );
    case "cog":
      return (
        <svg {...common}>
          <circle cx="16" cy="16" r="4.2" stroke="currentColor" strokeWidth="1.6" />
          <path
            d="M16 4.5v3.2M16 24.3V27.5M4.5 16h3.2M24.3 16H27.5M7.2 7.2l2.3 2.3M22.5 22.5l2.3 2.3M24.8 7.2l-2.3 2.3M9.5 22.5l-2.3 2.3"
            stroke="currentColor"
            strokeWidth="1.5"
            strokeLinecap="round"
          />
        </svg>
      );
    case "emerald":
      return (
        <svg {...common}>
          <path d="M16 4.5 26 12.2 16 27.5 6 12.2Z" stroke="currentColor" strokeWidth="1.6" strokeLinejoin="round" />
          <path d="M6 12.2h20M16 4.5 12 12.2 16 27.5 20 12.2Z" stroke="currentColor" strokeWidth="1.2" />
        </svg>
      );
    case "cuff":
      return (
        <svg {...common}>
          <rect x="7" y="10" width="18" height="12" rx="3" stroke="currentColor" strokeWidth="1.6" />
          <circle cx="16" cy="16" r="2.4" fill="currentColor" />
        </svg>
      );
    case "locket":
      return (
        <svg {...common}>
          <circle cx="16" cy="15" r="8" stroke="currentColor" strokeWidth="1.6" />
          <path d="M16 7.2V4.2M12.2 4.2h7.6" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
          <path d="M16 12.2v5.2" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" />
        </svg>
      );
    case "pearl":
      return (
        <svg {...common}>
          <circle cx="16" cy="16" r="8" stroke="currentColor" strokeWidth="1.6" />
          <path d="M12 12.5c1.6 1.2 3.4 1.6 6.2.4" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round" />
        </svg>
      );
    case "amber":
      return (
        <svg {...common}>
          <path d="M11 6h10l2 4.5v11.2a3 3 0 0 1-3 3H12a3 3 0 0 1-3-3V10.5Z" stroke="currentColor" strokeWidth="1.6" strokeLinejoin="round" />
          <path d="M10 11h12" stroke="currentColor" strokeWidth="1.3" />
        </svg>
      );
    case "shard":
      return (
        <svg {...common}>
          <path d="M16 4.2 24.5 26.5H7.5Z" stroke="currentColor" strokeWidth="1.6" strokeLinejoin="round" />
          <path d="M16 10.5v8" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round" />
        </svg>
      );
    case "sigil":
      return (
        <svg {...common}>
          <circle cx="16" cy="16" r="10" stroke="currentColor" strokeWidth="1.6" />
          <path d="M16 8.5 18.2 13.4 23.5 14.1 19.6 17.6 20.6 22.8 16 20.3 11.4 22.8 12.4 17.6 8.5 14.1 13.8 13.4Z" stroke="currentColor" strokeWidth="1.2" strokeLinejoin="round" />
        </svg>
      );
    default:
      return null;
  }
}
