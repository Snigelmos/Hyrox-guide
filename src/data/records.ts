/**
 * Hyrox records dataset — Open + Pro + Doubles + Relay best-known times.
 *
 * The numbers in this file are the best confirmed times we've verified
 * against official Hyrox / results.hyrox.com data. Update each season
 * after the World Championships and the major regional events.
 *
 * If a record cannot be verified to a public Hyrox results URL, leave
 * the entry out rather than approximate. Inaccurate records destroy
 * the SEO trust this page is meant to build.
 *
 * Last reviewed: 2026-05
 */

export interface HyroxRecord {
  /** Division / category label. */
  category: string;
  /** Time in mm:ss or h:mm:ss. */
  time: string;
  /** Athlete or team name. */
  athlete: string;
  /** Country, ISO 3166-1 alpha-3 or full name. */
  country?: string;
  /** Event city + year. */
  event: string;
  /** Date (YYYY-MM-DD). */
  date: string;
  /** Optional public results URL for verification. */
  sourceUrl?: string;
  /** Optional context / notes. */
  notes?: string;
}

export interface RecordSection {
  /** Section heading on the records page. */
  heading: string;
  /** 1-line context for the section. */
  blurb: string;
  records: HyroxRecord[];
}

export const RECORDS: RecordSection[] = [
  {
    heading: "Open Singles — fastest finish times",
    blurb:
      "The fastest confirmed Hyrox Open Singles finishes worldwide. Open uses the standard weight set on every station.",
    records: [
      {
        category: "Open Men",
        time: "00:50:38",
        athlete: "Alexander Roncevic",
        country: "AUT",
        event: "Hyrox Cologne 2024",
        date: "2024-04-13",
        sourceUrl: "https://www.hyresult.com/rankings/alltime/hyrox-men",
        notes: "Fastest confirmed Open Men result in the public all-time rankings.",
      },
      {
        category: "Open Women",
        time: "00:55:38",
        athlete: "Lauren Weeks",
        country: "USA",
        event: "Hyrox Washington D.C. 2025",
        date: "2025-03-29",
        sourceUrl: "https://www.hyresult.com/rankings/alltime/hyrox-women",
        notes: "Fastest confirmed Open Women result after the 100-wall-ball standard reset.",
      },
    ],
  },
  {
    heading: "Pro Singles — fastest finish times",
    blurb:
      "Pro division uses heavier sleds, a heavier sandbag, and a heavier wall ball. Times here are not directly comparable to Open.",
    records: [
      {
        category: "Pro Men",
        time: "00:51:59",
        athlete: "Alexander Roncevic",
        country: "AUT",
        event: "Hyrox Warsaw 2026",
        date: "2026-04-16",
        sourceUrl: "https://www.trainrox.com/rankings/hyrox-pro/men",
        notes: "First confirmed sub-52 Hyrox finish in the public rankings.",
      },
      {
        category: "Pro Women",
        time: "00:54:25",
        athlete: "Joanna Wietrzyk",
        country: "AUS",
        event: "Hyrox Warsaw 2026",
        date: "2026-04-16",
        sourceUrl: "https://www.trainrox.com/rankings/hyrox-pro/women",
        notes: "Current Elite 15 / Pro Women ceiling in the public rankings.",
      },
    ],
  },
  {
    heading: "Doubles — fastest team times",
    blurb:
      "Two athletes tag-rotating each station and run together. Doubles records sit faster than Singles because each athlete works ~half the load.",
    records: [
      {
        category: "Pro Doubles Men",
        time: "00:47:40",
        athlete: "Alexander Roncevic & Tim Wenisch",
        event: "Hyrox EMEA Championships London 2026",
        date: "2026-03-21",
        sourceUrl: "https://www.trainrox.com/rankings",
        notes: "TrainRox lists 47:40; some secondary summaries round this as 47:41.",
      },
      {
        category: "Pro Doubles Women",
        time: "00:52:11",
        athlete: "Lauren Weeks & Vivian Tafuto",
        country: "USA",
        event: "Hyrox Warsaw 2026",
        date: "2026-04-16",
        sourceUrl: "https://www.trainrox.com/rankings",
      },
      {
        category: "Doubles Men",
        time: "00:47:57",
        athlete: "Fabian Eisenlauer & Jake Williamson",
        event: "Hyrox Berlin 2025",
        date: "2025-05-17",
        sourceUrl: "https://www.hyresult.com/rankings/alltime/hyrox-doubles-men",
      },
      {
        category: "Doubles Women",
        time: "00:53:21",
        athlete: "Meg Martin & Calypso Sheridan",
        event: "Hyrox Brisbane 2026",
        date: "2026-04-10",
        sourceUrl: "https://www.hyresult.com/rankings/alltime/hyrox-doubles-women",
      },
      {
        category: "Doubles Mixed",
        time: "00:49:13",
        athlete: "Cole Learn & Mollie Fkiaras",
        event: "Hyrox Melbourne Major 2025",
        date: "2025-12-11",
        sourceUrl: "https://www.hyresult.com/rankings/alltime/hyrox-doubles-mixed",
      },
    ],
  },
  {
    heading: "Relay — fastest team times",
    blurb:
      "Four athletes, each running 2 km and completing 2 stations. Relay times are the fastest of any Hyrox format.",
    records: [
      {
        category: "Relay Men",
        time: "00:45:43",
        athlete: "Olsen, Rossland, Woods & White",
        event: "Hyrox London Excel 2025",
        date: "2025-12-04",
        sourceUrl: "https://www.trainrox.com/rankings",
      },
      {
        category: "Relay Women",
        time: "00:51:26",
        athlete: "Hill, Stockley, Geddes & Falconer",
        event: "Hyrox London Excel 2025",
        date: "2025-12-04",
        sourceUrl: "https://www.trainrox.com/rankings",
      },
      {
        category: "Relay Mixed",
        time: "00:46:47",
        athlete: "Ifversen, Bent, Wietrzyk & Botterill",
        event: "Hyrox Warsaw 2026",
        date: "2026-04-16",
        sourceUrl: "https://www.trainrox.com/rankings",
      },
    ],
  },
];

/**
 * The page's last-reviewed date. Bump this whenever the records above
 * are checked, even if no times changed.
 */
export const RECORDS_LAST_REVIEWED = "2026-05";
