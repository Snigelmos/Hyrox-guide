import type { GeoRegion } from "../hooks/useGeoCountry";

export interface RegionalLink {
  region: GeoRegion;
  url: string;
  store: string;
  price?: string;
  note?: string; // e.g. "Join Adrecord to activate"
}

export interface ProductRegionalLinks {
  productKey: string;
  displayName: string;
  links: RegionalLink[];
}

// ─── AFFILIATE PROGRAM NOTES ──────────────────────────────────────────────────
// SE/NO/DK/FI  → Sign up at adrecord.com (free, Swedish network — covers Gymgrossisten, Proteinbolaget, Bodylab)
// DE/AT/CH     → Sign up at awin.com (covers Myprotein DE, Foodspring)
// GB           → Sign up at awin.com (covers Myprotein UK, Bulk.com)
// US/CA        → Amazon Associates (associates.amazon.com) + impact.com (iHerb)
// AU/NZ        → iHerb affiliate (iherb.com/info/affiliate) + Myprotein AU
// default      → iHerb ships globally, fallback for all unlisted countries
// ─────────────────────────────────────────────────────────────────────────────

export const affiliateLinks: ProductRegionalLinks[] = [
  {
    productKey: "creatine-monohydrate",
    displayName: "Creatine Monohydrate",
    links: [
      { region: "SE", url: "https://www.gymgrossisten.com/kosttillskott/kreatin", store: "Gymgrossisten", price: "~149 kr", note: "Via Adrecord" },
      { region: "NO", url: "https://www.gymgrossisten.com/kosttillskott/kreatin", store: "Gymgrossisten NO", price: "~149 kr", note: "Via Adrecord" },
      { region: "DK", url: "https://www.bodylab.dk/shop/kreatin-monohydrat-593p.html", store: "Bodylab DK", price: "~129 kr", note: "Via Adrecord" },
      { region: "FI", url: "https://www.myprotein.com/fi/sports-nutrition/creatine-monohydrate-powder/10852407.html", store: "Myprotein FI", price: "~14 €", note: "Via AWIN" },
      { region: "DE", url: "https://www.myprotein.com/de/sports-nutrition/creatine-monohydrate-powder/10852407.html", store: "Myprotein DE", price: "~14 €", note: "Via AWIN" },
      { region: "GB", url: "https://www.myprotein.com/sports-nutrition/creatine-monohydrate-powder/10852407.html", store: "Myprotein UK", price: "~£11", note: "Via AWIN" },
      { region: "US", url: "https://www.amazon.com/s?k=creatine+monohydrate+thorne", store: "Amazon US", price: "~$22", note: "Amazon Associates" },
      { region: "AU", url: "https://www.iherb.com/c/creatine", store: "iHerb AU", price: "~A$25", note: "iHerb Affiliate" },
      { region: "default", url: "https://www.iherb.com/c/creatine", store: "iHerb", price: "Ships worldwide", note: "iHerb Affiliate" },
    ],
  },
  {
    productKey: "protein-powder",
    displayName: "Whey Protein",
    links: [
      { region: "SE", url: "https://www.gymgrossisten.com/kosttillskott/protein/vassleprotein", store: "Gymgrossisten", price: "~399 kr", note: "Via Adrecord" },
      { region: "NO", url: "https://www.gymgrossisten.com/kosttillskott/protein/vassleprotein", store: "Gymgrossisten NO", price: "~399 kr", note: "Via Adrecord" },
      { region: "DK", url: "https://www.bodylab.dk/shop/whey-100-454p.html", store: "Bodylab DK", price: "~249 kr", note: "Via Adrecord" },
      { region: "FI", url: "https://www.myprotein.com/fi/sports-nutrition/impact-whey-protein/10530943.html", store: "Myprotein FI", price: "~30 €", note: "Via AWIN" },
      { region: "DE", url: "https://www.myprotein.com/de/sports-nutrition/impact-whey-protein/10530943.html", store: "Myprotein DE", price: "~30 €", note: "Via AWIN" },
      { region: "GB", url: "https://www.myprotein.com/sports-nutrition/impact-whey-protein/10530943.html", store: "Myprotein UK", price: "~£25", note: "Via AWIN" },
      { region: "US", url: "https://www.amazon.com/s?k=whey+protein+powder+optimum+nutrition", store: "Amazon US", price: "~$45", note: "Amazon Associates" },
      { region: "AU", url: "https://www.iherb.com/c/whey-protein", store: "iHerb AU", price: "~A$50", note: "iHerb Affiliate" },
      { region: "default", url: "https://www.iherb.com/c/whey-protein", store: "iHerb", price: "Ships worldwide", note: "iHerb Affiliate" },
    ],
  },
  {
    productKey: "energy-gels",
    displayName: "Energy Gels",
    links: [
      { region: "SE", url: "https://www.gymgrossisten.com/kosttillskott/energi/energigel", store: "Gymgrossisten", price: "~25 kr/gel", note: "Via Adrecord" },
      { region: "NO", url: "https://www.gymgrossisten.com/kosttillskott/energi/energigel", store: "Gymgrossisten NO", price: "~25 kr/gel", note: "Via Adrecord" },
      { region: "DK", url: "https://www.intersport.dk/search?q=energy+gel", store: "Intersport DK", price: "~20 kr/gel", note: "Via Adrecord" },
      { region: "FI", url: "https://www.myprotein.com/fi/endurance-and-triathlon/energy-gels/13903827.html", store: "Myprotein FI", price: "~2 €/gel", note: "Via AWIN" },
      { region: "DE", url: "https://www.foodspring.de/energie-gel", store: "Foodspring DE", price: "~2 €/gel", note: "Via AWIN" },
      { region: "GB", url: "https://www.scienceinsport.com/sports-nutrition/sis-go/sis-go-energy-gel/", store: "SiS UK", price: "~£1.50/gel", note: "Via AWIN" },
      { region: "US", url: "https://www.amazon.com/s?k=maurten+energy+gel+hyrox", store: "Amazon US", price: "~$3/gel", note: "Amazon Associates" },
      { region: "AU", url: "https://www.iherb.com/c/energy-gels", store: "iHerb AU", price: "~A$3/gel", note: "iHerb Affiliate" },
      { region: "default", url: "https://www.iherb.com/c/energy-gels", store: "iHerb", price: "Ships worldwide", note: "iHerb Affiliate" },
    ],
  },
  {
    productKey: "pre-workout",
    displayName: "Pre-Workout",
    links: [
      { region: "SE", url: "https://www.gymgrossisten.com/kosttillskott/pre-workout", store: "Gymgrossisten", price: "~299 kr", note: "Via Adrecord" },
      { region: "NO", url: "https://www.gymgrossisten.com/kosttillskott/pre-workout", store: "Gymgrossisten NO", price: "~299 kr", note: "Via Adrecord" },
      { region: "DK", url: "https://www.bodylab.dk/shop/preworkout-1000p.html", store: "Bodylab DK", price: "~199 kr", note: "Via Adrecord" },
      { region: "FI", url: "https://www.myprotein.com/fi/sports-nutrition/the-pre-workout/11283165.html", store: "Myprotein FI", price: "~25 €", note: "Via AWIN" },
      { region: "DE", url: "https://www.myprotein.com/de/sports-nutrition/the-pre-workout/11283165.html", store: "Myprotein DE", price: "~25 €", note: "Via AWIN" },
      { region: "GB", url: "https://www.myprotein.com/sports-nutrition/the-pre-workout/11283165.html", store: "Myprotein UK", price: "~£20", note: "Via AWIN" },
      { region: "US", url: "https://www.amazon.com/s?k=pre+workout+supplement+hyrox", store: "Amazon US", price: "~$35", note: "Amazon Associates" },
      { region: "AU", url: "https://www.iherb.com/c/pre-workout", store: "iHerb AU", price: "~A$40", note: "iHerb Affiliate" },
      { region: "default", url: "https://www.iherb.com/c/pre-workout", store: "iHerb", price: "Ships worldwide", note: "iHerb Affiliate" },
    ],
  },
  {
    productKey: "electrolytes",
    displayName: "Electrolytes",
    links: [
      { region: "SE", url: "https://www.gymgrossisten.com/kosttillskott/elektrolyter", store: "Gymgrossisten", price: "~199 kr", note: "Via Adrecord" },
      { region: "NO", url: "https://www.gymgrossisten.com/kosttillskott/elektrolyter", store: "Gymgrossisten NO", price: "~199 kr", note: "Via Adrecord" },
      { region: "DK", url: "https://www.bodylab.dk/shop/elektrolytter-1000p.html", store: "Bodylab DK", price: "~149 kr", note: "Via Adrecord" },
      { region: "FI", url: "https://www.iherb.com/c/electrolytes", store: "iHerb FI", price: "~15 €", note: "iHerb Affiliate" },
      { region: "DE", url: "https://www.iherb.com/c/electrolytes", store: "iHerb DE", price: "~15 €", note: "iHerb Affiliate" },
      { region: "GB", url: "https://www.amazon.co.uk/s?k=electrolyte+tablets+nuun", store: "Amazon UK", price: "~£12", note: "Amazon Associates UK" },
      { region: "US", url: "https://www.amazon.com/s?k=nuun+electrolyte+tablets", store: "Amazon US", price: "~$24", note: "Amazon Associates" },
      { region: "AU", url: "https://www.iherb.com/c/electrolytes", store: "iHerb AU", price: "~A$25", note: "iHerb Affiliate" },
      { region: "default", url: "https://www.iherb.com/c/electrolytes", store: "iHerb", price: "Ships worldwide", note: "iHerb Affiliate" },
    ],
  },
  {
    productKey: "recovery",
    displayName: "Recovery (Omega-3 / Tart Cherry)",
    links: [
      { region: "SE", url: "https://www.gymgrossisten.com/kosttillskott/omega-3", store: "Gymgrossisten", price: "~199 kr", note: "Via Adrecord" },
      { region: "NO", url: "https://www.gymgrossisten.com/kosttillskott/omega-3", store: "Gymgrossisten NO", price: "~199 kr", note: "Via Adrecord" },
      { region: "DK", url: "https://www.iherb.com/c/fish-oil-omega-3", store: "iHerb DK", price: "~14 €", note: "iHerb Affiliate" },
      { region: "FI", url: "https://www.iherb.com/c/fish-oil-omega-3", store: "iHerb FI", price: "~14 €", note: "iHerb Affiliate" },
      { region: "DE", url: "https://www.iherb.com/c/fish-oil-omega-3", store: "iHerb DE", price: "~14 €", note: "iHerb Affiliate" },
      { region: "GB", url: "https://www.amazon.co.uk/s?k=omega+3+fish+oil+sports", store: "Amazon UK", price: "~£12", note: "Amazon Associates UK" },
      { region: "US", url: "https://www.amazon.com/s?k=omega+3+fish+oil+nordic+naturals", store: "Amazon US", price: "~$25", note: "Amazon Associates" },
      { region: "AU", url: "https://www.iherb.com/c/fish-oil-omega-3", store: "iHerb AU", price: "~A$28", note: "iHerb Affiliate" },
      { region: "default", url: "https://www.iherb.com/c/fish-oil-omega-3", store: "iHerb", price: "Ships worldwide", note: "iHerb Affiliate" },
    ],
  },
];

export function getLinksForProduct(productKey: string): ProductRegionalLinks | undefined {
  return affiliateLinks.find((p) => p.productKey === productKey);
}

export function getBestLink(productKey: string, region: GeoRegion): RegionalLink {
  const product = getLinksForProduct(productKey);
  if (!product) {
    return { region: "default", url: "https://www.iherb.com", store: "iHerb", price: "Ships worldwide" };
  }
  return (
    product.links.find((l) => l.region === region) ??
    product.links.find((l) => l.region === "default") ??
    product.links[0]
  );
}
