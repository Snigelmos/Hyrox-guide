/**
 * Hyrox event results dataset.
 *
 * After each race weekend, populate one entry per city to power the
 * `/events/[year]/[city]/results/` recap page. The page renders gracefully
 * with a "results pending" state when no entry exists yet — so the URL
 * is reserved and indexable from day one.
 *
 * Source data: results published on hyrox.com leaderboards within 24-48
 * hours of the final wave. Histogram buckets are aggregated finish-time
 * distributions across the Open Singles divisions unless noted.
 */

/**
 * A single segment of a Hyrox race for split-time analysis.
 *
 * Hyrox is structured as 8 × (1 km run + 1 functional station). We use the
 * 16-leg granularity by default — 8 runs alternating with 8 stations —
 * because that's what hyresult.com publishes and what athletes use to
 * compare splits. The leg names below match the canonical official order.
 */
export interface StationSplit {
  segment: string; // "Run 1", "SkiErg", "Run 2", "Sled Push", ...
  segmentTime: string; // mm:ss for this leg
  cumulativeTime?: string; // h:mm:ss running total at end of this leg
}

/** Canonical leg order for a standard Singles Hyrox race. */
export const HYROX_SEGMENTS = [
  "Run 1",
  "SkiErg",
  "Run 2",
  "Sled Push",
  "Run 3",
  "Sled Pull",
  "Run 4",
  "Burpee Broad Jumps",
  "Run 5",
  "Rowing",
  "Run 6",
  "Farmers Carry",
  "Run 7",
  "Sandbag Lunges",
  "Run 8",
  "Wall Balls",
] as const;

export interface PodiumEntry {
  rank: 1 | 2 | 3;
  athlete: string;
  time: string; // h:mm:ss
  country?: string; // ISO
  team?: string;
  /** Short tag like "World record", "Personal best", "Pro debut". */
  notes?: string;
  /** Per-segment splits for marquee winners. Render in the splits accordion. */
  splits?: StationSplit[];
}

export interface DivisionResult {
  division: string; // "Open Men", "Pro Women", "Doubles Mixed", etc.
  athleteCount?: number;
  fastestTime?: string;
  medianTime?: string;
  podium?: PodiumEntry[];
}

export interface FinishTimeBucket {
  bucket: string; // "<60 min", "60-65 min", etc.
  count: number;
}

export interface RaceResult {
  year: number;
  citySlug: string;
  recapPublished: string; // YYYY-MM-DD when this recap was posted
  totalAthletes?: number;
  notableStories?: string[];
  divisions: DivisionResult[];
  histogram?: FinishTimeBucket[];
  takeaways?: string[];
}

export const RACE_RESULTS: RaceResult[] = [
  // ====================================================================
  // 2026 Season results — populated as events complete.
  // Source: hyrox.com/results, hyresult.com, and official press coverage.
  // Listed in chronological order. Events without published podium data
  // still get a recap with athlete count and a link to the official
  // leaderboard so the /results/ page renders something useful.
  // ====================================================================

  // ---- St Gallen (Jan 16–18) -----------------------------------------
  {
    year: 2026,
    citySlug: "st-gallen",
    recapPublished: "2026-01-20",
    notableStories: [
      "The second edition of Hyrox in St Gallen kicked off the 2026 European calendar at OLMA Messen.",
      "The race weekend continued Hyrox's expansion across the DACH region, drawing athletes from Switzerland, Germany, and Austria.",
    ],
    divisions: [
      { division: "Pro Men" },
      { division: "Pro Women" },
      { division: "Open Men" },
      { division: "Open Women" },
    ],
    takeaways: [
      "Early-season races are a great way to set a baseline before the bigger spring events — Vienna, Cologne, and Berlin all follow within weeks.",
    ],
  },

  // ---- Manchester (Jan 21–25) ----------------------------------------
  {
    year: 2026,
    citySlug: "manchester",
    recapPublished: "2026-01-27",
    totalAthletes: 15890,
    notableStories: [
      "Charlie Botterill won the Pro Men in 55:16 — the start of a stellar season that would later see him take Glasgow Pro Men with a 16-24 age-group world record.",
      "Poppy Jones took the Pro Women title in 1:01:18 at Manchester Central.",
      "Saskia Millard and Holly Archer won the Pro Doubles Women in 57:11; Graham Halliday and Liam McCroary took Pro Doubles Men in 50:54.",
    ],
    divisions: [
      {
        division: "Pro Men",
        podium: [
          { rank: 1, athlete: "Charlie Botterill", time: "0:55:16", country: "GB" },
          { rank: 2, athlete: "Harry Thompson", time: "0:56:14", country: "GB" },
          { rank: 3, athlete: "Marc Dean", time: "0:56:23", country: "GB" },
        ],
      },
      {
        division: "Pro Women",
        podium: [
          { rank: 1, athlete: "Poppy Jones", time: "1:01:18", country: "GB" },
          { rank: 2, athlete: "Amy Middlemast", time: "1:05:39", country: "GB" },
          { rank: 3, athlete: "Yolanda King", time: "1:06:07", country: "GB" },
        ],
      },
      {
        division: "Pro Doubles Men",
        podium: [
          { rank: 1, athlete: "Graham Halliday & Liam McCroary", time: "0:50:54", country: "GB" },
        ],
      },
      {
        division: "Pro Doubles Women",
        podium: [
          { rank: 1, athlete: "Saskia Millard & Holly Archer", time: "0:57:11", country: "GB" },
        ],
      },
    ],
    takeaways: [
      "Manchester's expanded five-day format set the pace for the 2026 season — sold-out weekend waves became the new normal.",
    ],
  },

  // ---- Amsterdam (Jan 21–25) -----------------------------------------
  {
    year: 2026,
    citySlug: "amsterdam",
    recapPublished: "2026-01-27",
    totalAthletes: 11841,
    notableStories: [
      "Hidde Weersma (Netherlands) won Pro Men in 54:15 — a personal best that put him 6th on the all-time fastest Pro Men list.",
      "Svenja Sommer took the Pro Women title in 1:02:52.",
      "Lola Gomes and Apolline Cardon won Pro Doubles Women in 57:21, building momentum that would carry through to a Paris Pro Doubles win in April.",
    ],
    divisions: [
      {
        division: "Pro Men",
        podium: [
          { rank: 1, athlete: "Hidde Weersma", time: "0:54:15", country: "NL" },
          { rank: 2, athlete: "Maarten Enthoven", time: "0:56:04", country: "NL" },
          { rank: 3, athlete: "Julien Coquillaud-Salomon", time: "0:56:20", country: "FR" },
        ],
      },
      {
        division: "Pro Women",
        podium: [
          { rank: 1, athlete: "Svenja Sommer", time: "1:02:52", country: "DE" },
          { rank: 2, athlete: "Michaela Disseldorp", time: "1:03:29", country: "NL" },
          { rank: 3, athlete: "Charlotte Vandenlindenloof", time: "1:04:29", country: "FR" },
        ],
      },
      {
        division: "Pro Doubles Men",
        podium: [
          { rank: 1, athlete: "Louis Osselaer & Maarten Enthoven", time: "0:49:45", country: "BE" },
        ],
      },
      {
        division: "Pro Doubles Women",
        podium: [
          { rank: 1, athlete: "Lola Gomes & Apolline Cardon", time: "0:57:21", country: "FR" },
        ],
      },
    ],
    takeaways: [
      "Hidde Weersma's 54:15 was the early benchmark of the 2026 Pro season — within months, Roncevic, Wenisch, and Weersma himself would all push the record below 53 minutes.",
    ],
  },

  // ---- Auckland (Jan 29–Feb 1) ---------------------------------------
  {
    year: 2026,
    citySlug: "auckland",
    recapPublished: "2026-02-03",
    totalAthletes: 9368,
    notableStories: [
      "Hyrox returned to New Zealand for its second Auckland edition — over 9,000 athletes raced across four days at the Auckland Showgrounds.",
      "The event served as the southern-hemisphere pre-season warm-up before the APAC Championships in Brisbane.",
    ],
    divisions: [
      { division: "Pro Men" },
      { division: "Pro Women" },
      { division: "Open Men" },
      { division: "Open Women" },
    ],
    takeaways: [
      "Auckland's 9,368 finishers confirmed New Zealand's appetite for Hyrox — the country now ranks among the fastest-growing markets per capita.",
    ],
  },

  // ---- Phoenix (Jan 29–Feb 1) — MAJOR --------------------------------
  {
    year: 2026,
    citySlug: "phoenix",
    recapPublished: "2026-02-03",
    totalAthletes: 9784,
    notableStories: [
      "Alexander Roncevic (Austria) won Elite 15 Men in 53:16 — at the time, the fastest Hyrox finish in history.",
      "Joanna Wietrzyk (Australia) shattered the women's world record with 56:03, beginning her unprecedented Grand Slam season of four Major wins.",
      "Emilie Dahmen (Netherlands) took the Pro Women race in 1:00:18.",
    ],
    divisions: [
      {
        division: "Elite 15 Men",
        athleteCount: 15,
        fastestTime: "0:53:16",
        podium: [
          {
            rank: 1,
            athlete: "Alexander Roncevic",
            time: "0:53:16",
            country: "AT",
            notes: "1 second off his own world record",
          },
        ],
      },
      {
        division: "Elite 15 Women",
        athleteCount: 15,
        fastestTime: "0:56:03",
        podium: [
          {
            rank: 1,
            athlete: "Joanna Wietrzyk",
            time: "0:56:03",
            country: "AU",
            notes: "World record (broke previous mark by 20s)",
          },
        ],
      },
      {
        division: "Pro Women",
        athleteCount: 788,
        podium: [
          { rank: 1, athlete: "Emilie Dahmen", time: "1:00:18", country: "NL" },
        ],
      },
      { division: "Pro Men", athleteCount: 835 },
    ],
    takeaways: [
      "Phoenix's debut Major delivered two world records on the same day — proof that Hyrox times are still falling rapidly at the top end.",
      "State Farm Stadium's controlled climate gave athletes a level playing field; expect future Majors to favor enclosed stadium venues.",
    ],
  },

  // ---- Osaka (Jan 30–Feb 1) ------------------------------------------
  {
    year: 2026,
    citySlug: "osaka",
    recapPublished: "2026-02-04",
    notableStories: [
      "AirAsia Hyrox Osaka brought a full race weekend back to Japan, building on Hyrox's growing APAC footprint.",
      "Athletes from across Japan, Korea, Singapore, and Australia raced at INTEX Osaka.",
    ],
    divisions: [
      { division: "Pro Men" },
      { division: "Pro Women" },
      { division: "Open Men" },
      { division: "Open Women" },
    ],
    takeaways: [
      "Japan's market continues to grow steadily — Osaka will be joined by Chiba in August, doubling Japanese hosting capacity in 2026.",
    ],
  },

  // ---- Turin (Jan 30–Feb 1) ------------------------------------------
  {
    year: 2026,
    citySlug: "turin",
    recapPublished: "2026-02-04",
    totalAthletes: 11530,
    notableStories: [
      "Hugo Hugemark won the Pro Men in 57:55 at the historic Oval Lingotto.",
      "Caroline Whittingham took the Pro Women title in 1:07:51 in front of a packed Italian crowd.",
      "Igor Arruti Salgado and Aitor Lizarazu Hormilla won the Pro Doubles Men in 52:21.",
    ],
    divisions: [
      {
        division: "Pro Men",
        athleteCount: 442,
        podium: [
          { rank: 1, athlete: "Hugo Hugemark", time: "0:57:55", country: "SE" },
          { rank: 2, athlete: "Quentin Garel", time: "0:58:20", country: "FR" },
          { rank: 3, athlete: "Oli Fricker", time: "0:58:50", country: "GB" },
        ],
      },
      {
        division: "Pro Women",
        athleteCount: 107,
        podium: [
          { rank: 1, athlete: "Caroline Whittingham", time: "1:07:51", country: "GB" },
          { rank: 2, athlete: "Camilla Tavecchio", time: "1:09:14", country: "IT" },
          { rank: 3, athlete: "Meriam Loughzal", time: "1:09:44", country: "FR" },
        ],
      },
    ],
    takeaways: [
      "Turin's third edition cemented the Oval Lingotto as one of Italy's marquee Hyrox venues — Bologna and Rimini joined the calendar later in the year.",
    ],
  },

  // ---- Vienna (Feb 6–8) ----------------------------------------------
  {
    year: 2026,
    citySlug: "vienna",
    recapPublished: "2026-02-10",
    totalAthletes: 9926,
    notableStories: [
      "Vienna's first three-day Hyrox drew athletes from over 70 nations to Messe Wien.",
      "Creapure-sponsored event with 193 male and 125 female Pro athletes plus over 700 doubles teams.",
      "Hometown hero Alexander Roncevic — who began his Hyrox career in Vienna in 2018 — featured prominently in race-week coverage.",
    ],
    divisions: [
      { division: "Pro Men", athleteCount: 193 },
      { division: "Pro Women", athleteCount: 125 },
    ],
    takeaways: [
      "The expanded three-day format was a hit and is now expected to roll out at Hyrox stops across central Europe.",
    ],
  },

  // ---- Guadalajara (Feb 7–8) -----------------------------------------
  {
    year: 2026,
    citySlug: "guadalajara",
    recapPublished: "2026-02-10",
    notableStories: [
      "Smart Fit Hyrox Guadalajara returned to Mexico for a two-day race weekend at Expo Guadalajara.",
      "The race kicked off Hyrox's expanded 2026 Latin American footprint, which would later include Cancun, Monterrey, Puebla, Acapulco, and Mexico City.",
    ],
    divisions: [
      { division: "Singles" },
      { division: "Doubles" },
      { division: "Relay" },
    ],
    takeaways: [
      "Mexico is now Hyrox's fastest-growing Spanish-speaking market — five separate Mexican stops feature on the 2026 calendar.",
    ],
  },

  // ---- Bilbao (Feb 7–8) ----------------------------------------------
  {
    year: 2026,
    citySlug: "bilbao",
    recapPublished: "2026-02-10",
    notableStories: [
      "Harry Thompson (UK) won the Pro Men in 54:55 — a personal best in Barakaldo.",
      "Melanie Maurer (Switzerland) took the Pro Women title in 1:01:03.",
      "Xavier Dufour and Martin Lecorgne (both France) won the Pro Doubles Men in 49:56 — a sub-50 finish.",
    ],
    divisions: [
      {
        division: "Pro Men",
        podium: [
          { rank: 1, athlete: "Harry Thompson", time: "0:54:55", country: "GB" },
          { rank: 2, athlete: "Graham Halliday", time: "0:56:22", country: "GB" },
          { rank: 3, athlete: "Pablo Sánchez Santos", time: "0:56:37", country: "ES" },
        ],
      },
      {
        division: "Pro Women",
        podium: [
          { rank: 1, athlete: "Melanie Maurer", time: "1:01:03", country: "CH" },
          { rank: 2, athlete: "Charlotte Haglund", time: "1:02:17", country: "SE" },
          { rank: 3, athlete: "Shaunie Gibson", time: "1:07:12", country: "GB" },
        ],
      },
      {
        division: "Pro Doubles Men",
        podium: [
          { rank: 1, athlete: "Xavier Dufour & Martin Lecorgne", time: "0:49:56", country: "FR" },
        ],
      },
    ],
  },

  // ---- Nice (Feb 12–15) ----------------------------------------------
  {
    year: 2026,
    citySlug: "nice",
    recapPublished: "2026-02-17",
    totalAthletes: 14269,
    notableStories: [
      "Xavier Dufour (France) won the Pro Men in 55:51, coming within 8 seconds of the French record after improving his time by 15 minutes in 12 months.",
      "Elli Stenfors (Finland) took the Pro Women in 1:01:04 with a world-class strength-station performance.",
      "Quentin Garel and Alan Cao won the Pro Doubles Men in 50:02 — a result the same pair would later improve at Paris.",
    ],
    divisions: [
      {
        division: "Pro Men",
        podium: [
          { rank: 1, athlete: "Xavier Dufour", time: "0:55:51", country: "FR" },
          { rank: 2, athlete: "Quentin Garel", time: "0:56:56", country: "FR" },
          { rank: 3, athlete: "Alexis Bernier", time: "0:57:10", country: "FR" },
        ],
      },
      {
        division: "Pro Women",
        podium: [
          { rank: 1, athlete: "Elli Stenfors", time: "1:01:04", country: "FI" },
          { rank: 2, athlete: "Ida Mathilde Steensgaard", time: "1:01:29", country: "DK" },
          { rank: 3, athlete: "Ambre Keram", time: "1:04:08", country: "FR" },
        ],
      },
      {
        division: "Pro Doubles Men",
        podium: [
          { rank: 1, athlete: "Quentin Garel & Alan Cao", time: "0:50:02", country: "FR" },
        ],
      },
    ],
    takeaways: [
      "Nice's combination of Mediterranean weather and a major venue made it a destination race — over 14,000 athletes for a four-day event is a benchmark for similar mid-tier European stops.",
    ],
  },

  // ---- Istanbul (Feb 13–14) ------------------------------------------
  {
    year: 2026,
    citySlug: "istanbul",
    recapPublished: "2026-02-16",
    notableStories: [
      "Hyrox's debut in Türkiye — a two-day race introducing the format to a brand new regional audience.",
      "Yeşilköy Istanbul Fuar Merkezi hosted athletes from across Türkiye, Greece, and the Balkans.",
    ],
    divisions: [
      { division: "Singles" },
      { division: "Doubles" },
    ],
    takeaways: [
      "Türkiye's debut was successful enough to warrant a second 2026 stop — Istanbul returns August 1–2.",
    ],
  },

  // ---- Las Vegas (Feb 20–22) — MAJOR ---------------------------------
  {
    year: 2026,
    citySlug: "las-vegas",
    recapPublished: "2026-02-24",
    totalAthletes: 17615,
    notableStories: [
      "Jack Driscoll (USA) won the Pro Men in 56:16 at Mandalay Bay Convention Center.",
      "Alyssa McElheny took Pro Women in 1:00:55 — the fastest Pro Women debut in Hyrox history.",
      "Hunter McIntyre and Cole Learn won Pro Doubles Men in 48:51, finishing just 20 seconds shy of the world record.",
    ],
    divisions: [
      {
        division: "Pro Men",
        podium: [
          { rank: 1, athlete: "Jack Driscoll", time: "0:56:16", country: "US" },
          { rank: 2, athlete: "Greyson Kilgore", time: "0:56:53", country: "US" },
          { rank: 3, athlete: "Aldo Lozano Marquez", time: "1:00:05", country: "MX" },
        ],
      },
      {
        division: "Pro Women",
        podium: [
          { rank: 1, athlete: "Alyssa McElheny", time: "1:00:55", country: "US" },
          { rank: 2, athlete: "Rachael Wade", time: "1:01:01", country: "US" },
          { rank: 3, athlete: "Kris Rugloski", time: "1:04:40", country: "US" },
        ],
      },
      {
        division: "Pro Doubles Men",
        podium: [
          { rank: 1, athlete: "Hunter McIntyre & Cole Learn", time: "0:48:51", country: "US" },
        ],
      },
      {
        division: "Pro Doubles Women",
        podium: [
          { rank: 1, athlete: "Sydney Wells & Lauren Griffith", time: "0:58:50", country: "US" },
        ],
      },
    ],
    takeaways: [
      "Las Vegas now sits comfortably above 17,000 athletes — North America's biggest Hyrox prior to New York's two-weekend event in May.",
      "Alyssa McElheny's 1:00:55 Pro debut redefined what's possible from a first-time Pro racer.",
    ],
  },

  // ---- Katowice (Feb 21–22) ------------------------------------------
  {
    year: 2026,
    citySlug: "katowice",
    recapPublished: "2026-02-24",
    totalAthletes: 4862,
    notableStories: [
      "Tomas Tvrdik (Czech Republic) won the Pro Men in 55:04 — a result that helped lock in his Warsaw Major Elite 15 spot two months later.",
      "Chloe Cook (UK), a former triathlete, won the Pro Women in 1:00:04, narrowly missing sub-60.",
      "Sean Noble & Oli Fricker won the Pro Doubles Men in 50:11.",
    ],
    divisions: [
      {
        division: "Pro Men",
        podium: [
          { rank: 1, athlete: "Tomas Tvrdik", time: "0:55:04", country: "CZ" },
          { rank: 2, athlete: "Graham Halliday", time: "0:55:16", country: "GB" },
          { rank: 3, athlete: "Julien Coquillaud-Salomon", time: "0:55:30", country: "FR" },
        ],
      },
      {
        division: "Pro Women",
        podium: [
          { rank: 1, athlete: "Chloe Cook", time: "1:00:04", country: "GB" },
          { rank: 2, athlete: "Stefanie Oswald", time: "1:00:23", country: "AT" },
          { rank: 3, athlete: "Roisin Egan", time: "1:00:52", country: "IE" },
        ],
      },
      {
        division: "Pro Doubles Men",
        podium: [
          { rank: 1, athlete: "Sean Noble & Oli Fricker", time: "0:50:11", country: "IE" },
        ],
      },
      {
        division: "Pro Doubles Women",
        podium: [
          { rank: 1, athlete: "Ida Mathilde Steensgaard & Elli Stenfors", time: "0:54:45", country: "DK" },
        ],
      },
    ],
  },

  // ---- Fortaleza (Feb 28) --------------------------------------------
  {
    year: 2026,
    citySlug: "fortaleza",
    recapPublished: "2026-03-02",
    notableStories: [
      "Hyrox's third edition in Brazil drew athletes from across the country and neighboring South American markets.",
      "The one-day race format suited the growing Northeast Brazilian Hyrox community.",
    ],
    divisions: [
      { division: "Singles" },
      { division: "Doubles" },
    ],
    takeaways: [
      "Brazil's Hyrox calendar expanded again in 2026 — São Paulo (April + October) and Rio (November) joined Fortaleza on the schedule.",
    ],
  },

  // ---- Taipei (Feb 28–Mar 1) -----------------------------------------
  {
    year: 2026,
    citySlug: "taipei",
    recapPublished: "2026-03-03",
    notableStories: [
      "Biotherm Hyrox Taipei brought a full Hyrox weekend back to Taiwan.",
      "The two-day format included Pro, Open, Doubles, and Relay divisions across the weekend.",
    ],
    divisions: [
      { division: "Singles" },
      { division: "Doubles" },
      { division: "Relay" },
    ],
  },

  // ---- Washington DC (Mar 7–8) — Americas Championships --------------
  {
    year: 2026,
    citySlug: "washington-dc",
    recapPublished: "2026-03-10",
    totalAthletes: 7773,
    notableStories: [
      "Cole Learn (USA) won the Elite 15 Men's race, securing the single Americas Regional Championship World Championship qualification slot.",
      "Lauren Weeks (USA) won the Elite 15 Women's race; second-place Vivian Tafuto and third-place Morgan Schulz also qualified for Worlds via roll-down.",
      "Frédéric Dubé (Canada) took third in Men's Elite 15.",
    ],
    divisions: [
      {
        division: "Elite 15 Men",
        athleteCount: 15,
        podium: [
          { rank: 1, athlete: "Cole Learn", time: "—", country: "US" },
          { rank: 2, athlete: "Dylan Scott", time: "—", country: "US" },
          { rank: 3, athlete: "Frédéric Dubé", time: "—", country: "CA" },
        ],
      },
      {
        division: "Elite 15 Women",
        athleteCount: 15,
        podium: [
          { rank: 1, athlete: "Lauren Weeks", time: "—", country: "US" },
          { rank: 2, athlete: "Vivian Tafuto", time: "—", country: "US" },
          { rank: 3, athlete: "Morgan Schulz", time: "—", country: "US" },
        ],
      },
    ],
    takeaways: [
      "Regional Championships only award a single direct World Championship slot per division — making Washington DC's Americas Champs the highest-stakes single race on the 2026 NA calendar.",
      "USA athletes swept all six Elite 15 podium positions, underlining the depth of the American Pro field.",
    ],
  },

  // ---- Glasgow (Mar 11–15) -------------------------------------------
  {
    year: 2026,
    citySlug: "glasgow",
    recapPublished: "2026-03-17",
    totalAthletes: 20000,
    notableStories: [
      "Charlie Botterill (UK) won the Pro Men in 54:38 — setting a new 16–24 age-group world record in the process.",
      "Stefanie Oswald (Austria) took the Pro Women title in 1:01:34.",
      "Glasgow's expanded five-day format hosted approximately 20,000 athletes — comparable to Manchester earlier in the year.",
    ],
    divisions: [
      {
        division: "Pro Men",
        podium: [
          { rank: 1, athlete: "Charlie Botterill", time: "0:54:38", country: "GB" },
        ],
      },
      {
        division: "Pro Women",
        podium: [
          { rank: 1, athlete: "Stefanie Oswald", time: "1:01:34", country: "AT" },
        ],
      },
    ],
    takeaways: [
      "The UK now hosts Manchester (Jan), Glasgow (Mar), London (Mar + Dec), Cardiff (Apr), and Birmingham (Oct) — five separate cities with multi-day Hyrox events.",
    ],
  },

  // ---- Copenhagen (Mar 13–15) ----------------------------------------
  {
    year: 2026,
    citySlug: "copenhagen",
    recapPublished: "2026-03-17",
    notableStories: [
      "Gustav Cordua (Denmark) won the Pro Men in 55:29 — a Danish record.",
      "Sebastian Ifversen finished second in Pro Men just 6 seconds behind Cordua.",
    ],
    divisions: [
      {
        division: "Pro Men",
        podium: [
          { rank: 1, athlete: "Gustav Cordua", time: "0:55:29", country: "DK" },
          { rank: 2, athlete: "Sebastian Ifversen", time: "0:55:35", country: "DK" },
          { rank: 3, athlete: "Erik Oscar Bøe", time: "0:56:05", country: "NO" },
        ],
      },
    ],
    takeaways: [
      "A Danish men's national record fell in Copenhagen — Scandinavia's depth at the Pro level continues to surprise.",
    ],
  },

  // ---- Cancun (Mar 14–15) --------------------------------------------
  {
    year: 2026,
    citySlug: "cancun",
    recapPublished: "2026-03-17",
    notableStories: [
      "Hyrox arrived on Mexico's Caribbean coast for the first time — a Smart Fit-sponsored two-day race.",
      "The Cancun stop drew athletes from across Latin America and US-based Hispanic Hyrox communities.",
    ],
    divisions: [
      { division: "Singles" },
      { division: "Doubles" },
    ],
  },

  // ---- Toulouse (Mar 19–22) ------------------------------------------
  {
    year: 2026,
    citySlug: "toulouse",
    recapPublished: "2026-03-24",
    notableStories: [
      "Quentin Garel (France) won the Pro Men in 56:15 — his second Pro win of the season.",
      "Alyssa McElheny (USA) won the Pro Women in 58:26, breaking the 60-minute barrier and qualifying for the Warsaw Elite 15.",
      "Olivier Jouve and Dimitry Martins won the Pro Doubles Men in 51:12 — building toward their Paris Pro Doubles podium.",
    ],
    divisions: [
      {
        division: "Pro Men",
        podium: [
          { rank: 1, athlete: "Quentin Garel", time: "0:56:15", country: "FR" },
          { rank: 2, athlete: "Tommy Valentin", time: "0:56:51", country: "FR" },
          { rank: 3, athlete: "Olivier Jouve", time: "0:57:27", country: "FR" },
        ],
      },
      {
        division: "Pro Women",
        podium: [
          { rank: 1, athlete: "Alyssa McElheny", time: "0:58:26", country: "US" },
          { rank: 2, athlete: "Gloria Corbetta", time: "1:03:02", country: "IT" },
          { rank: 3, athlete: "Ilona Frigout", time: "1:04:06", country: "FR" },
        ],
      },
    ],
    takeaways: [
      "Toulouse confirmed France's Pro Doubles depth — Garel, Jouve, and Valentin all featured prominently again at Paris.",
    ],
  },

  // ---- Bangkok (Mar 20–22) -------------------------------------------
  {
    year: 2026,
    citySlug: "bangkok",
    recapPublished: "2026-03-24",
    notableStories: [
      "BYD Hyrox Bangkok marked Thailand's first race weekend at the IMPACT Exhibition Center.",
      "The three-day format gave athletes from Thailand, Singapore, Malaysia, and Vietnam a regional Hyrox stop without traveling to Singapore National Stadium.",
    ],
    divisions: [
      { division: "Singles" },
      { division: "Doubles" },
    ],
    takeaways: [
      "Thailand's Hyrox debut was strong enough to lock in a second 2026 stop later in the year (TBC).",
    ],
  },

  // ---- Beijing (Mar 21–22) -------------------------------------------
  {
    year: 2026,
    citySlug: "beijing",
    recapPublished: "2026-03-24",
    notableStories: [
      "Hyrox's spring Beijing stop hosted athletes from across mainland China at the China National Convention Center.",
      "The race was followed by Beijing's autumn return on September 12-13, making it one of three Chinese cities (with Shanghai) hosting two 2026 events.",
    ],
    divisions: [
      { division: "Singles" },
      { division: "Doubles" },
    ],
  },

  // ---- London EMEA Championships (Mar 21–22) -------------------------
  {
    year: 2026,
    citySlug: "london-emea-championships",
    recapPublished: "2026-03-24",
    notableStories: [
      "Hidde Weersma (Netherlands) won Elite 15 Men in 52:42 — the first sub-53 minute Hyrox in history (the world record at the time).",
      "Tim Wenisch (Germany) finished second in 53:01, with Tomas Tvrdik (Czech Republic) third in 53:18.",
      "The EMEA Regional Championship awarded only one direct World Championship slot per Elite 15 division.",
    ],
    divisions: [
      {
        division: "Elite 15 Men",
        athleteCount: 15,
        fastestTime: "0:52:42",
        podium: [
          {
            rank: 1,
            athlete: "Hidde Weersma",
            time: "0:52:42",
            country: "NL",
            notes: "World record (broke Roncevic's 53:15 by 33s)",
            // Full 16-segment splits, sourced from Weersma's published record-day data.
            // Total run time 29:53 (3:45/km avg), total station time 22:49.
            splits: [
              { segment: "Run 1", segmentTime: "3:27" },
              { segment: "SkiErg", segmentTime: "3:36" },
              { segment: "Run 2", segmentTime: "3:33" },
              { segment: "Sled Push", segmentTime: "2:10" },
              { segment: "Run 3", segmentTime: "3:29" },
              { segment: "Sled Pull", segmentTime: "2:48" },
              { segment: "Run 4", segmentTime: "3:41" },
              { segment: "Burpee Broad Jumps", segmentTime: "2:09" },
              { segment: "Run 5", segmentTime: "3:34" },
              { segment: "Rowing", segmentTime: "3:49" },
              { segment: "Run 6", segmentTime: "4:01" },
              { segment: "Farmers Carry", segmentTime: "1:21" },
              { segment: "Run 7", segmentTime: "3:50" },
              { segment: "Sandbag Lunges", segmentTime: "2:51" },
              { segment: "Run 8", segmentTime: "4:27" },
              { segment: "Wall Balls", segmentTime: "4:05" },
            ],
          },
          { rank: 2, athlete: "Tim Wenisch", time: "0:53:01", country: "DE" },
          { rank: 3, athlete: "Tomas Tvrdik", time: "0:53:18", country: "CZ" },
        ],
      },
    ],
    takeaways: [
      "Weersma's 52:42 set the bar for Roncevic at Warsaw a month later — the men's record fell three times in 60 days.",
      "EMEA Regional Championships are one of the most stacked single-day races on earth — 14 of the 15 starters had already qualified for Worlds.",
    ],
  },

  // ---- London Spring (Mar 24–29) -------------------------------------
  {
    year: 2026,
    citySlug: "london-spring",
    recapPublished: "2026-03-31",
    notableStories: [
      "Charlie Botterill (UK) won the Pro Men — his second Pro Men win of the 2026 season after Manchester.",
      "Saskia Millard (UK) took the Pro Women title at ExCeL.",
      "The race ran immediately after the EMEA Regional Championships, giving sub-elite athletes their own showcase weekend at the same venue.",
    ],
    divisions: [
      {
        division: "Pro Men",
        podium: [
          { rank: 1, athlete: "Charlie Botterill", time: "—", country: "GB" },
        ],
      },
      {
        division: "Pro Women",
        podium: [
          { rank: 1, athlete: "Saskia Millard", time: "—", country: "GB" },
        ],
      },
    ],
  },

  // ---- Houston (Mar 26–29) -------------------------------------------
  {
    year: 2026,
    citySlug: "houston",
    recapPublished: "2026-03-31",
    notableStories: [
      "One of the largest American spring stops — four days of racing at NRG Center.",
      "Former NFL pro David Johnson made his Hyrox debut, closing the gap on top Pro Men times throughout the weekend.",
      "Creapure-sponsored event with strong age-group depth across all divisions.",
    ],
    divisions: [
      { division: "Pro Men" },
      { division: "Pro Women" },
      { division: "Open Men" },
      { division: "Open Women" },
    ],
    takeaways: [
      "Houston's growth into a four-day stop reflects the explosive pace of US Hyrox adoption — Texas now hosts both Houston and Dallas in 2026.",
    ],
  },

  // ---- Mechelen (Mar 26–29) ------------------------------------------
  {
    year: 2026,
    citySlug: "mechelen",
    recapPublished: "2026-03-31",
    totalAthletes: 19500,
    notableStories: [
      "Belgium's flagship Hyrox returned to Nekkerhal Mechelen for a four-day weekend with around 19,500 athletes.",
      "Robin Van Bouchout & Jordi Van Bouchout won the Pro Doubles Men in 39:09 (note: timing reported in mixed-format).",
      "Mechelen's depth confirmed Belgium as one of Europe's top mid-tier Hyrox markets.",
    ],
    divisions: [
      { division: "Pro Men" },
      { division: "Pro Women" },
    ],
  },

  // ---- Cape Town (Apr 3–5) -------------------------------------------
  {
    year: 2026,
    citySlug: "cape-town",
    recapPublished: "2026-04-07",
    notableStories: [
      "Africa's flagship Hyrox returned to the Cape Town International Convention Centre for a three-day weekend.",
      "Virgin Active-sponsored event with strong Pro and Open division turnout from across South Africa and the wider African continent.",
    ],
    divisions: [
      { division: "Pro Men" },
      { division: "Pro Women" },
      { division: "Open Men" },
      { division: "Open Women" },
    ],
    takeaways: [
      "Cape Town's expanded three-day format mirrors the global trend — every flagship Hyrox is now multi-day.",
    ],
  },

  // ---- Bologna (Apr 4–6) ---------------------------------------------
  {
    year: 2026,
    citySlug: "bologna",
    recapPublished: "2026-04-08",
    notableStories: [
      "Hyrox's debut in Bologna — three days at BolognaFiere drew athletes from across northern Italy.",
      "The race kicked off Italy's strongest Hyrox spring yet, with Rimini joining the calendar in May.",
    ],
    divisions: [
      { division: "Singles" },
      { division: "Doubles" },
    ],
  },

  // ---- Brisbane (Apr 9–13) — APAC Championships ----------------------
  {
    year: 2026,
    citySlug: "brisbane",
    recapPublished: "2026-04-15",
    notableStories: [
      "Tanguy Cruz (France) won the Pro Men in 57:09 — his second Pro win in six days after Singapore.",
      "Australian athletes Ollie Moore (59:42) and Oli Watson (59:59) rounded out the Pro Men podium.",
      "Brisbane combined the regular city race with the APAC Regional Championships across the weekend.",
    ],
    divisions: [
      {
        division: "Pro Men",
        podium: [
          { rank: 1, athlete: "Tanguy Cruz", time: "0:57:09", country: "FR" },
          { rank: 2, athlete: "Ollie Moore", time: "0:59:42", country: "AU" },
          { rank: 3, athlete: "Oli Watson", time: "0:59:59", country: "AU" },
        ],
      },
      { division: "APAC Elite 15 Men" },
      { division: "APAC Elite 15 Women" },
    ],
    takeaways: [
      "Cruz's Singapore-Brisbane double demonstrated that elite Pro athletes can recover and perform inside a six-day window — a useful blueprint for athletes planning back-to-back European races.",
      "Australia's Pro depth is closing the gap on Europe — both Moore and Watson finished within three minutes of Cruz.",
    ],
  },

  // ---- Bengaluru (Apr 11–12) -----------------------------------------
  {
    year: 2026,
    citySlug: "bengaluru",
    recapPublished: "2026-04-14",
    notableStories: [
      "Ultrahuman Hyrox Bengaluru marked Hyrox's first stop in southern India.",
      "The Bangalore International Exhibition Centre hosted athletes from across India and the broader South Asian market.",
    ],
    divisions: [
      { division: "Singles" },
      { division: "Doubles" },
    ],
    takeaways: [
      "India's calendar expanded to three cities in 2026 (Bengaluru, Mumbai, Delhi) — one of the fastest-growing emerging Hyrox markets.",
    ],
  },

  // ---- Wuhan (Apr 11) ------------------------------------------------
  {
    year: 2026,
    citySlug: "wuhan",
    recapPublished: "2026-04-14",
    notableStories: [
      "Hyrox's one-day Wuhan stop brought the format to central China for the first time.",
    ],
    divisions: [
      { division: "Singles" },
      { division: "Doubles" },
    ],
  },

  // ---- Rotterdam (Apr 15–19) -----------------------------------------
  {
    year: 2026,
    citySlug: "rotterdam",
    recapPublished: "2026-04-21",
    notableStories: [
      "Sam Schoeman (Netherlands) won the Pro Men in 56:43 at Ahoy.",
      "Kate Davey (UK) won the Pro Women in 1:05:14 — her first race back after a long-term injury.",
      "Harry & Ben Sutherland won the Pro Doubles Men in 50:58.",
    ],
    divisions: [
      {
        division: "Pro Men",
        podium: [
          { rank: 1, athlete: "Sam Schoeman", time: "0:56:43", country: "NL" },
          { rank: 2, athlete: "Cem Ter Burg", time: "0:57:54", country: "NL" },
          { rank: 3, athlete: "Theo Kis", time: "0:58:14", country: "FR" },
        ],
      },
      {
        division: "Pro Women",
        podium: [
          { rank: 1, athlete: "Kate Davey", time: "1:05:14", country: "GB" },
          { rank: 2, athlete: "Kim Evers", time: "1:05:22", country: "NL" },
          { rank: 3, athlete: "Georgie Frost", time: "1:06:02", country: "GB" },
        ],
      },
      {
        division: "Pro Doubles Men",
        podium: [
          { rank: 1, athlete: "Harry Sutherland & Ben Sutherland", time: "0:50:58", country: "GB" },
        ],
      },
      {
        division: "Pro Doubles Women",
        podium: [
          { rank: 1, athlete: "Iza Tulkens & Michaela Disseldorp", time: "0:57:56", country: "NL" },
        ],
      },
    ],
  },

  // ---- Cologne (Apr 16–19) — All Inclusive Fitness -------------------
  {
    year: 2026,
    citySlug: "cologne",
    recapPublished: "2026-04-22",
    notableStories: [
      "Paul Weindl (Germany) won the Pro Men in 55:55 — Germany's flagship spring race delivered the home-soil result the local fans wanted.",
      "Svenja Sommer (Germany) won the Pro Women in 1:03:49 — her second Pro Women win of the season after Amsterdam.",
      "Lukas Zajons & Michael Bartsch won the Pro Doubles Men in 52:30; Elina Sujew & Diana Breiding won the Pro Doubles Women in 58:24.",
    ],
    divisions: [
      {
        division: "Pro Men",
        podium: [
          { rank: 1, athlete: "Paul Weindl", time: "0:55:55", country: "DE" },
        ],
      },
      {
        division: "Pro Women",
        podium: [
          { rank: 1, athlete: "Svenja Sommer", time: "1:03:49", country: "DE" },
        ],
      },
      {
        division: "Pro Doubles Men",
        podium: [
          { rank: 1, athlete: "Lukas Zajons & Michael Bartsch", time: "0:52:30", country: "DE" },
        ],
      },
      {
        division: "Pro Doubles Women",
        podium: [
          { rank: 1, athlete: "Elina Sujew & Diana Breiding", time: "0:58:24", country: "DE" },
        ],
      },
    ],
    takeaways: [
      "Hyrox alongside FIBO continues to be one of the prestige weekends of the year — fitness industry trade show plus race weekend in the same building.",
    ],
  },

  // ---- Málaga (Apr 16–19) — Leapmotor --------------------------------
  {
    year: 2026,
    citySlug: "malaga",
    recapPublished: "2026-04-22",
    notableStories: [
      "Hyrox Málaga returned for a second edition with Leapmotor as title sponsor — four days of racing at FYCMA.",
      "The warm-weather Andalusian stop drew athletes from across Spain and Portugal as a popular destination race.",
    ],
    divisions: [
      { division: "Pro Men" },
      { division: "Pro Women" },
      { division: "Open Men" },
      { division: "Open Women" },
    ],
  },

  // ---- Monterrey (Apr 18–19) -----------------------------------------
  {
    year: 2026,
    citySlug: "monterrey",
    recapPublished: "2026-04-21",
    notableStories: [
      "Smart Fit Hyrox Monterrey marked Hyrox's debut in northern Mexico.",
      "The two-day Cintermex weekend drew athletes from across northern Mexico and the southern US border states.",
    ],
    divisions: [
      { division: "Singles" },
      { division: "Doubles" },
    ],
  },

  // ---- São Paulo (Apr 25) --------------------------------------------
  {
    year: 2026,
    citySlug: "sao-paulo",
    recapPublished: "2026-04-27",
    notableStories: [
      "Hyrox returned to São Paulo Expo for a one-day race, with the city joining the Brazilian roster alongside Fortaleza and Rio.",
      "São Paulo's strong Hyrox community packed the venue across all divisions.",
    ],
    divisions: [
      { division: "Singles" },
      { division: "Doubles" },
      { division: "Relay" },
    ],
    takeaways: [
      "Brazil now hosts four separate 2026 stops (Fortaleza, São Paulo Apr, São Paulo Oct, Rio) — South America's strongest Hyrox market by some distance.",
    ],
  },

  // ---- Miami (Apr 3–5, 2026) -----------------------------------------
  {
    year: 2026,
    citySlug: "miami",
    recapPublished: "2026-04-07",
    totalAthletes: 9023,
    notableStories: [
      "Hunter McIntyre (USA) dominated the Pro Men field, winning in 53:59 at Miami Beach Convention Center.",
      "Rachael Wade (USA) took the Pro Women title in 1:00:45, edging out Morgan Schulz by over 80 seconds.",
      "Cole Learn and Ryan Douglas won the Pro Doubles Men in 50:01, narrowly breaking the 50-minute barrier.",
    ],
    divisions: [
      {
        division: "Pro Men",
        podium: [
          { rank: 1, athlete: "Hunter McIntyre", time: "0:53:59", country: "US" },
          { rank: 2, athlete: "Frederic Dube", time: "0:55:44", country: "CA" },
          { rank: 3, athlete: "Jude Reynolds", time: "0:56:43", country: "US" },
        ],
      },
      {
        division: "Pro Women",
        podium: [
          { rank: 1, athlete: "Rachael Wade", time: "1:00:45", country: "US" },
          { rank: 2, athlete: "Morgan Schulz", time: "1:02:07", country: "US" },
          { rank: 3, athlete: "Camilla Massa", time: "1:03:26", country: "BR" },
        ],
      },
      {
        division: "Pro Doubles Men",
        podium: [
          { rank: 1, athlete: "Cole Learn & Ryan Douglas", time: "0:50:01", country: "US" },
        ],
      },
      {
        division: "Pro Doubles Women",
        podium: [
          { rank: 1, athlete: "Kris Rugloski & Bridget Brown", time: "0:57:11", country: "US" },
        ],
      },
    ],
    takeaways: [
      "Miami's humidity made pacing strategy critical — athletes who went out hard in the first two runs paid heavily by station 5.",
      "Pro Men times were tighter at the top than at comparable NA events; the depth of the US domestic field continues to grow.",
    ],
  },

  // ---- Singapore (Apr 3–5, 2026) -------------------------------------
  {
    year: 2026,
    citySlug: "singapore",
    recapPublished: "2026-04-08",
    totalAthletes: 13213,
    notableStories: [
      "AIA Hyrox Singapore became the first three-day Hyrox in Southeast Asia, with 35% of athletes travelling internationally.",
      "Tanguy Cruz (France) won the Pro Men in 1:00:22, the first of two back-to-back Pro victories that week.",
      "The inaugural Friday Night Relays — a global first in a stadium setting — sold out within hours and drew a packed crowd.",
    ],
    divisions: [
      {
        division: "Pro Men",
        athleteCount: 192,
        podium: [
          { rank: 1, athlete: "Tanguy Cruz", time: "1:00:22", country: "FR" },
        ],
      },
      {
        division: "Open Men",
        athleteCount: 1571,
      },
      {
        division: "Open Women",
        athleteCount: 661,
      },
    ],
    takeaways: [
      "Singapore National Stadium's indoor track kept temperatures manageable — evidence that venue quality directly affects finishing times.",
      "The strong international turnout (35% from overseas) signals that APAC is now a premier destination on the global Hyrox calendar.",
    ],
  },

  // ---- Warsaw (Apr 16–19, 2026) — Elite 15 Major ---------------------
  {
    year: 2026,
    citySlug: "warsaw",
    recapPublished: "2026-04-21",
    totalAthletes: 3048,
    notableStories: [
      "Alexander Roncevic (Austria) set a new men's world record of 51:59 — the first sub-52 minute Hyrox in history.",
      "Joanna Wietrzyk (Australia) shattered the women's world record with 54:25, improving her own mark by 1:37 and completing an unprecedented Grand Slam — four Elite 15 Major wins in a single season.",
      "The Roncevic vs Wenisch rivalry headlined race weekend; both athletes had already set world records earlier in the season.",
    ],
    divisions: [
      {
        division: "Elite 15 Men",
        athleteCount: 15,
        fastestTime: "0:51:59",
        podium: [
          {
            rank: 1,
            athlete: "Alexander Roncevic",
            time: "0:51:59",
            country: "AT",
            notes: "World record (first sub-52 in history)",
            // Station-only splits for Roncevic's record run; total stations
            // 22:09 (#1 in Elite 15), total runs 29:54 (#3, avg 3:44/km).
            splits: [
              { segment: "SkiErg", segmentTime: "3:42" },
              { segment: "Sled Push", segmentTime: "2:04" },
              { segment: "Sled Pull", segmentTime: "2:49" },
              { segment: "Burpee Broad Jumps", segmentTime: "2:25" },
              { segment: "Rowing", segmentTime: "3:54" },
              { segment: "Farmers Carry", segmentTime: "1:18" },
              { segment: "Sandbag Lunges", segmentTime: "2:28" },
              { segment: "Wall Balls", segmentTime: "3:29" },
            ],
          },
          { rank: 2, athlete: "Dylan Scott", time: "0:52:40", country: "US" },
          { rank: 3, athlete: "Sebastian Ifversen", time: "0:53:18", country: "DK" },
        ],
      },
      {
        division: "Elite 15 Women",
        athleteCount: 15,
        fastestTime: "0:54:25",
        podium: [
          {
            rank: 1,
            athlete: "Joanna Wietrzyk",
            time: "0:54:25",
            country: "AU",
            notes: "World record · Grand Slam (4 of 4 Majors)",
          },
        ],
      },
      {
        division: "Elite 15 Doubles Women",
        podium: [
          { rank: 1, athlete: "Lauren Weeks & Vivian Tafuto", time: "0:52:11", country: "US" },
          { rank: 2, athlete: "Charlie Searle & Lauren Stockley", time: "0:52:58", country: "GB" },
          { rank: 3, athlete: "Jade Skillen & Kat Parnell", time: "0:54:26", country: "GB" },
        ],
      },
    ],
    takeaways: [
      "World records can fall at any Major — if you're chasing a PB, race conservatively through the sled stations and unleash on the final run.",
      "Rope management on the sled pull decided several positions in the Elite field; practice it before any race where the prize matters.",
      "Wietrzyk's Warsaw run average of 3:48/km across eight kilometres under race fatigue is a useful benchmark for advanced athletes setting targets.",
    ],
  },

  // ---- Paris (Apr 23–27, 2026) ---------------------------------------
  {
    year: 2026,
    citySlug: "paris",
    recapPublished: "2026-04-28",
    totalAthletes: 20568,
    notableStories: [
      "French dominance at home: Julien Coquillaud-Salomon won Pro Men in 55:12, with Tommy Valentin (56:00) and CrossFit athlete Willy Georges (56:29) completing an all-French podium.",
      "Alice Schürer (Austria) took the Pro Women title in 1:03:37, just ahead of Viola Oberländer (Germany, 1:04:24) in a closely contested finish with no woman breaking the hour.",
      "Paris 2026 was the largest Hyrox to date in France — over 20,000 athletes across five days at the Grand Palais.",
    ],
    divisions: [
      {
        division: "Pro Men",
        athleteCount: 700,
        podium: [
          { rank: 1, athlete: "Julien Coquillaud-Salomon", time: "0:55:12", country: "FR" },
          { rank: 2, athlete: "Tommy Valentin", time: "0:56:00", country: "FR" },
          { rank: 3, athlete: "Willy Georges", time: "0:56:29", country: "FR" },
        ],
      },
      {
        division: "Pro Women",
        athleteCount: 285,
        podium: [
          { rank: 1, athlete: "Alice Schürer", time: "1:03:37", country: "AT" },
          { rank: 2, athlete: "Viola Oberländer", time: "1:04:24", country: "DE" },
          { rank: 3, athlete: "Anne-Caroline Charpentier", time: "1:04:24", country: "FR" },
        ],
      },
      {
        division: "Pro Doubles Men",
        athleteCount: 397,
        podium: [
          { rank: 1, athlete: "Quentin Garel & Alan Cao", time: "0:50:34", country: "FR" },
          { rank: 2, athlete: "Martin Lecorgne & Xavier Dufour", time: "0:50:40", country: "FR" },
          { rank: 3, athlete: "Olivier Jouve & Dimitry Martins", time: "0:50:49", country: "FR" },
        ],
      },
      {
        division: "Pro Doubles Women",
        athleteCount: 294,
        podium: [
          { rank: 1, athlete: "Lola Gomes & Apolline Cardon", time: "0:58:59", country: "FR" },
          { rank: 2, athlete: "Laura Germani & Lucille Golliau", time: "1:00:10", country: "FR" },
          { rank: 3, athlete: "Camille Bat & Camille Julien", time: "1:00:27", country: "FR" },
        ],
      },
      {
        division: "Open Men",
        athleteCount: 2547,
      },
      {
        division: "Open Women",
        athleteCount: 1665,
      },
    ],
    takeaways: [
      "The all-French Pro Men podium reflects years of domestic growth — France is now producing a depth of Pro-level athletes that rivals Germany and the UK.",
      "No Pro Women athlete broke the hour at Paris, despite the iconic venue — humidity and multi-day fatigue for athletes racing across the long weekend likely played a role.",
      "The Pro Doubles Men podium was also swept by France (all three spots), confirming the French doubles scene as the strongest in Europe.",
    ],
  },
];

export function getResults(year: number, citySlug: string): RaceResult | undefined {
  return RACE_RESULTS.find((r) => r.year === year && r.citySlug === citySlug);
}
