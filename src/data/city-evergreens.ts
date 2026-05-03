/**
 * Evergreen city pages — "Hyrox [city]" head-term capture.
 *
 * Distinct from year-tied event pages (/events/2026/london/) which target
 * "hyrox london 2026". The /hyrox/[city]/ pages target the bare head term
 * "hyrox london", which is a higher-volume, year-agnostic query and a key
 * search-intent that funnels into events, gyms, and training.
 *
 * Each entry must:
 *  - Match an EVENT slug used by /events/[year]/[city]/ so we can roll up
 *    every year of races for the same city.
 *  - Use a citySlug compatible with getGymsByCity() in gym-finder.ts.
 *  - Provide a short city-specific tagline and pacing/venue note that adds
 *    real value beyond what the year page already covers.
 *
 * Add new cities here once they appear on the official Hyrox calendar
 * with at least one confirmed year of racing.
 */

export interface CityEvergreen {
  /** URL slug — used at /hyrox/[slug]/. Matches the events.ts slug. */
  slug: string;
  /** Display city name. */
  city: string;
  country: string;
  countryCode: string;
  /** Slug used by gym-finder.getGymsByCity() so we can list local gyms. */
  citySlug: string;
  /** Short page-header tagline. */
  tagline: string;
  /** 2-3 paragraph evergreen intro. */
  intro: string[];
  /** Optional venue or city-specific pacing note (3-6 bullets). */
  cityNotes: { title: string; detail: string }[];
}

export const CITY_EVERGREENS: CityEvergreen[] = [
  {
    slug: "london",
    city: "London",
    country: "United Kingdom",
    countryCode: "GB",
    citySlug: "london",
    tagline: "Europe's largest Hyrox stop. Multi-day events, two indoor venues, deep masters and elite fields.",
    intro: [
      "London is the highest-attendance Hyrox event on the European calendar, regularly running across three or more days at ExCeL or Olympia. Expect heaving warm-up areas, queueing for sled lanes, and a deeper masters and elite field than almost any other stop.",
      "Local athletes have a built-in advantage: the city has more Hyrox-affiliated training gyms than anywhere else in Europe, and the BLOK, F45, and F1 Recovery clusters all run dedicated Hyrox class blocks. Travel into London for race weekend and you'll find any of these venues open to drop-ins for sled work.",
    ],
    cityNotes: [
      { title: "Venue", detail: "ExCeL is the larger of the two London venues and runs the wider lane count. Olympia is tighter and warmer. Both add ~2 minutes vs the lane-perfect record-attempt setups elsewhere." },
      { title: "Travel", detail: "Both venues sit on direct rail lines. ExCeL = Custom House (DLR/Elizabeth Line); Olympia = Kensington Olympia. Stay in Stratford for ExCeL, Earl's Court for Olympia." },
      { title: "Pacing", detail: "London floors are typically firmer than mainland European venues, which makes the sled push slightly faster. Expect to gain 5-10 seconds on sled push vs your training estimate." },
      { title: "Field", detail: "Sub-65 men and sub-78 women rank top-30 on most London weekends. The pro and elite waves are stacked, so Open is the better target for first-time London racers." },
    ],
  },
  {
    slug: "berlin",
    city: "Berlin",
    country: "Germany",
    countryCode: "DE",
    citySlug: "berlin",
    tagline: "The home of Hyrox. Iconic venue at Messe Berlin and the deepest German field.",
    intro: [
      "Berlin holds a special place in Hyrox history — the first ever Hyrox race ran in Hamburg in 2017, but Berlin was the stop that grew the brand. The city's annual race at Messe Berlin remains a season highlight, and the field includes a high concentration of veteran German athletes who've raced 5+ events.",
      "If you want a bucket-list Hyrox to mark your calendar, Berlin is the one.",
    ],
    cityNotes: [
      { title: "Venue", detail: "Messe Berlin uses a large indoor hall with consistent flat flooring and tall ceilings — wall ball lighting and target visibility are excellent." },
      { title: "Travel", detail: "Reachable via S-Bahn (Messe Süd or Messe Nord/ICC). Stay in Charlottenburg or near Zoologischer Garten for short transit." },
      { title: "Pacing", detail: "German waves often go out fast on the SkiErg. If you're not chasing a podium, hold your pace — the front-pack burns out by sled push." },
      { title: "Field", detail: "Sub-70 men is a top-25% finish at most Berlin events. Sub-80 women is similarly competitive. Doubles fields are particularly strong." },
    ],
  },
  {
    slug: "manchester",
    city: "Manchester",
    country: "United Kingdom",
    countryCode: "GB",
    citySlug: "manchester",
    tagline: "Northern UK's flagship Hyrox stop. Manchester Central venue, strong CrossFit crossover.",
    intro: [
      "Manchester is the second UK race city after London and has built a reputation for tight scheduling and a fast Open field driven by CrossFit-leaning athletes from the Northwest and Yorkshire.",
      "If you're in the North of England, Manchester is the obvious A-race. The local gym ecosystem includes several Hyrox-affiliated training clubs that run weekly race-rehearsal sessions through the build-up.",
    ],
    cityNotes: [
      { title: "Venue", detail: "Manchester Central is a converted railway station — high ceilings, good lighting, but slightly tighter wave staging than ExCeL." },
      { title: "Travel", detail: "Manchester Piccadilly station is a 15-minute walk. Stay around Deansgate for the shortest morning commute." },
      { title: "Pacing", detail: "Manchester floors absorb slightly more sled momentum than London — expect to lose 3-5 seconds on sled push vs training estimate." },
      { title: "Field", detail: "Pro Men field is competitive — most Open Men sub-65 finishers are in the top 50% of Pro at Manchester." },
    ],
  },
  {
    slug: "new-york",
    city: "New York",
    country: "United States",
    countryCode: "US",
    citySlug: "new-york",
    tagline: "Hyrox's marquee North American stop. Brooklyn or Manhattan venues, fastest-growing US field.",
    intro: [
      "New York is the marquee Hyrox event in North America. The race has alternated between Brooklyn (Industry City, Pier 36) and Manhattan-adjacent venues, with each hosting strong Open and Pro fields. The community is younger than European stops and has grown quickly out of the city's CrossFit and ClassPass ecosystem.",
      "If you live in the Northeast US, this is your A-race. If you're flying in, expect typical US convention-style logistics — large parking, plenty of warm-up space, and food trucks at the venue.",
    ],
    cityNotes: [
      { title: "Venue", detail: "Brooklyn venues (Industry City) tend to be cooler than Manhattan venues. Air-conditioning is reliable; bring layers for staging areas." },
      { title: "Travel", detail: "Brooklyn races are subway-accessible (D/N/R to 36 St). Manhattan races are JFK or LGA flights then yellow cab to venue." },
      { title: "Pacing", detail: "US sled lanes run slightly longer than the European 12.5 m four-section setup at some venues. Expect sled push to be 3-7 seconds slower vs your training estimate." },
      { title: "Field", detail: "Open Men sub-70 is a top-25% finish at most NYC events. Doubles Mixed is the fastest-growing division at this venue." },
    ],
  },
  {
    slug: "los-angeles",
    city: "Los Angeles",
    country: "United States",
    countryCode: "US",
    citySlug: "los-angeles",
    tagline: "West Coast Hyrox capital. Convention Center venue, deep boutique-fitness crossover.",
    intro: [
      "Los Angeles hosts the largest West Coast Hyrox event of the year, typically at the LA Convention Center. The field skews toward boutique-fitness crossover athletes — Barry's, Equinox, and SoulCycle members trying their first hybrid race — which makes Open more accessible than the Manchester or Berlin equivalent at the same Open finish time.",
      "If you're based in California or the Pacific Northwest, LA is the obvious A-race choice. Travel-wise, the venue is downtown and walkable from Crypto.com Arena hotels.",
    ],
    cityNotes: [
      { title: "Venue", detail: "LA Convention Center has reliable AC and good wall-ball lighting. The sled lanes run on rubber-coated concrete — slightly slower than the indoor turf used at some European venues." },
      { title: "Travel", detail: "LAX or BUR airports. Stay in Downtown LA for the shortest commute. Avoid race-morning traffic on the 110." },
      { title: "Pacing", detail: "Heat is rarely a factor at the venue itself, but sandbag lunge stations are sometimes set up near loading-dock doors that warm up by mid-day. If you race a late wave, drink an extra 200 ml of electrolytes pre-race." },
      { title: "Field", detail: "LA is a strong first-Hyrox option for boutique-fitness athletes — the Open field at LA is typically 10-15 minutes wider in finish time spread than Berlin or London." },
    ],
  },
  {
    slug: "sydney",
    city: "Sydney",
    country: "Australia",
    countryCode: "AU",
    citySlug: "sydney",
    tagline: "APAC's flagship event. ICC Sydney venue, deep CrossFit and rugby crossover.",
    intro: [
      "Sydney is the largest Hyrox event in the Asia-Pacific region. The race runs at ICC Sydney (International Convention Centre) over two or three days. The local field skews strong — Australia's CrossFit and rugby ecosystems both feed the race, and the elite Open Men times are typically 2-3 minutes faster than the New York equivalent.",
      "If you're based in Australia or New Zealand, Sydney is the only event of the year you cannot afford to miss. Trans-Tasman athletes routinely fly across for it.",
    ],
    cityNotes: [
      { title: "Venue", detail: "ICC Sydney sits on Darling Harbour. The hall is modern, AC is excellent, and the sled lanes use turf that's slightly tackier than the European norm — which slows the sled push by 3-5 seconds." },
      { title: "Travel", detail: "Sydney Domestic or International airport, then 25-minute taxi to Darling Harbour. Stay in the Sydney CBD or Pyrmont for a 10-minute walk in." },
      { title: "Pacing", detail: "Heat and humidity are rarely an indoor problem, but Sydney's daylight savings cycle can put early waves in surprisingly cool venues. Warm up for 20+ minutes before your wave." },
      { title: "Field", detail: "Sub-65 Open Men is top-15% at Sydney. The Doubles fields are particularly competitive due to the rugby crossover." },
    ],
  },
  {
    slug: "hong-kong",
    city: "Hong Kong",
    country: "Hong Kong SAR",
    countryCode: "HK",
    citySlug: "hong-kong",
    tagline: "APAC's most travel-attended event. AsiaWorld-Expo venue, stacked international field.",
    intro: [
      "Hong Kong has become Hyrox's most internationally-attended single event in Asia. The race draws athletes from Singapore, Tokyo, Seoul, and even Australia. The venue, AsiaWorld-Expo on Lantau Island, is connected directly to the airport, making it the easiest international Hyrox to fly in for.",
      "If you're based anywhere in Asia or you're using a Hyrox as the destination part of a trip, Hong Kong is the obvious choice.",
    ],
    cityNotes: [
      { title: "Venue", detail: "AsiaWorld-Expo Hall 5 has high ceilings and excellent AC — ideal for fast times. Sled lanes are turf with consistent pull." },
      { title: "Travel", detail: "AsiaWorld-Expo connects directly to Hong Kong International Airport via the Airport Express MTR. Stay at the Regal Airport Hotel or in Tung Chung for race morning." },
      { title: "Pacing", detail: "Indoor humidity is well controlled. Outside the venue is muggy — keep warm-up jogs short and indoors." },
      { title: "Field", detail: "Open Men sub-70 is a top-30% finish at Hong Kong. The international field makes wave assignments hard to predict — register early for a competitive wave." },
    ],
  },
  {
    slug: "dubai",
    city: "Dubai",
    country: "United Arab Emirates",
    countryCode: "AE",
    citySlug: "dubai",
    tagline: "Middle East's flagship Hyrox stop. Dubai Exhibition Centre venue, growing Pro field.",
    intro: [
      "Dubai is the only confirmed Hyrox stop in the Middle East and one of the fastest-growing on the calendar. The field is heavily international — the UAE's expat community alone fills a significant share of waves, and travel from Europe, India, and East Africa makes the race a destination event.",
      "If you're based anywhere in the Middle East or want a destination Hyrox tied to a winter beach trip, Dubai is the only option that ticks both boxes.",
    ],
    cityNotes: [
      { title: "Venue", detail: "Dubai Exhibition Centre is large, modern, and air-conditioned. The sled lanes typically run on industrial turf with consistent grip." },
      { title: "Travel", detail: "Dubai International (DXB) is 35-45 minutes by metro or taxi to the venue. Stay in Downtown Dubai or DIFC for the shortest commute." },
      { title: "Pacing", detail: "Indoor temperature is tightly controlled but the dry desert air can make early-morning waves feel cold — start the warm-up indoors. Hydration matters more than at humid venues." },
      { title: "Field", detail: "Pro field is small but high-quality — top-5 Pro Men finishers at Dubai routinely place in international rankings." },
    ],
  },
];

export function getCityEvergreen(slug: string): CityEvergreen | undefined {
  return CITY_EVERGREENS.find((c) => c.slug === slug);
}
