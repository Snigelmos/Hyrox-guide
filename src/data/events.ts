/**
 * Upcoming Hyrox events dataset.
 *
 * Used to generate /events/[year]/[city] pages programmatically with Event
 * JSON-LD for rich search results. Confirmed entries are cross-referenced
 * against the official 2026 calendar (Red Bull HYROX calendar + hyrox.com
 * find-your-race). Unconfirmed entries are season-typical placeholders.
 */

export interface HyroxEvent {
  slug: string;
  city: string;
  country: string;
  countryCode: string; // ISO
  year: number;
  startDate: string; // YYYY-MM-DD
  endDate?: string;
  venue: string;
  registrationUrl?: string;
  officialUrl: string;
  resultsUrl?: string; // link to official results (e.g. hyresult.com) once race is done
  notes?: string;
  confirmed: boolean;
  sponsor?: string;
  region?: "EU" | "NA" | "APAC" | "ME" | "SA" | "AF";
  populationDescriptor?: string;
  divisions?: string[];
}

/**
 * Returns true if the event's end date (or start date if no end) is before
 * the supplied reference date (defaults to today at build time).
 */
export function isPastEvent(event: HyroxEvent, now: Date = new Date()): boolean {
  const end = new Date(event.endDate ?? event.startDate);
  // Treat the full end day as still-current by advancing to next day midnight
  end.setDate(end.getDate() + 1);
  return now >= end;
}

const DEFAULT_DIVISIONS = [
  "Open",
  "Pro",
  "Doubles",
  "Doubles Mixed",
  "Relay",
  "Age-group",
];

export const EVENTS: HyroxEvent[] = [
  // Europe — confirmed (2026 official schedule)
  {
    slug: "london",
    city: "London",
    country: "United Kingdom",
    countryCode: "GB",
    year: 2026,
    startDate: "2026-12-02",
    endDate: "2026-12-06",
    venue: "ExCeL London",
    officialUrl: "https://hyrox.com/find-your-race/",
    confirmed: true,
    region: "EU",
    populationDescriptor: "the largest Hyrox event ever staged, with continuous start waves across five days.",
    divisions: DEFAULT_DIVISIONS,
  },
  {
    slug: "berlin",
    city: "Berlin",
    country: "Germany",
    countryCode: "DE",
    year: 2026,
    startDate: "2026-05-22",
    endDate: "2026-05-31",
    venue: "Messe Berlin Tempelhof",
    officialUrl: "https://hyrox.com/find-your-race/",
    confirmed: true,
    sponsor: "GilletteLabs",
    region: "EU",
    populationDescriptor: "the grand finale of the 2025/26 DACH season, eight days of racing inside Tempelhof.",
    divisions: DEFAULT_DIVISIONS,
  },
  {
    slug: "hamburg",
    city: "Hamburg",
    country: "Germany",
    countryCode: "DE",
    year: 2026,
    startDate: "2026-10-28",
    endDate: "2026-11-01",
    venue: "Hamburg Messe",
    officialUrl: "https://hyrox.com/find-your-race/",
    confirmed: true,
    sponsor: "Intersport",
    region: "EU",
    populationDescriptor: "the original home of Hyrox — Hamburg has hosted the race every year since 2018.",
    divisions: DEFAULT_DIVISIONS,
  },
  {
    slug: "paris",
    city: "Paris",
    country: "France",
    countryCode: "FR",
    year: 2026,
    startDate: "2026-04-23",
    endDate: "2026-04-27",
    venue: "Grand Palais",
    officialUrl: "https://hyrox.com/find-your-race/",
    resultsUrl: "https://www.hyresult.com/event/s8-2026-paris",
    confirmed: true,
    sponsor: "Maybelline",
    region: "EU",
    populationDescriptor: "the most architecturally spectacular Hyrox of the year, hosted inside the Grand Palais — over 20,000 athletes raced the 2026 edition.",
    divisions: DEFAULT_DIVISIONS,
  },
  {
    slug: "barcelona",
    city: "Barcelona",
    country: "Spain",
    countryCode: "ES",
    year: 2026,
    startDate: "2026-05-14",
    endDate: "2026-05-17",
    venue: "Fira de Barcelona",
    officialUrl: "https://hyrox.com/find-your-race/",
    confirmed: true,
    region: "EU",
    populationDescriptor: "Spain's flagship Hyrox — four days of racing on Fira's main floor.",
    divisions: DEFAULT_DIVISIONS,
  },
  {
    slug: "milan",
    city: "Milan",
    country: "Italy",
    countryCode: "IT",
    year: 2026,
    startDate: "2026-12-05",
    endDate: "2026-12-06",
    venue: "Fiera Milano (Rho)",
    officialUrl: "https://hyrox.com/find-your-race/",
    confirmed: true,
    region: "EU",
    populationDescriptor: "Hyrox returns to Milan for the city's most festive race weekend.",
    divisions: DEFAULT_DIVISIONS,
  },
  {
    slug: "rome",
    city: "Rome",
    country: "Italy",
    countryCode: "IT",
    year: 2026,
    startDate: "2026-09-24",
    endDate: "2026-09-27",
    venue: "Fiera di Roma",
    officialUrl: "https://hyrox.com/find-your-race/",
    confirmed: true,
    region: "EU",
    populationDescriptor: "four days of high-energy racing at Fiera di Roma — features an iconic outdoor run course.",
    divisions: DEFAULT_DIVISIONS,
  },
  {
    slug: "stockholm",
    city: "Stockholm",
    country: "Sweden",
    countryCode: "SE",
    year: 2026,
    startDate: "2026-06-18",
    endDate: "2026-06-21",
    venue: "Strawberry Arena",
    officialUrl: "https://hyrox.com/find-your-race/",
    confirmed: true,
    sponsor: "Puma",
    region: "EU",
    populationDescriptor: "the 2026 Hyrox World Championships — the season's premier event for the top 0.5% of qualifiers.",
    divisions: ["World Championship Singles", "World Championship Doubles", "Age-group", "Adaptive"],
  },
  {
    slug: "oslo",
    city: "Oslo",
    country: "Norway",
    countryCode: "NO",
    year: 2026,
    startDate: "2026-09-25",
    endDate: "2026-09-27",
    venue: "NOVA Spektrum",
    officialUrl: "https://hyrox.com/find-your-race/",
    confirmed: true,
    region: "EU",
    populationDescriptor: "Norway's only Hyrox — three days of racing after a hugely successful debut in 2025.",
    divisions: DEFAULT_DIVISIONS,
  },
  {
    slug: "helsinki",
    city: "Helsinki",
    country: "Finland",
    countryCode: "FI",
    year: 2026,
    startDate: "2026-05-09",
    endDate: "2026-05-10",
    venue: "Messukeskus Helsinki",
    officialUrl: "https://hyrox.com/find-your-race/",
    confirmed: true,
    region: "EU",
    populationDescriptor: "Hyrox arrives in Finland for the first time — a Scandinavian-style two-day debut.",
    divisions: DEFAULT_DIVISIONS,
  },
  {
    slug: "warsaw",
    city: "Warsaw",
    country: "Poland",
    countryCode: "PL",
    year: 2026,
    startDate: "2026-04-16",
    endDate: "2026-04-19",
    venue: "PGE Narodowy (National Stadium)",
    officialUrl: "https://hyrox.com/find-your-race/",
    resultsUrl: "https://www.hyresult.com/event/s8-2026-warsaw",
    confirmed: true,
    region: "EU",
    populationDescriptor: "the fourth and final Major of the season — Elite 15 athletes battle for World Championship spots.",
    divisions: DEFAULT_DIVISIONS,
  },
  // Europe — placeholder dates (verify before booking)
  {
    slug: "manchester",
    city: "Manchester",
    country: "United Kingdom",
    countryCode: "GB",
    year: 2026,
    startDate: "2026-11-14",
    venue: "Manchester Central",
    officialUrl: "https://hyrox.com/find-your-race/",
    confirmed: false,
    region: "EU",
    divisions: DEFAULT_DIVISIONS,
  },
  {
    slug: "munich",
    city: "Munich",
    country: "Germany",
    countryCode: "DE",
    year: 2026,
    startDate: "2026-11-28",
    venue: "Messe München",
    officialUrl: "https://hyrox.com/find-your-race/",
    confirmed: false,
    region: "EU",
    divisions: DEFAULT_DIVISIONS,
  },
  {
    slug: "amsterdam",
    city: "Amsterdam",
    country: "Netherlands",
    countryCode: "NL",
    year: 2026,
    startDate: "2026-09-19",
    venue: "RAI Amsterdam",
    officialUrl: "https://hyrox.com/find-your-race/",
    confirmed: false,
    region: "EU",
    notes: "Dates indicative — official 2026 NL stops are Heerenveen, Maastricht, Rotterdam and Utrecht.",
    divisions: DEFAULT_DIVISIONS,
  },
  {
    slug: "madrid",
    city: "Madrid",
    country: "Spain",
    countryCode: "ES",
    year: 2026,
    startDate: "2026-12-05",
    venue: "IFEMA Madrid",
    officialUrl: "https://hyrox.com/find-your-race/",
    confirmed: false,
    region: "EU",
    divisions: DEFAULT_DIVISIONS,
  },
  {
    slug: "gothenburg",
    city: "Gothenburg",
    country: "Sweden",
    countryCode: "SE",
    year: 2026,
    startDate: "2026-03-14",
    venue: "Svenska Mässan",
    officialUrl: "https://hyrox.com/find-your-race/",
    confirmed: false,
    region: "EU",
    divisions: DEFAULT_DIVISIONS,
  },
  {
    slug: "copenhagen",
    city: "Copenhagen",
    country: "Denmark",
    countryCode: "DK",
    year: 2026,
    startDate: "2026-11-07",
    venue: "Bella Center Copenhagen",
    officialUrl: "https://hyrox.com/find-your-race/",
    confirmed: false,
    region: "EU",
    divisions: DEFAULT_DIVISIONS,
  },
  {
    slug: "vienna",
    city: "Vienna",
    country: "Austria",
    countryCode: "AT",
    year: 2026,
    startDate: "2026-11-14",
    venue: "Messe Wien",
    officialUrl: "https://hyrox.com/find-your-race/",
    confirmed: false,
    region: "EU",
    divisions: DEFAULT_DIVISIONS,
  },
  {
    slug: "zurich",
    city: "Zurich",
    country: "Switzerland",
    countryCode: "CH",
    year: 2026,
    startDate: "2026-04-11",
    venue: "Messe Zürich",
    officialUrl: "https://hyrox.com/find-your-race/",
    confirmed: false,
    region: "EU",
    notes: "2026 Swiss event is HYROX Geneva — see /events/2026/geneva/.",
    divisions: DEFAULT_DIVISIONS,
  },
  {
    slug: "prague",
    city: "Prague",
    country: "Czech Republic",
    countryCode: "CZ",
    year: 2026,
    startDate: "2026-03-28",
    venue: "PVA EXPO PRAHA",
    officialUrl: "https://hyrox.com/find-your-race/",
    confirmed: false,
    region: "EU",
    divisions: DEFAULT_DIVISIONS,
  },
  // North America — confirmed
  {
    slug: "new-york",
    city: "New York",
    country: "United States",
    countryCode: "US",
    year: 2026,
    startDate: "2026-05-28",
    endDate: "2026-06-07",
    venue: "Javits Center",
    officialUrl: "https://hyrox.com/find-your-race/",
    confirmed: true,
    sponsor: "NYU Langone Health",
    region: "NA",
    populationDescriptor: "the largest Hyrox event in North American history — up to 50,000 athletes across two weekends.",
    divisions: DEFAULT_DIVISIONS,
  },
  {
    slug: "miami",
    city: "Miami",
    country: "United States",
    countryCode: "US",
    year: 2026,
    startDate: "2026-04-03",
    endDate: "2026-04-05",
    venue: "Miami Beach Convention Center",
    officialUrl: "https://hyrox.com/find-your-race/",
    resultsUrl: "https://www.hyresult.com/event/s8-2026-miami",
    confirmed: true,
    sponsor: "LEGENDZ",
    region: "NA",
    populationDescriptor: "one of the most hotly anticipated 2025-26 stops — Art Deco Miami Beach hosting the global series.",
    divisions: DEFAULT_DIVISIONS,
  },
  {
    slug: "dallas",
    city: "Dallas",
    country: "United States",
    countryCode: "US",
    year: 2026,
    startDate: "2026-11-18",
    endDate: "2026-11-22",
    venue: "Kay Bailey Hutchison Convention Center",
    officialUrl: "https://hyrox.com/find-your-race/",
    confirmed: true,
    region: "NA",
    populationDescriptor: "five extended days of racing — Dallas is North America's most passionate Hyrox community.",
    divisions: DEFAULT_DIVISIONS,
  },
  {
    slug: "toronto",
    city: "Toronto",
    country: "Canada",
    countryCode: "CA",
    year: 2026,
    startDate: "2026-10-01",
    endDate: "2026-10-04",
    venue: "The International Centre",
    officialUrl: "https://hyrox.com/find-your-race/",
    confirmed: true,
    sponsor: "GoodLife",
    region: "NA",
    populationDescriptor: "Canada's biggest Hyrox stop — four days of expanded racing.",
    divisions: DEFAULT_DIVISIONS,
  },
  // North America — placeholder
  {
    slug: "los-angeles",
    city: "Los Angeles",
    country: "United States",
    countryCode: "US",
    year: 2026,
    startDate: "2026-03-07",
    venue: "Pasadena Convention Center",
    officialUrl: "https://hyrox.com/find-your-race/",
    confirmed: false,
    region: "NA",
    divisions: DEFAULT_DIVISIONS,
  },
  {
    slug: "chicago",
    city: "Chicago",
    country: "United States",
    countryCode: "US",
    year: 2026,
    startDate: "2026-10-03",
    venue: "McCormick Place",
    officialUrl: "https://hyrox.com/find-your-race/",
    confirmed: false,
    region: "NA",
    divisions: DEFAULT_DIVISIONS,
  },
  // APAC — confirmed
  {
    slug: "singapore",
    city: "Singapore",
    country: "Singapore",
    countryCode: "SG",
    year: 2026,
    startDate: "2026-04-03",
    endDate: "2026-04-05",
    venue: "Singapore National Stadium",
    officialUrl: "https://hyrox.com/find-your-race/",
    resultsUrl: "https://www.hyresult.com/event/s8-2026-singapore",
    confirmed: true,
    sponsor: "AIA",
    region: "APAC",
    populationDescriptor: "the first three-day Hyrox in Southeast Asia — over 14,000 athletes packed Singapore National Stadium for Friday Night Relays and three days of racing.",
    divisions: DEFAULT_DIVISIONS,
  },
  {
    slug: "sydney",
    city: "Sydney",
    country: "Australia",
    countryCode: "AU",
    year: 2026,
    startDate: "2026-07-01",
    endDate: "2026-07-05",
    venue: "ICC Sydney",
    officialUrl: "https://hyrox.com/find-your-race/",
    confirmed: true,
    region: "APAC",
    populationDescriptor: "Australia's first Hyrox, now expanded to five days with record participation.",
    divisions: DEFAULT_DIVISIONS,
  },
  {
    slug: "hong-kong",
    city: "Hong Kong",
    country: "Hong Kong SAR",
    countryCode: "HK",
    year: 2026,
    startDate: "2026-05-08",
    endDate: "2026-05-10",
    venue: "AsiaWorld-Expo",
    officialUrl: "https://hyrox.com/find-your-race/",
    confirmed: true,
    sponsor: "Cigna Healthcare",
    region: "APAC",
    populationDescriptor: "three-day Hong Kong stop hosted at AsiaWorld-Expo.",
    divisions: DEFAULT_DIVISIONS,
  },
  // APAC — placeholder
  {
    slug: "melbourne",
    city: "Melbourne",
    country: "Australia",
    countryCode: "AU",
    year: 2026,
    startDate: "2026-08-22",
    venue: "Melbourne Convention Centre",
    officialUrl: "https://hyrox.com/find-your-race/",
    confirmed: false,
    region: "APAC",
    divisions: DEFAULT_DIVISIONS,
  },
  // Middle East — placeholder
  {
    slug: "dubai",
    city: "Dubai",
    country: "United Arab Emirates",
    countryCode: "AE",
    year: 2026,
    startDate: "2026-02-14",
    venue: "Dubai Exhibition Centre",
    officialUrl: "https://hyrox.com/find-your-race/",
    confirmed: false,
    region: "ME",
    divisions: DEFAULT_DIVISIONS,
  },
];

export function getEventsByYear(year: number): HyroxEvent[] {
  return EVENTS.filter((e) => e.year === year).sort(
    (a, b) => a.startDate.localeCompare(b.startDate)
  );
}

export function getEventsByRegion(year: number, region: HyroxEvent["region"]): HyroxEvent[] {
  return getEventsByYear(year).filter((e) => e.region === region);
}

export function allEventPaths(): { year: number; slug: string }[] {
  return EVENTS.map((e) => ({ year: e.year, slug: e.slug }));
}

export function formatEventDate(startDate: string, endDate?: string): string {
  const s = new Date(startDate);
  const fmt: Intl.DateTimeFormatOptions = { month: "long", day: "numeric", year: "numeric" };
  if (endDate) {
    const e = new Date(endDate);
    const sameMonth = s.getUTCMonth() === e.getUTCMonth();
    if (sameMonth) {
      return `${s.toLocaleDateString("en-US", { month: "long", day: "numeric" })}–${e.getUTCDate()}, ${e.getUTCFullYear()}`;
    }
    return `${s.toLocaleDateString("en-US", { month: "long", day: "numeric" })}–${e.toLocaleDateString("en-US", fmt)}`;
  }
  return s.toLocaleDateString("en-US", fmt);
}
