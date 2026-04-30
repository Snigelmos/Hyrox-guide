/**
 * Hyrox Gym Finder — structured gym dataset.
 *
 * Powers the interactive map at /gyms/map/, the country directory at
 * /gyms/country/[country]/, and per-gym detail pages at /gyms/g/[slug]/.
 *
 * The dataset combines six sources:
 *  - HAND_CURATED_GYMS: a hand-verified seed of marquee venues with
 *    detailed descriptions for SEO landing pages.
 *  - NORDIC_GYMS: official Hyrox affiliated training clubs in Sweden,
 *    Norway, Denmark, Finland and Iceland.
 *  - UK_GYMS: London + Manchester race-city catchment.
 *  - DE_GYMS: Berlin + Hamburg + Munich race-city catchment.
 *  - FR_GYMS: Paris race-city catchment.
 *  - US_GYMS: NYC + Miami + Dallas + LA + Chicago race-city catchment.
 *
 * Auto-generated regional modules are produced by:
 *   scripts/discover-region.mjs  (city-anchor radius queries against the
 *                                 official WPSL store_search endpoint)
 *   scripts/qa-region.mjs        (strict QA: country whitelist, bbox,
 *                                 viable-contact rule, URL HEAD validation,
 *                                 venue dedupe)
 *
 * Coordinates are venue- or neighbourhood-accurate (within ~150 m) and
 * suitable for a map overview. Exact entrances and addresses should be
 * re-checked before visiting.
 *
 * Hyrox affiliations change. Always verify on hyrox.com/find-a-hyrox-partner-gym/
 * before planning a session or trip.
 *
 * Last reviewed: 2026-04
 */

import { NORDIC_GYMS } from "./nordic-gyms.generated";
import { UK_GYMS } from "./uk-gyms.generated";
import { DE_GYMS } from "./de-gyms.generated";
import { FR_GYMS } from "./fr-gyms.generated";
import { US_GYMS } from "./us-gyms.generated";

export type Region = "EU" | "NA" | "APAC" | "ME" | "SA";

export type AffiliationType =
  | "official-training-club"
  | "chain-partner"
  | "crossfit-box"
  | "boutique";

export type Offering =
  | "hyrox-classes"
  | "hyrox-prep-block"
  | "hyrox-sim-events"
  | "open-gym"
  | "personal-training";

export interface Gym {
  slug: string;
  name: string;
  address: string;
  neighbourhood?: string;
  city: string;
  citySlug: string;
  country: string;
  countryCode: string;
  countrySlug: string;
  region: Region;
  lat: number;
  lng: number;
  website?: string;
  phone?: string;
  hyroxOfficialUrl?: string;
  affiliationType: AffiliationType;
  offerings?: Offering[];
  description?: string;
  verifiedAt: string;
}

/**
 * Hand-curated, hand-described gym records. Indexable detail pages are
 * generated only for entries with a real description (see hasIndexablePage).
 */
const HAND_CURATED_GYMS: Gym[] = [
  // ============================================================
  // UNITED KINGDOM
  // ============================================================
  {
    slug: "blok-shoreditch",
    name: "BLOK Shoreditch",
    address: "10-12 Cygnet Street, London E1 6GW, United Kingdom",
    neighbourhood: "Shoreditch",
    city: "London",
    citySlug: "london",
    country: "United Kingdom",
    countryCode: "GB",
    countrySlug: "united-kingdom",
    region: "EU",
    lat: 51.5256,
    lng: -0.0735,
    website: "https://bloklondon.com/",
    affiliationType: "boutique",
    offerings: ["hyrox-classes", "hyrox-prep-block", "open-gym"],
    description: "BLOK Shoreditch is one of London's flagship boutique fitness studios, with a full Hyrox station setup including ski erg, sled, sandbags and wall-ball targets. The Shoreditch site runs dedicated Hyrox classes alongside its strength and conditioning programming, and has hosted Hyrox simulation events ahead of the UK race calendar.",
    verifiedAt: "2026-04",
  },
  {
    slug: "blok-clapham",
    name: "BLOK Clapham",
    address: "143-145 Acre Lane, London SW2 5UA, United Kingdom",
    neighbourhood: "Clapham",
    city: "London",
    citySlug: "london",
    country: "United Kingdom",
    countryCode: "GB",
    countrySlug: "united-kingdom",
    region: "EU",
    lat: 51.4632,
    lng: -0.1190,
    website: "https://bloklondon.com/",
    affiliationType: "boutique",
    offerings: ["hyrox-classes", "open-gym"],
    description: "BLOK Clapham mirrors the Shoreditch site with a complete Hyrox station setup and dedicated Hyrox classes. The south London location is popular with runners and CrossFit-style athletes preparing for ExCeL races.",
    verifiedAt: "2026-04",
  },
  {
    slug: "1rebel-st-mary-axe",
    name: "1Rebel St Mary Axe",
    address: "63 St Mary Axe, London EC3A 8AA, United Kingdom",
    neighbourhood: "City of London",
    city: "London",
    citySlug: "london",
    country: "United Kingdom",
    countryCode: "GB",
    countrySlug: "united-kingdom",
    region: "EU",
    lat: 51.5145,
    lng: -0.0805,
    website: "https://1rebel.co.uk/",
    affiliationType: "boutique",
    offerings: ["hyrox-classes", "hyrox-sim-events"],
    description: "1Rebel's flagship City of London studio runs Hyrox-style RIDE and RESHAPE class formats and has hosted Hyrox simulation events in partnership with major UK race weekends. Premium changing facilities and central location make it a popular choice for City-based athletes.",
    verifiedAt: "2026-04",
  },
  {
    slug: "the-gym-group-london-bridge",
    name: "The Gym Group London Bridge",
    address: "Castle House, 37-45 Paul Street, London EC2A 4LS, United Kingdom",
    neighbourhood: "London Bridge",
    city: "London",
    citySlug: "london",
    country: "United Kingdom",
    countryCode: "GB",
    countrySlug: "united-kingdom",
    region: "EU",
    lat: 51.5051,
    lng: -0.0884,
    website: "https://www.thegymgroup.com/gym-classes/cardio-classes/hyrox/",
    affiliationType: "chain-partner",
    offerings: ["hyrox-classes", "open-gym"],
    description: "The Gym Group is the official UK Hyrox training partner. Branded Hyrox classes, equipment and programming are available across most central London branches. The London Bridge site is one of the busiest and runs Hyrox classes throughout the week, plus 24/7 open-gym access.",
    verifiedAt: "2026-04",
  },
  {
    slug: "the-gym-group-manchester-deansgate",
    name: "The Gym Group Manchester Deansgate",
    address: "Deansgate, Manchester M3 4LY, United Kingdom",
    neighbourhood: "Deansgate",
    city: "Manchester",
    citySlug: "manchester",
    country: "United Kingdom",
    countryCode: "GB",
    countrySlug: "united-kingdom",
    region: "EU",
    lat: 53.4798,
    lng: -2.2491,
    website: "https://www.thegymgroup.com/gym-classes/cardio-classes/hyrox/",
    affiliationType: "chain-partner",
    offerings: ["hyrox-classes", "open-gym"],
    description: "The Gym Group's Deansgate branch runs the official UK Hyrox class format with full station equipment. Central Manchester location with 24/7 open-gym access for self-led Hyrox simulation work.",
    verifiedAt: "2026-04",
  },

  // ============================================================
  // GERMANY
  // ============================================================
  {
    slug: "john-reed-berlin-hackescher-markt",
    name: "John Reed Berlin Hackescher Markt",
    address: "Rosenthaler Straße 51, 10178 Berlin, Germany",
    neighbourhood: "Mitte",
    city: "Berlin",
    citySlug: "berlin",
    country: "Germany",
    countryCode: "DE",
    countrySlug: "germany",
    region: "EU",
    lat: 52.5247,
    lng: 13.4015,
    website: "https://johnreed.fitness/",
    affiliationType: "chain-partner",
    offerings: ["hyrox-classes", "open-gym"],
    description: "John Reed's central Berlin Mitte location is a music-driven big-box gym with Hyrox station equipment and weekly Hyrox-style class formats. Open seven days, popular with central Berlin athletes preparing for the Tempelhof event.",
    verifiedAt: "2026-04",
  },
  {
    slug: "mcfit-berlin-friedrichstrasse",
    name: "McFit Berlin Friedrichstraße",
    address: "Friedrichstraße 67, 10117 Berlin, Germany",
    neighbourhood: "Mitte",
    city: "Berlin",
    citySlug: "berlin",
    country: "Germany",
    countryCode: "DE",
    countrySlug: "germany",
    region: "EU",
    lat: 52.5191,
    lng: 13.3884,
    website: "https://www.mcfit.com/",
    affiliationType: "chain-partner",
    offerings: ["open-gym"],
    description: "McFit's Friedrichstraße site is one of the largest McFit branches in central Berlin and includes Hyrox station equipment (sled track, ski erg, rowers, sandbags). Open 24/7 with single-membership access to all McFit locations across the DACH region.",
    verifiedAt: "2026-04",
  },
  {
    slug: "fitness-first-hamburg-moenckebergstrasse",
    name: "Fitness First Hamburg Mönckebergstraße",
    address: "Mönckebergstraße 11, 20095 Hamburg, Germany",
    neighbourhood: "Altstadt",
    city: "Hamburg",
    citySlug: "hamburg",
    country: "Germany",
    countryCode: "DE",
    countrySlug: "germany",
    region: "EU",
    lat: 53.5510,
    lng: 10.0014,
    website: "https://www.fitnessfirst.de/",
    affiliationType: "chain-partner",
    offerings: ["hyrox-classes", "open-gym"],
    description: "Fitness First's Mönckebergstraße flagship is in the heart of Hamburg's Altstadt — Hyrox's founding city. Branded Hyrox classes, full station equipment and a strong community of athletes preparing for the annual Hamburg Messe race in October/November.",
    verifiedAt: "2026-04",
  },
  {
    slug: "body-and-soul-munich-bogenhausen",
    name: "Body & Soul Munich Bogenhausen",
    address: "Einsteinstraße 172, 81677 München, Germany",
    neighbourhood: "Bogenhausen",
    city: "Munich",
    citySlug: "munich",
    country: "Germany",
    countryCode: "DE",
    countrySlug: "germany",
    region: "EU",
    lat: 48.1410,
    lng: 11.6147,
    website: "https://www.bodyandsoul.de/",
    affiliationType: "chain-partner",
    offerings: ["hyrox-classes", "personal-training"],
    description: "Body & Soul is a premium Munich health-club chain with multi-floor facilities and dedicated Hyrox programming at the Bogenhausen site. Strong personal-training and class-led culture, popular with athletes building toward the autumn Hyrox calendar.",
    verifiedAt: "2026-04",
  },

  // ============================================================
  // FRANCE
  // ============================================================
  {
    slug: "klay-saint-sulpice",
    name: "Klay Saint-Sulpice",
    address: "4bis Rue Saint-Sulpice, 75006 Paris, France",
    neighbourhood: "Saint-Germain",
    city: "Paris",
    citySlug: "paris",
    country: "France",
    countryCode: "FR",
    countrySlug: "france",
    region: "EU",
    lat: 48.8523,
    lng: 2.3331,
    website: "https://www.klay.fr/",
    affiliationType: "boutique",
    offerings: ["hyrox-classes", "personal-training", "open-gym"],
    description: "Klay's Saint-Sulpice club is a premium Left-Bank Paris fitness destination with sled lanes, ski ergs, rowers and a dedicated functional training floor. Hyrox-style class formats run weekly and the club is popular with central-Paris professionals preparing for Hyrox France events.",
    verifiedAt: "2026-04",
  },
  {
    slug: "episod-saint-germain",
    name: "Episod Saint-Germain",
    address: "32 Rue Mazarine, 75006 Paris, France",
    neighbourhood: "Saint-Germain",
    city: "Paris",
    citySlug: "paris",
    country: "France",
    countryCode: "FR",
    countrySlug: "france",
    region: "EU",
    lat: 48.8543,
    lng: 2.3380,
    website: "https://www.episod.com/",
    affiliationType: "boutique",
    offerings: ["hyrox-classes", "hyrox-sim-events"],
    description: "Episod is a Paris boutique studio chain with multiple sites running Hyrox simulation classes. The Saint-Germain studio focuses on functional fitness formats that map closely to the Hyrox station list and runs full sim sessions in the weeks before Paris Expo races.",
    verifiedAt: "2026-04",
  },

  // ============================================================
  // SPAIN
  // ============================================================
  {
    slug: "brooklyn-fitboxing-madrid-centro",
    name: "Brooklyn Fitboxing Madrid Centro",
    address: "Calle de Atocha 27, 28012 Madrid, Spain",
    neighbourhood: "Centro",
    city: "Madrid",
    citySlug: "madrid",
    country: "Spain",
    countryCode: "ES",
    countrySlug: "spain",
    region: "EU",
    lat: 40.4138,
    lng: -3.7008,
    website: "https://www.brooklynfitboxing.com/",
    affiliationType: "chain-partner",
    offerings: ["hyrox-classes"],
    description: "Brooklyn Fitboxing's Madrid Centro studio runs HIIT-style class formats that incorporate Hyrox station work — sled, sandbag, wall-ball and ski erg blocks. Walkable from Sol and Atocha, popular with central Madrid commuters in race-prep blocks.",
    verifiedAt: "2026-04",
  },
  {
    slug: "crossfit-eixample",
    name: "CrossFit Eixample",
    address: "Carrer del Consell de Cent 159, 08015 Barcelona, Spain",
    neighbourhood: "Eixample",
    city: "Barcelona",
    citySlug: "barcelona",
    country: "Spain",
    countryCode: "ES",
    countrySlug: "spain",
    region: "EU",
    lat: 41.3819,
    lng: 2.1505,
    website: "https://crossfiteixample.com/",
    affiliationType: "crossfit-box",
    offerings: ["hyrox-prep-block", "hyrox-sim-events", "open-gym"],
    description: "CrossFit Eixample runs dedicated Hyrox prep blocks ahead of the Spanish race calendar, with monthly simulation sessions covering all eight stations. Strong endurance-leaning programming and an active community of Spanish age-group athletes.",
    verifiedAt: "2026-04",
  },

  // ============================================================
  // SWEDEN
  // ============================================================
  {
    slug: "sats-stockholm-sturegallerian",
    name: "SATS Stockholm Sturegallerian",
    address: "Stureplan 4, 114 35 Stockholm, Sweden",
    neighbourhood: "Östermalm",
    city: "Stockholm",
    citySlug: "stockholm",
    country: "Sweden",
    countryCode: "SE",
    countrySlug: "sweden",
    region: "EU",
    lat: 59.3358,
    lng: 18.0731,
    website: "https://www.sats.se/",
    affiliationType: "chain-partner",
    offerings: ["hyrox-classes", "personal-training", "open-gym"],
    description: "SATS Sturegallerian is a flagship central Stockholm club with full Hyrox station equipment and a fast-growing Hyrox community ahead of the 2026 World Championship in Stockholm. Branded Hyrox class formats and dedicated PTs available.",
    verifiedAt: "2026-04",
  },

  // ============================================================
  // UNITED STATES
  // ============================================================
  {
    slug: "equinox-tribeca",
    name: "Equinox Tribeca",
    address: "54 Murray Street, New York, NY 10007, United States",
    neighbourhood: "Tribeca",
    city: "New York",
    citySlug: "new-york",
    country: "United States",
    countryCode: "US",
    countrySlug: "united-states",
    region: "NA",
    lat: 40.7146,
    lng: -74.0098,
    website: "https://www.equinox.com/clubs/new-york/tribeca",
    affiliationType: "chain-partner",
    offerings: ["hyrox-classes", "personal-training", "open-gym"],
    description: "Equinox Tribeca is one of NYC's premium fitness clubs with sled lanes, ski ergs, rowers and weekly Hyrox-style class formats. The club's strong PT culture supports tailored Hyrox prep blocks ahead of US race weekends.",
    verifiedAt: "2026-04",
  },
  {
    slug: "crossfit-nyc",
    name: "CrossFit NYC — The Black Box",
    address: "162 W 56th Street, New York, NY 10019, United States",
    neighbourhood: "Midtown West",
    city: "New York",
    citySlug: "new-york",
    country: "United States",
    countryCode: "US",
    countrySlug: "united-states",
    region: "NA",
    lat: 40.7659,
    lng: -73.9810,
    website: "https://www.crossfitnyc.com/",
    affiliationType: "crossfit-box",
    offerings: ["hyrox-prep-block", "hyrox-sim-events", "open-gym"],
    description: "CrossFit NYC is the largest CrossFit affiliate in the city, with multiple locations and a dedicated Hyrox simulation programme. Monthly Hyrox sim sessions and structured 8-week prep blocks ahead of NYC and Americas Regional events.",
    verifiedAt: "2026-04",
  },
  {
    slug: "equinox-west-hollywood",
    name: "Equinox West Hollywood",
    address: "8590 Sunset Boulevard, West Hollywood, CA 90069, United States",
    neighbourhood: "West Hollywood",
    city: "Los Angeles",
    citySlug: "los-angeles",
    country: "United States",
    countryCode: "US",
    countrySlug: "united-states",
    region: "NA",
    lat: 34.0900,
    lng: -118.3852,
    website: "https://www.equinox.com/clubs/california/westhollywood",
    affiliationType: "chain-partner",
    offerings: ["hyrox-classes", "personal-training", "open-gym"],
    description: "Equinox West Hollywood runs functional-fitness class formats that map closely to Hyrox stations and is one of LA's busiest celebrity-frequented clubs. Sled lanes, ski ergs and dedicated PTs supporting Hyrox prep blocks.",
    verifiedAt: "2026-04",
  },
  {
    slug: "f45-venice",
    name: "F45 Training Venice",
    address: "1633 Lincoln Boulevard, Venice, CA 90291, United States",
    neighbourhood: "Venice",
    city: "Los Angeles",
    citySlug: "los-angeles",
    country: "United States",
    countryCode: "US",
    countrySlug: "united-states",
    region: "NA",
    lat: 33.9914,
    lng: -118.4695,
    website: "https://f45training.com/",
    affiliationType: "chain-partner",
    offerings: ["hyrox-classes"],
    description: "F45 Venice runs functional-fitness HIIT class formats that align closely with the Hyrox station list — sandbag carries, sled work, wall balls and ski erg blocks. Popular with West LA Hyrox first-timers building base fitness.",
    verifiedAt: "2026-04",
  },
  {
    slug: "equinox-lincoln-park",
    name: "Equinox Lincoln Park",
    address: "1750 N Clark Street, Chicago, IL 60614, United States",
    neighbourhood: "Lincoln Park",
    city: "Chicago",
    citySlug: "chicago",
    country: "United States",
    countryCode: "US",
    countrySlug: "united-states",
    region: "NA",
    lat: 41.9136,
    lng: -87.6348,
    website: "https://www.equinox.com/clubs/illinois/lincolnpark",
    affiliationType: "chain-partner",
    offerings: ["hyrox-classes", "personal-training", "open-gym"],
    description: "Equinox Lincoln Park is one of Chicago's flagship clubs with a large functional-training floor and weekly Hyrox-style class formats. Strong age-group athlete community building toward the McCormick Place race.",
    verifiedAt: "2026-04",
  },
  {
    slug: "anatomy-miami-beach",
    name: "Anatomy Miami Beach",
    address: "1422 Alton Road, Miami Beach, FL 33139, United States",
    neighbourhood: "South Beach",
    city: "Miami",
    citySlug: "miami",
    country: "United States",
    countryCode: "US",
    countrySlug: "united-states",
    region: "NA",
    lat: 25.7873,
    lng: -80.1379,
    website: "https://anatomy.com/",
    affiliationType: "boutique",
    offerings: ["hyrox-classes", "personal-training", "open-gym"],
    description: "Anatomy is a premium Miami Beach fitness club with full Hyrox station equipment and dedicated programming. South Beach location, popular with Florida-based age-group athletes and visiting international competitors.",
    verifiedAt: "2026-04",
  },

  // ============================================================
  // AUSTRALIA
  // ============================================================
  {
    slug: "fitness-first-bondi",
    name: "Fitness First Platinum Bondi",
    address: "Westfield Bondi Junction, 500 Oxford Street, Bondi Junction, NSW 2022, Australia",
    neighbourhood: "Bondi Junction",
    city: "Sydney",
    citySlug: "sydney",
    country: "Australia",
    countryCode: "AU",
    countrySlug: "australia",
    region: "APAC",
    lat: -33.8915,
    lng: 151.2502,
    website: "https://www.fitnessfirst.com.au/",
    affiliationType: "chain-partner",
    offerings: ["hyrox-classes", "personal-training", "open-gym"],
    description: "Fitness First Platinum Bondi is one of Sydney's flagship clubs with sled lanes, ski ergs and weekly Hyrox-style class formats. Strong eastern-suburbs athlete community preparing for Sydney and APAC Regional events.",
    verifiedAt: "2026-04",
  },
  {
    slug: "fitness-first-melbourne-cbd",
    name: "Fitness First Melbourne Bourke Street",
    address: "300 Bourke Street, Melbourne, VIC 3000, Australia",
    neighbourhood: "CBD",
    city: "Melbourne",
    citySlug: "melbourne",
    country: "Australia",
    countryCode: "AU",
    countrySlug: "australia",
    region: "APAC",
    lat: -37.8136,
    lng: 144.9650,
    website: "https://www.fitnessfirst.com.au/",
    affiliationType: "chain-partner",
    offerings: ["hyrox-classes", "open-gym"],
    description: "Fitness First Bourke Street is a central Melbourne CBD club with full Hyrox station equipment and weekly classes. Walkable from Melbourne Central station, popular with CBD professionals.",
    verifiedAt: "2026-04",
  },
  {
    slug: "fitness-first-brisbane-cbd",
    name: "Fitness First Brisbane CBD",
    address: "61 Mary Street, Brisbane, QLD 4000, Australia",
    neighbourhood: "CBD",
    city: "Brisbane",
    citySlug: "brisbane",
    country: "Australia",
    countryCode: "AU",
    countrySlug: "australia",
    region: "APAC",
    lat: -27.4715,
    lng: 153.0263,
    website: "https://www.fitnessfirst.com.au/",
    affiliationType: "chain-partner",
    offerings: ["hyrox-classes", "open-gym"],
    description: "Fitness First Brisbane CBD is one of the closest premium clubs to the Brisbane Convention Centre — host of the APAC Regional Championships. Branded Hyrox classes and a strong pre-event training community.",
    verifiedAt: "2026-04",
  },

];

/**
 * Full gym dataset — hand-curated marquee venues plus all auto-generated
 * regional modules. Earlier sources win on slug collisions: hand-curated
 * always wins, then Nordic, UK, DE, FR, US in that order.
 */
function dedupeBySlug(...lists: Gym[][]): Gym[] {
  const seen = new Set<string>();
  const out: Gym[] = [];
  for (const list of lists) {
    for (const g of list) {
      if (seen.has(g.slug)) continue;
      seen.add(g.slug);
      out.push(g);
    }
  }
  return out;
}

const MIN_PUBLIC_COUNTRY_GYMS = 2;

const ALL_GYMS: Gym[] = dedupeBySlug(
  HAND_CURATED_GYMS,
  NORDIC_GYMS,
  UK_GYMS,
  DE_GYMS,
  FR_GYMS,
  US_GYMS,
);

const countryGymCounts = ALL_GYMS.reduce<Map<string, number>>((acc, gym) => {
  acc.set(gym.countrySlug, (acc.get(gym.countrySlug) ?? 0) + 1);
  return acc;
}, new Map());

export const GYMS: Gym[] = ALL_GYMS.filter(
  (gym) => (countryGymCounts.get(gym.countrySlug) ?? 0) >= MIN_PUBLIC_COUNTRY_GYMS,
);

// ----------------------------------------------------------------
// Derived helpers
// ----------------------------------------------------------------

export interface CountryGroup {
  countryCode: string;
  country: string;
  countrySlug: string;
  region: Region;
  gyms: Gym[];
  cities: string[];
}

export function getGymBySlug(slug: string): Gym | undefined {
  return GYMS.find((g) => g.slug === slug);
}

export function getGymsByCity(citySlug: string): Gym[] {
  return GYMS.filter((g) => g.citySlug === citySlug);
}

export function getGymsByCountry(countrySlug: string): Gym[] {
  return GYMS.filter((g) => g.countrySlug === countrySlug);
}

export function listCountries(): CountryGroup[] {
  const map = new Map<string, CountryGroup>();
  for (const g of GYMS) {
    const existing = map.get(g.countrySlug);
    if (existing) {
      existing.gyms.push(g);
      if (!existing.cities.includes(g.city)) existing.cities.push(g.city);
    } else {
      map.set(g.countrySlug, {
        countryCode: g.countryCode,
        country: g.country,
        countrySlug: g.countrySlug,
        region: g.region,
        gyms: [g],
        cities: [g.city],
      });
    }
  }
  return Array.from(map.values())
    .filter((c) => c.gyms.length >= MIN_PUBLIC_COUNTRY_GYMS)
    .sort((a, b) => a.country.localeCompare(b.country));
}

export function listCities(): {
  citySlug: string;
  city: string;
  country: string;
  countryCode: string;
  countrySlug: string;
  count: number;
}[] {
  const map = new Map<string, {
    citySlug: string;
    city: string;
    country: string;
    countryCode: string;
    countrySlug: string;
    count: number;
  }>();
  for (const g of GYMS) {
    const existing = map.get(g.citySlug);
    if (existing) {
      existing.count += 1;
    } else {
      map.set(g.citySlug, {
        citySlug: g.citySlug,
        city: g.city,
        country: g.country,
        countryCode: g.countryCode,
        countrySlug: g.countrySlug,
        count: 1,
      });
    }
  }
  return Array.from(map.values()).sort((a, b) => a.city.localeCompare(b.city));
}

/**
 * Haversine distance in kilometres between two points.
 */
export function haversineKm(a: { lat: number; lng: number }, b: { lat: number; lng: number }): number {
  const R = 6371;
  const toRad = (deg: number) => (deg * Math.PI) / 180;
  const dLat = toRad(b.lat - a.lat);
  const dLng = toRad(b.lng - a.lng);
  const lat1 = toRad(a.lat);
  const lat2 = toRad(b.lat);
  const h =
    Math.sin(dLat / 2) ** 2 +
    Math.cos(lat1) * Math.cos(lat2) * Math.sin(dLng / 2) ** 2;
  return 2 * R * Math.asin(Math.sqrt(h));
}

export function getNearbyGyms(slug: string, radiusKm = 25, limit = 5): Gym[] {
  const target = getGymBySlug(slug);
  if (!target) return [];
  return GYMS.filter((g) => g.slug !== slug)
    .map((g) => ({ gym: g, dist: haversineKm(target, g) }))
    .filter((x) => x.dist <= radiusKm)
    .sort((a, b) => a.dist - b.dist)
    .slice(0, limit)
    .map((x) => x.gym);
}

export const AFFILIATION_LABELS: Record<AffiliationType, string> = {
  "official-training-club": "Official Hyrox Training Club",
  "chain-partner": "Chain partner",
  "crossfit-box": "CrossFit box",
  "boutique": "Boutique studio",
};

export const OFFERING_LABELS: Record<Offering, string> = {
  "hyrox-classes": "Hyrox classes",
  "hyrox-prep-block": "Hyrox prep blocks",
  "hyrox-sim-events": "Hyrox sim events",
  "open-gym": "Open-gym access",
  "personal-training": "Personal training",
};

/**
 * Whether a gym record has enough data to merit an indexable detail page.
 * Pages with either a real description (60+ chars) or a verified website
 * URL are indexable. Bare-bones records (no website, no description) ship
 * noindex to avoid thin-content penalties.
 */
export function hasIndexablePage(g: Gym): boolean {
  if (g.description && g.description.length >= 60) return true;
  if (g.website) return true;
  return false;
}
