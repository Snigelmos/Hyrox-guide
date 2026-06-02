// All affiliate links route to Amazon US using the hyroxvault-20 Associates tag.
// If/when additional regional or non-Amazon programs come online (Adrecord SE/NO/DK/FI,
// Awin UK/DE, iHerb, etc.), reintroduce per-region routing here.

export interface AmazonAffiliateLink {
  productKey: string;
  displayName: string;
  url: string;
  store: string;
  price?: string;
}

export const AMAZON_TAG = "hyroxvault-20";

export const affiliateLinks: AmazonAffiliateLink[] = [
  {
    productKey: "creatine-monohydrate",
    displayName: "Creatine Monohydrate",
    url: `https://www.amazon.com/s?k=creatine+monohydrate+thorne&tag=${AMAZON_TAG}`,
    store: "Amazon",
    price: "~$22",
  },
  {
    productKey: "creatine",
    displayName: "Creatine Monohydrate",
    url: `https://www.amazon.com/s?k=creatine+monohydrate+thorne&tag=${AMAZON_TAG}`,
    store: "Amazon",
    price: "~$22",
  },
  {
    productKey: "protein-powder",
    displayName: "Whey Protein",
    url: `https://www.amazon.com/s?k=whey+protein+powder+optimum+nutrition&tag=${AMAZON_TAG}`,
    store: "Amazon",
    price: "~$45",
  },
  {
    productKey: "energy-gels",
    displayName: "Energy Gels",
    url: `https://www.amazon.com/s?k=sis+go+isotonic+energy+gel&tag=${AMAZON_TAG}`,
    store: "Amazon",
    price: "~$3/gel",
  },
  {
    productKey: "pre-workout",
    displayName: "Pre-Workout",
    url: `https://www.amazon.com/s?k=pre+workout+caffeine+tablets&tag=${AMAZON_TAG}`,
    store: "Amazon",
    price: "~$35",
  },
  {
    productKey: "electrolytes",
    displayName: "Electrolytes",
    url: `https://www.amazon.com/s?k=nuun+electrolyte+tablets&tag=${AMAZON_TAG}`,
    store: "Amazon",
    price: "~$24",
  },
  {
    productKey: "recovery",
    displayName: "Recovery (Omega-3 / Tart Cherry)",
    url: `https://www.amazon.com/s?k=nordic+naturals+ultimate+omega&tag=${AMAZON_TAG}`,
    store: "Amazon",
    price: "~$30",
  },

  // ── Gear ───────────────────────────────────────────────────────────────
  // Search-based links (no fixed ASIN) so they never 404 as models cycle and
  // always surface current sizes/colours. Prices intentionally omitted here —
  // shoe/equipment RRPs are quoted in the comparison tables, not as a single
  // figure that would go stale.
  {
    productKey: "puma-fast-r",
    displayName: "Puma Fast-R Nitro Elite",
    url: `https://www.amazon.com/s?k=puma+fast-r+nitro+elite&tag=${AMAZON_TAG}`,
    store: "Amazon",
  },
  {
    productKey: "nike-metcon-9",
    displayName: "Nike Metcon 9",
    url: `https://www.amazon.com/s?k=nike+metcon+9&tag=${AMAZON_TAG}`,
    store: "Amazon",
  },
  {
    productKey: "nobull-trainer",
    displayName: "NoBull Trainer+",
    url: `https://www.amazon.com/s?k=nobull+trainer+plus&tag=${AMAZON_TAG}`,
    store: "Amazon",
  },
  {
    productKey: "puma-deviate-nitro-3",
    displayName: "Puma Deviate Nitro 3",
    url: `https://www.amazon.com/s?k=puma+deviate+nitro+3&tag=${AMAZON_TAG}`,
    store: "Amazon",
  },
  {
    productKey: "nike-pegasus-41",
    displayName: "Nike Pegasus 41",
    url: `https://www.amazon.com/s?k=nike+pegasus+41&tag=${AMAZON_TAG}`,
    store: "Amazon",
  },
  {
    productKey: "reebok-nano-x4",
    displayName: "Reebok Nano X4",
    url: `https://www.amazon.com/s?k=reebok+nano+x4&tag=${AMAZON_TAG}`,
    store: "Amazon",
  },
  {
    productKey: "kettlebell",
    displayName: "Kettlebell",
    url: `https://www.amazon.com/s?k=competition+kettlebell+24kg&tag=${AMAZON_TAG}`,
    store: "Amazon",
  },
  {
    productKey: "dumbbell",
    displayName: "Adjustable Dumbbells",
    url: `https://www.amazon.com/s?k=adjustable+dumbbell+pair&tag=${AMAZON_TAG}`,
    store: "Amazon",
  },
  {
    productKey: "air-bike",
    displayName: "Air Bike",
    url: `https://www.amazon.com/s?k=assault+air+bike&tag=${AMAZON_TAG}`,
    store: "Amazon",
  },
  {
    productKey: "row-erg",
    displayName: "Concept2 RowErg",
    url: `https://www.amazon.com/s?k=concept2+rowerg&tag=${AMAZON_TAG}`,
    store: "Amazon",
  },
];

const DEFAULT_LINK: AmazonAffiliateLink = {
  productKey: "default",
  displayName: "Amazon",
  url: `https://www.amazon.com/?tag=${AMAZON_TAG}`,
  store: "Amazon",
};

export function getLinksForProduct(
  productKey: string
): AmazonAffiliateLink | undefined {
  return affiliateLinks.find((p) => p.productKey === productKey);
}

export function getBestLink(productKey: string): AmazonAffiliateLink {
  return getLinksForProduct(productKey) ?? DEFAULT_LINK;
}
