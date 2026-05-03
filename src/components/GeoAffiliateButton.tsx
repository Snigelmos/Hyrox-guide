import { getBestLink } from "../data/affiliateLinks";

interface Props {
  productKey: string;
  /** Optional override label — kept for backwards compatibility with existing call sites */
  fallbackLabel?: string;
  className?: string;
  variant?: "primary" | "secondary" | "card";
}

export default function GeoAffiliateButton({
  productKey,
  className = "",
  variant = "primary",
}: Props) {
  const link = getBestLink(productKey);

  const base =
    variant === "primary"
      ? "inline-flex items-center gap-2 px-4 py-2.5 bg-accent text-bg font-bold rounded-lg hover:bg-accent-dim transition-all text-sm"
      : variant === "secondary"
      ? "inline-flex items-center gap-2 px-4 py-2.5 border border-accent/40 text-accent font-bold rounded-lg hover:bg-accent/10 transition-all text-sm"
      : "inline-flex items-center justify-center gap-1.5 w-full px-3 py-2 bg-accent text-bg font-bold rounded-lg hover:bg-accent-dim transition-all text-xs";

  if (variant === "card") {
    return (
      <a
        href={link.url}
        target="_blank"
        rel="noopener noreferrer sponsored nofollow"
        className={`${base} ${className}`}
      >
        Buy on Amazon
      </a>
    );
  }

  return (
    <a
      href={link.url}
      target="_blank"
      rel="noopener noreferrer sponsored nofollow"
      className={`${base} ${className}`}
    >
      <span>
        Buy on Amazon
        {link.price && (
          <span className="font-normal opacity-75 ml-1">— {link.price}</span>
        )}
      </span>
      <svg
        className="w-3.5 h-3.5 flex-shrink-0 ml-auto"
        fill="none"
        viewBox="0 0 24 24"
        stroke="currentColor"
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth={2}
          d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14"
        />
      </svg>
    </a>
  );
}
