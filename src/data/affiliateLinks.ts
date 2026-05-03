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
