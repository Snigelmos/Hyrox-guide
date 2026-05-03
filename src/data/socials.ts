/**
 * Public-facing social profile URLs for HyroxVault.
 *
 * These power the Organization JSON-LD `sameAs` array on the about page and
 * the Person JSON-LD `sameAs` on author profile pages.
 *
 * IMPORTANT for E-E-A-T:
 *  - Empty `sameAs` is a known weak signal (it suggests an entity Google
 *    cannot cross-reference). Populate this as soon as the corresponding
 *    profiles exist.
 *  - DO NOT add URLs to profiles that don't yet exist or 404. A broken
 *    `sameAs` link is worse than an empty array because Google will fail
 *    the entity reconciliation check.
 *
 * Recommended targets to claim and add (in priority order):
 *  1. Instagram (@hyroxvault)
 *  2. X / Twitter (@hyroxvault)
 *  3. YouTube (Hyrox training and race-day content)
 *  4. Strava club ("HyroxVault" or similar)
 *  5. LinkedIn company page
 *  6. TikTok (if the audience supports it)
 */

export const SITE_SOCIALS: string[] = [
  // Add real, verified profile URLs here. Each must resolve to a live page
  // owned and operated by HyroxVault.
  // Example shape (uncomment and replace once profiles are live):
  // "https://www.instagram.com/hyroxvault/",
  // "https://www.youtube.com/@hyroxvault",
  // "https://x.com/hyroxvault",
  // "https://www.strava.com/clubs/hyroxvault",
];
