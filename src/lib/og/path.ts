/**
 * Maps a page pathname to its generated OG image URL.
 *
 * The OG endpoint emits one PNG per registered route under /og/<path>.png.
 * Pages that aren't enumerated in src/pages/og/[...path].png.ts fall back
 * to a sensible category default. Anything we genuinely can't map falls
 * back to /og-default.png so social previews never break.
 *
 * Update the SECTION_FALLBACKS / KNOWN_PATHS sets if you add a new
 * top-level section or static page.
 */

const KNOWN_PATHS = new Set<string>([
  "index",
  "blog",
  "training",
  "supplements",
  "gear",
  "racing-guide",
  "calculator",
  "competitions",
  "gyms",
  "gyms/map",
  "about",
  "faq",
  "glossary",
  "qualifiers",
  "events",
  "compare",
  "stations",
  "times",
  "training-plans",
  "workouts",
]);

const SECTION_FALLBACKS: Record<string, string> = {
  blog: "blog",
  training: "training",
  supplements: "supplements",
  gear: "gear",
  "racing-guide": "racing-guide",
  calculator: "calculator",
  competitions: "competitions",
  gyms: "gyms",
  qualifiers: "qualifiers",
  events: "events",
  compare: "compare",
  stations: "stations",
  times: "times",
  "training-plans": "training-plans",
  workouts: "workouts",
};

const COLLECTION_PREFIXES = [
  "blog/",
  "racing-guide/",
  "training/",
  "gear/",
  "supplements/",
];

/**
 * @param pathname e.g. "/blog/some-post/" or "/" or "/gyms/map/"
 * @returns absolute-or-relative URL to use as og:image (path only).
 */
export function ogPathFor(pathname: string): string {
  const trimmed = pathname.replace(/^\/+|\/+$/g, "");
  const key = trimmed === "" ? "index" : trimmed;

  if (KNOWN_PATHS.has(key)) {
    return `/og/${key}.png`;
  }

  if (COLLECTION_PREFIXES.some((prefix) => key.startsWith(prefix))) {
    return `/og/${key}.png`;
  }

  const topSection = key.split("/")[0];
  if (topSection && SECTION_FALLBACKS[topSection]) {
    return `/og/${SECTION_FALLBACKS[topSection]}.png`;
  }

  return "/og-default.png";
}
