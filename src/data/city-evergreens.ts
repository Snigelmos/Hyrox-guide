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
    tagline: "Hyrox's marquee North American stop. Now at the Javits Center in Manhattan, the largest US field of the year.",
    intro: [
      "New York is the marquee Hyrox event in North America. The race now runs at the Jacob K. Javits Convention Center on Manhattan's far West Side, the largest indoor venue on the US calendar. Earlier seasons used Brooklyn venues (Industry City, Pier 36); the move to Javits gives the event room for one of the biggest fields Hyrox has ever staged. The community is younger than European stops and has grown quickly out of the city's CrossFit and boutique-fitness ecosystem.",
      "If you live in the Northeast US, this is your A-race. If you're flying in, expect typical US convention-style logistics: cavernous halls, plenty of warm-up space, and an electric crowd.",
    ],
    cityNotes: [
      { title: "Venue", detail: "The Javits Center is climate-controlled and cavernous, with the running loop, all 8 stations, Roxzone, and bag drop under one glass roof. Air-conditioning is reliable, so bring a layer for staging areas." },
      { title: "Travel", detail: "Javits sits on 11th Avenue. Hudson Yards (7) station is about a 10-minute walk; 34th St-Penn Station (A/C/E, 1/2/3, NJ Transit, LIRR, Amtrak) is roughly 15 minutes on foot. From JFK or LGA, allow extra time on race morning." },
      { title: "Pacing", detail: "The Javits floor is smooth indoor flooring with wide running lanes, so expect fast splits. Indoor climate control means standard indoor pacing applies." },
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
  {
    slug: "milan",
    city: "Milan",
    country: "Italy",
    countryCode: "IT",
    citySlug: "milan",
    tagline: "Italy's flagship Hyrox stop. Known locally as Hyrox Milano (Mailand in German). Held at Fiera Milano in Rho.",
    intro: [
      "Milan is the largest Hyrox event in southern Europe and the only Italian race on the calendar. Locally the race is searched as Hyrox Milano; German-speaking athletes from across the Alps know it as Hyrox Mailand. The host venue is Fiera Milano in Rho, on the city's western edge, which draws athletes from across Italy plus a strong contingent from Switzerland, southern France, and Austria.",
      "If you're based in Italy, Milan is your A-race. If you're flying in, the Rho-Fiera metro stop puts you at the venue door in 25 minutes from central Milan.",
    ],
    cityNotes: [
      { title: "Venue", detail: "Fiera Milano (Rho) is one of Europe's largest exhibition complexes. The Hyrox hall typically has high ceilings and wide sled lanes, with consistent indoor temperature year-round." },
      { title: "Travel", detail: "Take the M1 metro red line to Rho-Fiera. Stay near Cadorna or Centrale for direct connections. Linate or Malpensa airport, both with good rail/coach links into the city." },
      { title: "Pacing", detail: "Italian Hyrox waves tend to start fast on SkiErg and burn out by the second sled. Hold conservative early splits and you'll pass the front pack on wall balls." },
      { title: "Field", detail: "Sub-75 Open Men is a top-25% finish at Milan. Doubles fields are growing fast at this stop, particularly Mixed Doubles." },
    ],
  },
  {
    slug: "hamburg",
    city: "Hamburg",
    country: "Germany",
    countryCode: "DE",
    citySlug: "hamburg",
    tagline: "The original home of Hyrox. Hamburg Messe venue, hosted Hyrox every year since 2018.",
    intro: [
      "Hamburg is where Hyrox was born. The first ever Hyrox race ran here in 2017, and the city has been on the calendar every season since. The race is held at Hamburg Messe in the Karolinenviertel, a 10-minute walk from the city centre. Danish-speaking athletes searching for the race often type Hyrox Hamborg.",
      "The Hamburg field is one of the most experienced in the world. Local clubs run weekly race-rehearsal sessions through the autumn build-up, and several of Germany's top elite athletes train within the city limits.",
    ],
    cityNotes: [
      { title: "Venue", detail: "Hamburg Messe has good lighting and reliable AC. Hall layouts vary year to year — recent editions have used Hall A4 with wider lanes than the 2018-2020 venue setup." },
      { title: "Travel", detail: "U-Bahn lines U2/U3 stop directly at Messehallen or St. Pauli. Stay in St. Pauli, Sternschanze, or Eimsbüttel for short transit and post-race food." },
      { title: "Pacing", detail: "Hamburg waves run on time and the sled lane changeovers are quick. Don't lose seconds at transitions — the venue rewards tight roxzone work." },
      { title: "Field", detail: "Sub-70 Open Men is a top-25% finish at Hamburg. The Pro Men's field is consistently one of the deepest in Europe." },
    ],
  },
  {
    slug: "vienna",
    city: "Vienna",
    country: "Austria",
    countryCode: "AT",
    citySlug: "vienna",
    tagline: "Austria's flagship Hyrox stop. Locally known as Hyrox Wien. Strong central-European field.",
    intro: [
      "Vienna (Wien in German) is Austria's headline Hyrox event. The race draws a strong central-European field, with travel from Germany, Czech Republic, Slovakia, Hungary, and northern Italy. The Austrian community is small but disproportionately strong on the elite end, with several top-30 European Pro finishers based in or around Vienna.",
      "Search engines see this race as both Hyrox Vienna and Hyrox Wien depending on your language settings. The latter is what most local athletes use when planning training and travel.",
    ],
    cityNotes: [
      { title: "Venue", detail: "Vienna's Hyrox venue typically sits in the Reed Messe district in the 2nd Bezirk. AC is reliable, lane layouts are standard." },
      { title: "Travel", detail: "U-Bahn line U1 to Messe-Prater puts you at the venue. Stay around Praterstern or in the 2nd district for the shortest race-morning commute." },
      { title: "Pacing", detail: "Vienna waves are technical — Austrian athletes run textbook splits and rarely fade. Don't try to hang with the front pack unless you've trained the back-half wall balls under deep fatigue." },
      { title: "Field", detail: "Sub-75 Open Men is a top-30% finish. Doubles is the fastest-growing division." },
    ],
  },
  {
    slug: "copenhagen",
    city: "Copenhagen",
    country: "Denmark",
    countryCode: "DK",
    citySlug: "copenhagen",
    tagline: "Scandinavia's biggest Hyrox stop after Stockholm. Bella Center venue, deep CrossFit crossover.",
    intro: [
      "Copenhagen has grown into one of the strongest Hyrox stops in Scandinavia. The race is held at the Bella Center in Ørestad, a 15-minute metro ride south of the city centre. The local field skews toward CrossFit-trained athletes and Sats / Fitness World members who use the race as their winter benchmark.",
      "If you're based in Denmark, southern Sweden, or northern Germany, Copenhagen is the closest serious A-race. Travel-wise the airport is 8 minutes by metro from the venue, which makes it one of the easiest fly-in races in Europe.",
    ],
    cityNotes: [
      { title: "Venue", detail: "Bella Center is modern with consistent flooring and excellent AC. Wall ball lighting is good; sled lanes use standard turf." },
      { title: "Travel", detail: "Metro M2 from CPH airport to Bella stop, 8 minutes door to door. Stay at the Crowne Plaza Copenhagen Towers, attached to the venue, for the shortest race morning." },
      { title: "Pacing", detail: "Danish Hyrox waves typically run hot. The hall warms up fast in the back half of the day, so afternoon waves drink more electrolytes than morning waves." },
      { title: "Field", detail: "Sub-72 Open Men is a top-20% finish at Copenhagen. Doubles Mixed is particularly competitive." },
    ],
  },
  {
    slug: "madrid",
    city: "Madrid",
    country: "Spain",
    countryCode: "ES",
    citySlug: "madrid",
    tagline: "Spain's largest historic Hyrox stop. Strong CrossFit and bootcamp crossover field.",
    intro: [
      "Madrid was Spain's primary Hyrox host city through 2024-2025 and remains the centre of the Spanish Hyrox community. The 2026 calendar moves the Spanish race to Barcelona, but Madrid's training-club ecosystem still runs the largest Hyrox prep classes in Iberia and is the natural travel hub for athletes from central Spain.",
      "If you're based in Madrid and racing the 2026 Barcelona event, the Madrid Hyrox-affiliated training clubs are still your home gyms for the build-up. Travel for the race itself is a 2.5-hour AVE high-speed train to Barcelona-Sants.",
    ],
    cityNotes: [
      { title: "Venue history", detail: "Past Madrid Hyrox events have used IFEMA Feria de Madrid in the Campo de las Naciones district. The hall is large, modern, and well-ventilated." },
      { title: "Travel for 2026", detail: "AVE high-speed train Madrid Atocha to Barcelona Sants is 2 hours 30 minutes. Book at least 4 weeks ahead for fixed seats at race weekend rates." },
      { title: "Training", detail: "Madrid's Hyrox-affiliated clubs are concentrated around Chamartín, Salamanca, and Chamberí. Most run weekly Hyrox simulation classes through autumn." },
      { title: "Field", detail: "The Spanish Open field has historically been a step softer than the German or French equivalents at the same finish time. Use that as a confidence boost on race day, not as a reason to under-prepare." },
    ],
  },
  {
    slug: "helsinki",
    city: "Helsinki",
    country: "Finland",
    countryCode: "FI",
    citySlug: "helsinki",
    tagline: "Finland's flagship Hyrox stop. Helsinki Expo and Convention Centre venue, growing Nordic field.",
    intro: [
      "Helsinki is the largest Hyrox event in Finland and one of the most internationally-attended Nordic stops. The race draws athletes from across Finland, Estonia, southern Sweden, and the Baltic region. Local searchers use the Finnish term Hyrox Helsinki aikataulu when looking up the schedule.",
      "If you're based in Finland, this is your A-race. Travel-wise the Helsinki Expo and Convention Centre (Messukeskus) sits 5 minutes by tram from central Helsinki, making it one of the easiest urban venues to reach without a car.",
    ],
    cityNotes: [
      { title: "Venue", detail: "Messukeskus has consistent flooring and reliable AC. Hyrox typically uses a single large hall with standard lane spacing." },
      { title: "Travel", detail: "Tram lines 7 and 9 stop at Pasila station, two minutes from the venue. Stay around Kallio or Töölö for short transit and good pre-race food." },
      { title: "Pacing", detail: "Finnish waves often run faster than expected on the row, where local cross-country skiers excel. Don't chase splits on row if you're not a trained rower." },
      { title: "Field", detail: "Sub-75 Open Men is a top-25% finish. The Doubles Mixed division has grown notably year over year at this stop." },
    ],
  },
  {
    slug: "paris",
    city: "Paris",
    country: "France",
    countryCode: "FR",
    citySlug: "paris",
    tagline: "France's biggest Hyrox stop. Multiple annual races, deep boutique-fitness and CrossFit crossover.",
    intro: [
      "Paris is the largest Hyrox host city in France and runs more events per season than most stops on the calendar. Past editions have used Paris Expo Porte de Versailles and several Île-de-France suburbs (Saint-Denis, Chatenay-Malabry, Saint-Cyr-l'École, Rosny-sous-Bois). The local field is the deepest in continental Europe outside Germany.",
      "If you're based in France or anywhere in northern Europe, Paris is on the short list of must-do A-races. Hyrox-affiliated training clubs across the city run race-prep classes year-round.",
    ],
    cityNotes: [
      { title: "Venue", detail: "Most central Paris Hyrox events use Paris Expo Porte de Versailles in the 15th arrondissement. Suburb editions vary year to year." },
      { title: "Travel", detail: "Métro line 12 to Porte de Versailles serves the central venue. Suburb venues vary; check the year page for race-week transit detail." },
      { title: "Pacing", detail: "French waves run technical and the elite Open Men field is unusually deep. Sub-65 finish puts you in serious company." },
      { title: "Field", detail: "Open Men sub-70 is a top-20% finish at Paris. Doubles fields, especially Mixed and Women's, are particularly competitive." },
    ],
  },
  {
    slug: "amsterdam",
    city: "Amsterdam",
    country: "Netherlands",
    countryCode: "NL",
    citySlug: "amsterdam",
    tagline: "Netherlands' flagship Hyrox stop. Strong cycling and rowing crossover, fast Open field.",
    intro: [
      "Amsterdam is the largest Hyrox event in the Netherlands and one of the fastest-growing stops in Europe. The Dutch field is unusually strong on the engine side of the race because of the country's deep cycling and rowing culture. Search variations include Hyrox Amsterdam, Hyrox lessen Amsterdam (Dutch for Hyrox classes), and Hyrox workout Amsterdam.",
      "If you're based in the Netherlands, Belgium, or western Germany, Amsterdam is your closest serious A-race. Schiphol-to-venue travel is straightforward and most international airlines route through it.",
    ],
    cityNotes: [
      { title: "Venue", detail: "Amsterdam Hyrox typically uses RAI Amsterdam in Zuid. Modern venue with reliable AC, wide sled lanes, and good wall-ball lighting." },
      { title: "Travel", detail: "Metro line 51 (Amstelveenlijn) stops at RAI station. Stay in Zuid, De Pijp, or Oud-Zuid for the shortest transit." },
      { title: "Pacing", detail: "Dutch athletes go out fast on rowing — the front-pack splits there can be deceptively quick. Race your own row pace; you'll catch them on sandbag lunges." },
      { title: "Field", detail: "Sub-72 Open Men is a top-25% finish at Amsterdam. Open Women's field is one of the most competitive in continental Europe." },
    ],
  },
  {
    slug: "stockholm",
    city: "Stockholm",
    country: "Sweden",
    countryCode: "SE",
    citySlug: "stockholm",
    tagline: "Sweden's largest Hyrox stop. Strong CrossFit and Sats crossover, deep masters field.",
    intro: [
      "Stockholm is the largest Hyrox event in Sweden and the central hub of the Nordic Hyrox community. The race draws athletes from across Sweden plus Norway, Denmark, and Finland. The local field has a deep masters category — the Swedish 40+ and 45+ age groups are some of the most competitive in Europe.",
      "If you're based anywhere in Scandinavia, Stockholm is a strong A-race choice. Hyrox-affiliated training clubs across the city run Hyrox-specific prep classes year-round.",
    ],
    cityNotes: [
      { title: "Venue", detail: "Stockholm Hyrox typically uses Stockholmsmässan in Älvsjö, Sweden's largest exhibition centre. The venue is modern with good AC and consistent flooring." },
      { title: "Travel", detail: "Pendeltåg commuter rail from T-Centralen to Älvsjö is 12 minutes. Stay near Södermalm or Vasastan for short transit and good post-race food." },
      { title: "Pacing", detail: "Stockholm waves run cool — the hall stays at a comfortable temperature even in summer. You can warm up shorter than at warmer European venues." },
      { title: "Field", detail: "Sub-72 Open Men is a top-25% finish at Stockholm. Masters fields (40+, 45+, 50+) are particularly competitive." },
    ],
  },
  {
    slug: "singapore",
    city: "Singapore",
    country: "Singapore",
    countryCode: "SG",
    citySlug: "singapore",
    tagline: "Southeast Asia's flagship Hyrox stop. Singapore Expo venue, growing regional field.",
    intro: [
      "Singapore is the largest Hyrox event in Southeast Asia and a major travel destination for athletes from Malaysia, Thailand, Indonesia, the Philippines, and Australia. The local field has grown quickly out of the city's CrossFit and F45 ecosystems and now fields a respectable Pro division.",
      "If you're based anywhere in Southeast Asia, Singapore is the obvious A-race. Travel-wise Changi Airport sits 25 minutes by MRT from most central hotels, and the venue is well-connected on the East-West line.",
    ],
    cityNotes: [
      { title: "Venue", detail: "Singapore Expo in Changi has reliable AC, large halls, and standard sled-lane layouts. The venue runs cool by Singapore standards." },
      { title: "Travel", detail: "MRT East-West line to Expo station puts you at the venue door. Stay around Marina Bay, Bugis, or Tanjong Pagar for short transit." },
      { title: "Pacing", detail: "Indoor venues are AC-controlled but humidity outside the hall is consistently high. Hydrate aggressively in the 24 hours before your wave, not just on race morning." },
      { title: "Field", detail: "Sub-75 Open Men is a top-25% finish at Singapore. Doubles Mixed is the fastest-growing division." },
    ],
  },
  {
    slug: "toronto",
    city: "Toronto",
    country: "Canada",
    countryCode: "CA",
    citySlug: "toronto",
    tagline: "Canada's flagship Hyrox stop. Enercare Centre venue, strong CrossFit and hockey crossover.",
    intro: [
      "Toronto is the largest Hyrox event in Canada and the natural A-race for athletes across Ontario, Quebec, and the US Northeast. The local field skews toward CrossFit-trained athletes plus a strong contingent from the city's hockey and rugby communities, which builds a deep Doubles and Relay turnout.",
      "If you're based in Canada, Toronto is your domestic A-race. Travel-wise both Toronto Pearson and Billy Bishop airports serve the city well, with the venue itself easily reached by the 509 streetcar.",
    ],
    cityNotes: [
      { title: "Venue", detail: "Toronto Hyrox typically uses the Enercare Centre at Exhibition Place on the lakefront. Modern venue with reliable AC and wide sled lanes." },
      { title: "Travel", detail: "509 streetcar from Union Station to Exhibition Loop is 12 minutes. Stay around the Entertainment District or King West for short transit." },
      { title: "Pacing", detail: "Canadian Hyrox waves run technical with conservative front-end pacing. Open is a great target if you're using Toronto as your first race; the field is forgiving on first-time errors." },
      { title: "Field", detail: "Sub-75 Open Men is a top-25% finish at Toronto. Doubles fields are particularly competitive." },
    ],
  },
  {
    slug: "melbourne",
    city: "Melbourne",
    country: "Australia",
    countryCode: "AU",
    citySlug: "melbourne",
    tagline: "Australia's second-largest Hyrox stop after Sydney. Strong AFL and CrossFit crossover.",
    intro: [
      "Melbourne is Australia's second Hyrox city after Sydney and historically one of the strongest stops in the APAC region for masters athletes. The local field draws from the city's deep CrossFit, AFL, and rowing communities. Searches for Hyrox Melbourne, hyrox training Melbourne, and Hyrox gym Melbourne all surface heavy local interest.",
      "If you're based in Victoria or Tasmania, Melbourne is your closest serious A-race. The city's Hyrox-affiliated training clubs are concentrated in Richmond, Cremorne, and South Yarra.",
    ],
    cityNotes: [
      { title: "Venue", detail: "Past Melbourne Hyrox events have used the Melbourne Showgrounds and the Melbourne Convention and Exhibition Centre. Both are large, well-ventilated, and travel-friendly." },
      { title: "Travel", detail: "Tram lines from the CBD reach both Showgrounds and MCEC in 15-25 minutes. Stay in Southbank or the CBD for shortest transit." },
      { title: "Pacing", detail: "Melbourne weather can swing dramatically in shoulder seasons. Even though the venue is indoor, your pre-race warm-up walk to the venue varies by 15°C between morning and afternoon waves — adjust warm-up duration accordingly." },
      { title: "Field", detail: "Sub-75 Open Men is a top-30% finish at Melbourne. Masters categories (40+, 45+) are particularly deep." },
    ],
  },
  {
    slug: "dallas",
    city: "Dallas",
    country: "United States",
    countryCode: "US",
    citySlug: "dallas",
    tagline: "Texas's flagship Hyrox stop. Kay Bailey Hutchison Convention Center venue, deep US Open field.",
    intro: [
      "Dallas hosts one of the largest Hyrox events in North America. The race runs over five extended days at the Kay Bailey Hutchison Convention Center in downtown Dallas, with a field that draws from across Texas, Oklahoma, Arkansas, Louisiana, and the broader US south.",
      "If you're based anywhere in the south-central US, Dallas is the obvious A-race. Travel-wise both DFW and Love Field serve the city well, with the convention centre walkable from most downtown hotels.",
    ],
    cityNotes: [
      { title: "Venue", detail: "Kay Bailey Hutchison Convention Center is one of the largest Hyrox venues in the world. Hall sizes mean wide sled lanes and minimal queueing." },
      { title: "Travel", detail: "DART light rail Convention Center station serves the venue directly. Stay around Main Street, the Arts District, or Deep Ellum for short transit." },
      { title: "Pacing", detail: "Dallas afternoon waves can run hot if the venue's HVAC struggles on a peak weekend. Target a morning wave for the fastest finish." },
      { title: "Field", detail: "Sub-72 Open Men is a top-25% finish at Dallas. The Pro Men field is the deepest in the US south." },
    ],
  },
  {
    slug: "munich",
    city: "Munich",
    country: "Germany",
    countryCode: "DE",
    citySlug: "munich",
    tagline: "Bavaria's Hyrox hub city. Locally known as Hyrox München. Not on the 2026 calendar.",
    intro: [
      "Munich (München in German) has historically been one of the strongest German Hyrox markets. The 2026 season does not include a Munich race, with German athletes funnelling to Hamburg, Frankfurt, and Düsseldorf instead. The Munich training-club ecosystem remains active and runs the largest Hyrox prep classes in southern Germany.",
      "If you're based in Munich and racing the 2026 German calendar, Hamburg or Frankfurt are your closest options. Munich's Hyrox-affiliated clubs run weekly race-rehearsal sessions through autumn.",
    ],
    cityNotes: [
      { title: "2026 status", detail: "Munich is not on the 2026 Hyrox calendar. The closest German races are Hamburg (October-November) and Frankfurt (December)." },
      { title: "Training", detail: "Munich's Hyrox-affiliated clubs are concentrated in Schwabing, Maxvorstadt, and around Marienplatz. Most run weekly Hyrox simulation classes." },
      { title: "Travel", detail: "ICE high-speed rail Munich to Frankfurt is 3 hours 15 minutes. Munich to Hamburg is 5 hours 45 minutes. Both are workable for race weekend." },
      { title: "Field", detail: "When Munich has hosted, Open Men sub-72 has been a top-25% finish. The Bavarian field is particularly strong on the engine side." },
    ],
  },
  {
    slug: "zurich",
    city: "Zurich",
    country: "Switzerland",
    countryCode: "CH",
    citySlug: "zurich",
    tagline: "Switzerland's largest Hyrox training hub. Locally known as Hyrox Zürich. Not on the 2026 Zurich calendar.",
    intro: [
      "Zurich (Zürich in German, Zurigo in Italian) is the centre of the Swiss Hyrox community. The 2026 Hyrox calendar moves the Zurich-area race to Geneva, with St Gallen also returning in January. Searches for Hyrox Zurich 2026, Hyrox Schweiz 2026, and Hyrox Svizzera 2026 mostly route here.",
      "If you're based in Zurich and racing the 2026 Swiss calendar, St Gallen (1 hour by train) or Geneva (3 hours) are your domestic options. Zurich's Hyrox-affiliated clubs run weekly Hyrox classes year-round.",
    ],
    cityNotes: [
      { title: "2026 status", detail: "Zurich is not on the 2026 Hyrox calendar. Swiss athletes race St Gallen (January) or Geneva, plus Hyrox Munich/Hamburg over the German border in past seasons when Munich was active." },
      { title: "Training", detail: "Zurich's Hyrox-affiliated clubs are concentrated in Kreis 4, Kreis 5, and around Sihlcity. Most run weekly Hyrox simulation classes through autumn." },
      { title: "Travel", detail: "SBB rail Zurich HB to St Gallen is 1 hour 5 minutes. Zurich to Geneva is 2 hours 45 minutes. Both are workable for race weekend." },
      { title: "Field", detail: "Swiss Hyrox racers are typically endurance-trained — running splits at Swiss races run faster than the European average. Plan your run pacing accordingly." },
    ],
  },
];

export function getCityEvergreen(slug: string): CityEvergreen | undefined {
  return CITY_EVERGREENS.find((c) => c.slug === slug);
}
