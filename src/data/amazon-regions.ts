/**
 * Which Amazon storefront an affiliate click should land on, by visitor country.
 *
 * The problem this exists to solve: roughly three quarters of outbound clicks
 * come from outside the United States, and every link on the site used to point
 * at amazon.com with a US Associates tag. Those visitors landed on a storefront
 * that mostly will not ship to them, so the click was worth nothing to them and
 * nothing to us.
 *
 * ── Adding a region ────────────────────────────────────────────────────────
 * A tag is storefront-specific. `hyroxvault-20` is a US tag and tracks nothing
 * on amazon.co.uk, so sending a UK visitor to amazon.co.uk without a UK tag is
 * strictly worse than leaving them on amazon.com: they get a local storefront
 * and we get no commission at all.
 *
 * So every country not listed in AMAZON_STORES deliberately falls through to
 * the US. To switch a region on, sign up for that locale's Associates
 * programme, then add one line:
 *
 *     GB: { host: "www.amazon.co.uk", tag: "hyroxvault-21" },
 *
 * Nothing else needs to change. Hosts for the storefronts that exist but have
 * no account yet are listed in PENDING_STORES below so the lookup is one
 * copy-paste rather than a research task.
 */

export interface AmazonStore {
  /** Storefront host, e.g. "www.amazon.co.uk". */
  host: string;
  /** Associates tracking id issued for THAT storefront. */
  tag: string;
}

export const AMAZON_US: AmazonStore = {
  host: "www.amazon.com",
  tag: "hyroxvault-20",
};

/**
 * ISO-3166-1 alpha-2 country code -> storefront. Anything absent falls back to
 * AMAZON_US, which is the correct behaviour until a regional tag exists.
 */
export const AMAZON_STORES: Record<string, AmazonStore> = {
  US: AMAZON_US,
};

/**
 * Storefronts we could route to the moment an Associates account exists for
 * them, ordered by how much traffic each currently sends us. Not wired up —
 * these are here so adding a region is a one-line edit above.
 *
 * Amazon has no storefront in several of our larger markets (South Africa is
 * amazon.co.za and very limited; there is none for most of South America), so
 * those will keep falling back to the US regardless.
 */
export const PENDING_STORES: Record<string, string> = {
  GB: "www.amazon.co.uk",
  AU: "www.amazon.com.au",
  IN: "www.amazon.in",
  CA: "www.amazon.ca",
  DE: "www.amazon.de",
  FR: "www.amazon.fr",
  IT: "www.amazon.it",
  ES: "www.amazon.es",
  NL: "www.amazon.nl",
  SE: "www.amazon.se",
  PL: "www.amazon.pl",
  AE: "www.amazon.ae",
  SG: "www.amazon.sg",
  JP: "www.amazon.co.jp",
  MX: "www.amazon.com.mx",
  BR: "www.amazon.com.br",
};

export function storeForCountry(country: string | null | undefined): AmazonStore {
  if (!country) return AMAZON_US;
  return AMAZON_STORES[country.toUpperCase()] ?? AMAZON_US;
}

/** A search listing. Used when no ASIN is pinned for the region. */
export function amazonSearchUrl(store: AmazonStore, search: string): string {
  const url = new URL(`https://${store.host}/s`);
  url.searchParams.set("k", search);
  url.searchParams.set("tag", store.tag);
  return url.toString();
}

/**
 * A specific product. ASINs are per-storefront — the same product has a
 * different ASIN on amazon.co.uk than on amazon.com — so this is only used
 * where an ASIN has been confirmed for that region.
 */
export function amazonProductUrl(store: AmazonStore, asin: string): string {
  const url = new URL(`https://${store.host}/dp/${asin}`);
  url.searchParams.set("tag", store.tag);
  return url.toString();
}
