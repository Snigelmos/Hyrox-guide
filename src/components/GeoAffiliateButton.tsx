import { useGeoCountry } from "../hooks/useGeoCountry";
import { getBestLink } from "../data/affiliateLinks";
import type { GeoRegion } from "../hooks/useGeoCountry";

interface Props {
  productKey: string;
  /** Optional override — shown while geo lookup is in progress */
  fallbackLabel?: string;
  className?: string;
  variant?: "primary" | "secondary" | "card";
}

const FLAG: Record<GeoRegion, string> = {
  SE: "🇸🇪", NO: "🇳🇴", DK: "🇩🇰", FI: "🇫🇮",
  DE: "🇩🇪", AT: "🇦🇹", CH: "🇨🇭",
  GB: "🇬🇧",
  US: "🇺🇸", CA: "🇨🇦",
  AU: "🇦🇺",
  default: "🌍",
};

export default function GeoAffiliateButton({
  productKey,
  fallbackLabel = "View Best Deal",
  className = "",
  variant = "primary",
}: Props) {
  const { region, loading } = useGeoCountry();
  const link = getBestLink(productKey, region);

  const base =
    variant === "primary"
      ? "inline-flex items-center gap-2 px-4 py-2.5 bg-accent text-bg font-bold rounded-lg hover:bg-accent-dim transition-all text-sm"
      : variant === "secondary"
      ? "inline-flex items-center gap-2 px-4 py-2.5 border border-accent/40 text-accent font-bold rounded-lg hover:bg-accent/10 transition-all text-sm"
      : // card variant — full-width
        "flex items-center justify-between w-full px-4 py-3 bg-accent/10 border border-accent/20 text-accent font-bold rounded-lg hover:bg-accent/20 transition-all text-sm";

  if (loading) {
    return (
      <span className={`${base} opacity-60 cursor-wait ${className}`}>
        <span className="w-3 h-3 rounded-full border-2 border-accent border-t-transparent animate-spin" />
        {fallbackLabel}
      </span>
    );
  }

  return (
    <a
      href={link.url}
      target="_blank"
      rel="noopener noreferrer nofollow"
      className={`${base} ${className}`}
    >
      <span>{FLAG[region] ?? "🌍"}</span>
      <span>
        Buy on {link.store}
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
