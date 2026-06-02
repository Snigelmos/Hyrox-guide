/**
 * Maps the legacy emoji icons (still stored in some content frontmatter and
 * data files) to the named glyphs rendered by `ContentIcons.astro`.
 *
 * New code should use the icon names directly. This helper exists so we can
 * keep emoji in content frontmatter (authoring convenience) while rendering a
 * consistent, on-brand SVG icon set in the UI.
 */
export const EMOJI_TO_ICON: Record<string, string> = {
  "💪": "strength",
  "🥤": "shaker",
  "⚡": "bolt",
  "🔥": "flame",
  "💧": "droplet",
  "🔄": "recovery",
  "💊": "capsule",
  "📋": "clipboard",
  "🗓️": "calendar",
  "📅": "calendar",
  "💰": "money",
  "🌙": "moon",
  "🌅": "sunrise",
  "🏁": "flag",
  "📖": "book",
  "👟": "shoe",
  "👕": "shirt",
  "🎒": "backpack",
  "🏠": "home",
  "🛒": "cart",
  "🚀": "rocket",
  "🏃": "run",
  "🏋️": "lift",
  "💥": "burst",
  "🎯": "target",
  "📍": "pin",
  "🏆": "trophy",
  "🌍": "globe",
  "💡": "bulb",
  "🚹": "male",
  "🚺": "female",
  "🏟️": "stadium",
  "🏅": "medal",
  "🌱": "seedling",
  "⏱️": "stopwatch",
  "❓": "question",
};

/**
 * Resolve an icon name from either an emoji or an already-named icon. Falls
 * back to `fallback` (default "book") when nothing matches.
 */
export function iconName(value: string | undefined, fallback = "book"): string {
  if (!value) return fallback;
  return EMOJI_TO_ICON[value] ?? value;
}
