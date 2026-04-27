/**
 * Hyrox-affiliated training clubs and gyms by city.
 *
 * Curated list of publicly-listed Hyrox training clubs, partner chains, and
 * notable boxes/studios known to run Hyrox-specific programming. List is
 * directional — always verify on hyrox.com/affiliated-training-clubs/ before
 * planning a visit.
 *
 * Last reviewed: 2026-04
 */

export interface AffiliatedGym {
  name: string;
  neighbourhood?: string;
  url?: string;
  notes?: string;
}

export interface CityGymGroup {
  citySlug: string;
  city: string;
  country: string;
  countryCode: string;
  region: "EU" | "NA" | "APAC" | "ME" | "SA";
  description: string;
  nearestEventCitySlug?: string;
  gyms: AffiliatedGym[];
}

export const CITY_GYMS: CityGymGroup[] = [
  {
    citySlug: "london",
    city: "London",
    country: "United Kingdom",
    countryCode: "GB",
    region: "EU",
    description: "London hosts the EMEA Regional Championships and is one of the most active Hyrox training cities globally. The Gym Group operates 130+ branded UK locations with Hyrox programming, alongside dozens of independent affiliated boxes across central, south, and east London.",
    nearestEventCitySlug: "london",
    gyms: [
      { name: "The Gym Group (multiple branches)", url: "https://www.thegymgroup.com/gym-classes/cardio-classes/hyrox/", notes: "Official UK Hyrox training partner across 130+ locations. Branded Hyrox programming and equipment available." },
      { name: "BLOK", neighbourhood: "Shoreditch / Clapham", notes: "Boutique with full Hyrox station setup and dedicated Hyrox classes." },
      { name: "1Rebel", neighbourhood: "Multiple central London", notes: "Some locations run Hyrox simulation classes." },
      { name: "F45 Hyrox-affiliated studios", notes: "Several London F45 studios run Hyrox prep blocks ahead of major UK events." },
      { name: "Independent CrossFit boxes", notes: "Many CrossFit boxes (CrossFit Putney, CrossFit Central London, CrossFit Borough) host Hyrox sim sessions." },
    ],
  },
  {
    citySlug: "manchester",
    city: "Manchester",
    country: "United Kingdom",
    countryCode: "GB",
    region: "EU",
    description: "Manchester has a fast-growing Hyrox community, with The Gym Group locations across Greater Manchester offering Hyrox programming and several independent boxes preparing athletes for UK events.",
    nearestEventCitySlug: "manchester",
    gyms: [
      { name: "The Gym Group Manchester branches", url: "https://www.thegymgroup.com/gym-classes/cardio-classes/hyrox/" },
      { name: "Independent CrossFit boxes", notes: "CrossFit Manchester and others host Hyrox prep classes." },
    ],
  },
  {
    citySlug: "berlin",
    city: "Berlin",
    country: "Germany",
    countryCode: "DE",
    region: "EU",
    description: "Berlin is a major Hyrox event city with a deep training community. McFit and Fitness First chains have Hyrox-equipped locations across the city, and dedicated Hyrox boxes have emerged in Mitte and Kreuzberg.",
    nearestEventCitySlug: "berlin",
    gyms: [
      { name: "McFit (multiple branches)", notes: "Several Berlin McFit locations include Hyrox station equipment." },
      { name: "Fitness First Berlin", notes: "Major chain with Hyrox-affiliated programming at select branches." },
      { name: "Local Hyrox-specific boxes", notes: "Boutique Hyrox training studios have opened in Mitte and Kreuzberg as the sport has grown." },
    ],
  },
  {
    citySlug: "hamburg",
    city: "Hamburg",
    country: "Germany",
    countryCode: "DE",
    region: "EU",
    description: "Hamburg, where Hyrox was founded in 2017, has the deepest training club density in Germany. Multiple branded Hyrox training clubs operate within the city.",
    nearestEventCitySlug: "hamburg",
    gyms: [
      { name: "Hyrox Training Hub Hamburg", notes: "Founder city — multiple branded Hyrox training partners." },
      { name: "Fitness First Hamburg", notes: "Major chain with Hyrox programming." },
      { name: "Local CrossFit boxes", notes: "CrossFit boxes throughout Hamburg run Hyrox prep classes." },
    ],
  },
  {
    citySlug: "munich",
    city: "Munich",
    country: "Germany",
    countryCode: "DE",
    region: "EU",
    description: "Munich has a strong Hyrox presence with multiple training partners across the city and a growing pre-event training scene around the autumn race calendar.",
    gyms: [
      { name: "Fitness First Munich", notes: "Hyrox-affiliated programming at select branches." },
      { name: "Boutique Hyrox studios", notes: "Multiple boutique Hyrox training studios have opened in Munich since 2023." },
    ],
  },
  {
    citySlug: "paris",
    city: "Paris",
    country: "France",
    countryCode: "FR",
    region: "EU",
    description: "Paris has rapidly built a Hyrox training scene with the launch of Hyrox France and the annual Paris Expo event. Several boutique studios in the 11th, 16th, and La Défense have Hyrox-equipped programming.",
    nearestEventCitySlug: "paris",
    gyms: [
      { name: "Klay Saint-Sulpice / Klay Élysées", notes: "Premium Paris fitness clubs with Hyrox-style programming." },
      { name: "Episod", notes: "Boutique studio chain with multiple Paris locations and Hyrox simulation classes." },
      { name: "Local CrossFit boxes", notes: "Multiple Paris CrossFit boxes run Hyrox prep blocks." },
    ],
  },
  {
    citySlug: "madrid",
    city: "Madrid",
    country: "Spain",
    countryCode: "ES",
    region: "EU",
    description: "Madrid is a Hyrox event city and has a fast-growing training community with multiple boutique studios offering dedicated Hyrox classes.",
    nearestEventCitySlug: "madrid",
    gyms: [
      { name: "Brooklyn Fitboxing affiliated branches", notes: "Some branches offer Hyrox-style HIIT programming." },
      { name: "Local CrossFit boxes", notes: "Dozens of Madrid CrossFit boxes run weekly Hyrox sim sessions ahead of the Spanish race calendar." },
    ],
  },
  {
    citySlug: "barcelona",
    city: "Barcelona",
    country: "Spain",
    countryCode: "ES",
    region: "EU",
    description: "Barcelona has a strong CrossFit and functional fitness culture that has translated quickly into Hyrox training, with multiple boxes offering Hyrox-specific programming year-round.",
    nearestEventCitySlug: "barcelona",
    gyms: [
      { name: "Local CrossFit boxes", notes: "CrossFit Barcelona, CrossFit Eixample, and others run Hyrox prep classes." },
      { name: "Boutique functional fitness studios", notes: "Multiple Barcelona studios offer dedicated Hyrox programming." },
    ],
  },
  {
    citySlug: "amsterdam",
    city: "Amsterdam",
    country: "Netherlands",
    countryCode: "NL",
    region: "EU",
    description: "Amsterdam is one of Europe's fastest-growing Hyrox cities. Multiple boxes in the centre and east of the city have Hyrox-specific programming.",
    nearestEventCitySlug: "amsterdam",
    gyms: [
      { name: "TrainMore Amsterdam branches", notes: "Multi-location chain with Hyrox-style programming." },
      { name: "Local CrossFit boxes", notes: "CrossFit Amsterdam and others run Hyrox prep classes." },
    ],
  },
  {
    citySlug: "stockholm",
    city: "Stockholm",
    country: "Sweden",
    countryCode: "SE",
    region: "EU",
    description: "Stockholm hosts the 2026 Hyrox World Championship. Training club density is rising rapidly ahead of the June 2026 finals — multiple boxes have launched dedicated Hyrox classes.",
    nearestEventCitySlug: "stockholm",
    gyms: [
      { name: "SATS Stockholm branches", notes: "Multi-location Nordic chain with Hyrox-style programming at select branches." },
      { name: "Local CrossFit boxes", notes: "Multiple Stockholm CrossFit boxes prepare athletes for the 2026 World Championship." },
    ],
  },
  {
    citySlug: "vienna",
    city: "Vienna",
    country: "Austria",
    countryCode: "AT",
    region: "EU",
    description: "Vienna has multiple Hyrox training partners and a growing pre-event training community for the annual Hyrox Austria event.",
    nearestEventCitySlug: "vienna",
    gyms: [
      { name: "John Reed Fitness Vienna", notes: "Affiliated chain with Hyrox-style programming." },
      { name: "Local CrossFit boxes", notes: "Several Vienna CrossFit boxes run Hyrox prep classes." },
    ],
  },
  {
    citySlug: "zurich",
    city: "Zurich",
    country: "Switzerland",
    countryCode: "CH",
    region: "EU",
    description: "Zurich has a small but rapidly growing Hyrox community with Migros Fitness and several boutique studios offering Hyrox-specific programming.",
    gyms: [
      { name: "Migros Fitness branches", notes: "Multi-location Swiss chain with Hyrox-style programming." },
      { name: "Local CrossFit boxes", notes: "Multiple Zurich CrossFit boxes run weekly Hyrox sim sessions." },
    ],
  },
  {
    citySlug: "dublin",
    city: "Dublin",
    country: "Ireland",
    countryCode: "IE",
    region: "EU",
    description: "Dublin is a Hyrox event city with a rapidly expanding training scene led by The Gym Group Ireland and multiple independent boxes.",
    nearestEventCitySlug: "dublin",
    gyms: [
      { name: "The Gym Group Ireland branches", url: "https://www.thegymgroup.com/gym-classes/cardio-classes/hyrox/" },
      { name: "Local CrossFit boxes", notes: "CrossFit Ireland boxes throughout Dublin run Hyrox prep classes." },
    ],
  },
  {
    citySlug: "new-york",
    city: "New York",
    country: "United States",
    countryCode: "US",
    region: "NA",
    description: "New York has the densest Hyrox training scene in North America, with Equinox, Solidcore, and dozens of independent boxes offering Hyrox-specific programming.",
    nearestEventCitySlug: "new-york",
    gyms: [
      { name: "Equinox NYC branches", notes: "Several Equinox locations offer Hyrox-style programming." },
      { name: "CrossFit NYC", notes: "Largest CrossFit affiliate in NYC with regular Hyrox sim sessions." },
      { name: "Independent boxes", notes: "Multiple boutique Hyrox-specific studios have opened across Manhattan and Brooklyn." },
    ],
  },
  {
    citySlug: "los-angeles",
    city: "Los Angeles",
    country: "United States",
    countryCode: "US",
    region: "NA",
    description: "Los Angeles has a deep functional fitness culture that translates well to Hyrox. Multiple boutique studios in West Hollywood, Santa Monica, and Venice offer Hyrox-specific programming.",
    nearestEventCitySlug: "los-angeles",
    gyms: [
      { name: "Equinox LA branches" },
      { name: "F45 affiliated studios", notes: "Several LA F45 studios run Hyrox prep blocks." },
      { name: "Local CrossFit boxes", notes: "CrossFit Hollywood, CrossFit DTLA, and others run Hyrox classes." },
    ],
  },
  {
    citySlug: "chicago",
    city: "Chicago",
    country: "United States",
    countryCode: "US",
    region: "NA",
    description: "Chicago has a fast-growing Hyrox community with multiple boutique fitness studios and CrossFit boxes preparing athletes for the Chicago and Americas Regional events.",
    nearestEventCitySlug: "chicago",
    gyms: [
      { name: "Equinox Chicago branches" },
      { name: "Local CrossFit boxes", notes: "Multiple Chicago CrossFit boxes run Hyrox prep classes." },
    ],
  },
  {
    citySlug: "miami",
    city: "Miami",
    country: "United States",
    countryCode: "US",
    region: "NA",
    description: "Miami has multiple Hyrox-aligned boutique studios and a strong CrossFit scene that has adapted programming for Hyrox.",
    nearestEventCitySlug: "miami",
    gyms: [
      { name: "Boutique fitness studios", notes: "Multiple Miami studios offer Hyrox-style programming." },
      { name: "Local CrossFit boxes" },
    ],
  },
  {
    citySlug: "toronto",
    city: "Toronto",
    country: "Canada",
    countryCode: "CA",
    region: "NA",
    description: "Toronto has a fast-emerging Hyrox training scene with multiple downtown studios and CrossFit boxes running Hyrox-specific classes.",
    nearestEventCitySlug: "toronto",
    gyms: [
      { name: "Local CrossFit boxes", notes: "CrossFit Toronto and others run Hyrox prep classes." },
      { name: "Boutique studios", notes: "Multiple downtown Toronto studios offer Hyrox-style programming." },
    ],
  },
  {
    citySlug: "sydney",
    city: "Sydney",
    country: "Australia",
    countryCode: "AU",
    region: "APAC",
    description: "Sydney is one of the most active APAC Hyrox cities with multiple Fitness First and independent training partners running Hyrox-specific classes.",
    nearestEventCitySlug: "sydney",
    gyms: [
      { name: "Fitness First Australia branches", notes: "Hyrox-affiliated programming at select Sydney locations." },
      { name: "Local CrossFit boxes", notes: "CrossFit Bondi, CrossFit Surry Hills, and others run Hyrox sim classes." },
    ],
  },
  {
    citySlug: "melbourne",
    city: "Melbourne",
    country: "Australia",
    countryCode: "AU",
    region: "APAC",
    description: "Melbourne has a rapidly growing Hyrox community with multiple boxes across the CBD and inner suburbs offering Hyrox-specific programming.",
    nearestEventCitySlug: "melbourne",
    gyms: [
      { name: "Fitness First Melbourne branches" },
      { name: "Local CrossFit boxes", notes: "CrossFit Melbourne and others run Hyrox prep classes." },
    ],
  },
  {
    citySlug: "brisbane",
    city: "Brisbane",
    country: "Australia",
    countryCode: "AU",
    region: "APAC",
    description: "Brisbane hosts the APAC Regional Championships and has the largest pre-event training community in the Southern Hemisphere.",
    nearestEventCitySlug: "brisbane",
    gyms: [
      { name: "Fitness First Brisbane branches" },
      { name: "Local CrossFit boxes", notes: "Brisbane CrossFit boxes prepare athletes for the APAC Regional Championships." },
    ],
  },
  {
    citySlug: "singapore",
    city: "Singapore",
    country: "Singapore",
    countryCode: "SG",
    region: "APAC",
    description: "Singapore has a small but extremely active Hyrox community. Multiple CBD studios run Hyrox-specific classes and the city has hosted high-profile Hyrox events.",
    nearestEventCitySlug: "singapore",
    gyms: [
      { name: "Boutique fitness studios", notes: "Multiple CBD Singapore studios offer Hyrox-style programming." },
      { name: "Local CrossFit boxes" },
    ],
  },
  {
    citySlug: "hong-kong",
    city: "Hong Kong",
    country: "Hong Kong",
    countryCode: "HK",
    region: "APAC",
    description: "Hong Kong has a growing Hyrox training community with multiple Pure Fitness locations and boutique studios offering Hyrox-specific classes.",
    nearestEventCitySlug: "hong-kong",
    gyms: [
      { name: "Pure Fitness Hong Kong branches" },
      { name: "Local CrossFit boxes" },
    ],
  },
  {
    citySlug: "dubai",
    city: "Dubai",
    country: "United Arab Emirates",
    countryCode: "AE",
    region: "ME",
    description: "Dubai has a fast-growing Hyrox community with multiple boutique studios and CrossFit boxes running Hyrox-specific programming year-round.",
    nearestEventCitySlug: "dubai",
    gyms: [
      { name: "F45 Dubai studios" },
      { name: "Local CrossFit boxes", notes: "Multiple Dubai CrossFit boxes prepare athletes for the regional Hyrox events." },
    ],
  },
];

export function getCityBySlug(slug: string): CityGymGroup | undefined {
  return CITY_GYMS.find((c) => c.citySlug === slug);
}
