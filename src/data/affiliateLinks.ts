/**
 * The products we link to, and nothing about where those links point.
 *
 * Destination is decided per request by src/pages/go/[key].ts, which knows the
 * visitor's country; see src/data/amazon-regions.ts for the routing table. That
 * is why entries carry search terms rather than URLs — a URL would have to bake
 * in one storefront and one tag, which is exactly the problem the /go/ layer
 * exists to fix.
 *
 * Search terms rather than ASINs: a search listing never 404s as models cycle
 * and always shows current sizes and colours, and it works in every storefront
 * without needing a per-region ASIN. Where a specific product is worth pinning,
 * add `asin` keyed by country code — the resolver prefers it when the visitor's
 * region has one.
 */

import {
  amazonProductUrl,
  amazonSearchUrl,
  type AmazonStore,
} from "./amazon-regions";

export interface AmazonAffiliateLink {
  productKey: string;
  displayName: string;
  /** Query used to build a storefront listing in any region. */
  search: string;
  /** Optional pinned product, by ISO-3166-1 alpha-2 country code. */
  asin?: Record<string, string>;
  store: string;
  /** Indicative US price, shown as a hint. Not a live figure. */
  price?: string;
}

export const affiliateLinks: AmazonAffiliateLink[] = [
  {
    productKey: "creatine-monohydrate",
    displayName: "Creatine Monohydrate",
    search: "creatine monohydrate thorne",
    store: "Amazon",
    price: "~$22",
  },
  {
    productKey: "creatine",
    displayName: "Creatine Monohydrate",
    search: "creatine monohydrate thorne",
    store: "Amazon",
    price: "~$22",
  },
  {
    productKey: "protein-powder",
    displayName: "Whey Protein",
    search: "whey protein powder optimum nutrition",
    store: "Amazon",
    price: "~$45",
  },
  {
    productKey: "energy-gels",
    displayName: "Energy Gels",
    search: "sis go isotonic energy gel",
    store: "Amazon",
    price: "~$3/gel",
  },
  {
    productKey: "pre-workout",
    displayName: "Pre-Workout",
    search: "pre workout caffeine tablets",
    store: "Amazon",
    price: "~$35",
  },
  {
    productKey: "electrolytes",
    displayName: "Electrolytes",
    search: "nuun electrolyte tablets",
    store: "Amazon",
    price: "~$24",
  },
  {
    productKey: "recovery",
    displayName: "Recovery (Omega-3 / Tart Cherry)",
    search: "nordic naturals ultimate omega",
    store: "Amazon",
    price: "~$30",
  },

  // ── Gear ───────────────────────────────────────────────────────────────
  // Prices intentionally omitted — shoe and equipment RRPs are quoted in the
  // comparison tables, not as a single figure that would go stale.
  {
    productKey: "puma-fast-r",
    displayName: "Puma Fast-R Nitro Elite",
    search: "puma fast-r nitro elite",
    store: "Amazon",
  },
  {
    productKey: "nike-metcon-9",
    displayName: "Nike Metcon 9",
    search: "nike metcon 9",
    store: "Amazon",
  },
  {
    productKey: "nobull-trainer",
    displayName: "NoBull Trainer+",
    search: "nobull trainer plus",
    store: "Amazon",
  },
  {
    productKey: "puma-deviate-nitro-3",
    displayName: "Puma Deviate Nitro 3",
    search: "puma deviate nitro 3",
    store: "Amazon",
  },
  {
    productKey: "nike-pegasus-41",
    displayName: "Nike Pegasus 41",
    search: "nike pegasus 41",
    store: "Amazon",
  },
  {
    productKey: "reebok-nano-x4",
    displayName: "Reebok Nano X4",
    search: "reebok nano x4",
    store: "Amazon",
  },
  {
    productKey: "kettlebell",
    displayName: "Kettlebell",
    search: "competition kettlebell 24kg",
    store: "Amazon",
  },
  {
    productKey: "dumbbell",
    displayName: "Adjustable Dumbbells",
    search: "adjustable dumbbell pair",
    store: "Amazon",
  },
  {
    productKey: "air-bike",
    displayName: "Air Bike",
    search: "assault air bike",
    store: "Amazon",
  },
  {
    productKey: "row-erg",
    displayName: "Concept2 RowErg",
    search: "concept2 rowerg",
    store: "Amazon",
  },
  {
    productKey: "chalk",
    displayName: "Liquid Chalk",
    search: "liquid chalk grip gym",
    store: "Amazon",
    price: "~$15",
  },
  {
    productKey: "grip-gloves",
    displayName: "Grip Gloves",
    search: "workout gloves grip palm protection",
    store: "Amazon",
    price: "~$20",
  },
];

const DEFAULT_LINK: AmazonAffiliateLink = {
  productKey: "default",
  displayName: "Amazon",
  search: "hyrox training gear",
  store: "Amazon",
};

export function getLinksForProduct(
  productKey: string,
): AmazonAffiliateLink | undefined {
  return affiliateLinks.find((p) => p.productKey === productKey);
}

export function getBestLink(productKey: string): AmazonAffiliateLink {
  return getLinksForProduct(productKey) ?? DEFAULT_LINK;
}

/**
 * Where a button points. Always our own /go/ endpoint, never Amazon directly,
 * because the storefront can only be chosen once the visitor's country is
 * known and that is a per-request fact a static page cannot have.
 */
export function affiliateHref(productKey: string): string {
  // No trailing slash, matching the /api/ endpoints. The site is
  // trailing-slash canonical for pages, but these are function routes that are
  // never indexed, and the slashless form is the one already proven in prod.
  return `/go/${encodeURIComponent(productKey)}`;
}

/** Resolves a product to a storefront URL. Used by the /go/ endpoint. */
export function resolveAffiliateUrl(
  link: AmazonAffiliateLink,
  store: AmazonStore,
  country: string | null,
): string {
  const asin = country ? link.asin?.[country.toUpperCase()] : undefined;
  return asin
    ? amazonProductUrl(store, asin)
    : amazonSearchUrl(store, link.search);
}
