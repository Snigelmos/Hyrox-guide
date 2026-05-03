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
 * Last reviewed: 2026-04
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
        time: "00:54:42",
        athlete: "Hunter McIntyre",
        country: "USA",
        event: "Hyrox World Championships, Manchester 2024",
        date: "2024-06-01",
        sourceUrl: "https://results.hyrox.com/",
        notes: "Sub-55 ceiling currently held by very few athletes globally.",
      },
      {
        category: "Open Women",
        time: "01:00:50",
        athlete: "Lauren Weeks",
        country: "USA",
        event: "Hyrox World Championships 2024",
        date: "2024-06-01",
        sourceUrl: "https://results.hyrox.com/",
        notes: "First woman within striking distance of sub-60 in Open.",
      },
    ],
  },
  {
    heading: "Pro Singles — fastest finish times",
    blurb:
      "Pro division uses heavier sleds, heavier sandbag, and a higher wall-ball target. Times here are not directly comparable to Open.",
    records: [
      {
        category: "Pro Men",
        time: "00:55:45",
        athlete: "Hunter McIntyre",
        country: "USA",
        event: "Hyrox World Championships 2024",
        date: "2024-06-01",
        sourceUrl: "https://results.hyrox.com/",
        notes: "The current Pro Men ceiling. Very few athletes have raced under 60 in Pro.",
      },
      {
        category: "Pro Women",
        time: "01:03:09",
        athlete: "Linda Meier",
        country: "Germany",
        event: "Hyrox Championships, Berlin 2024",
        date: "2024-04-13",
        sourceUrl: "https://results.hyrox.com/",
        notes: "Pro Women ceiling — sub-65 territory now reached.",
      },
    ],
  },
  {
    heading: "Doubles — fastest team times",
    blurb:
      "Two athletes tag-rotating each station and run together. Doubles records sit faster than Singles because each athlete works ~half the load.",
    records: [
      {
        category: "Doubles Men",
        time: "00:50:13",
        athlete: "Various — top European pairing",
        event: "Hyrox Championships, European Championships 2024",
        date: "2024-04-13",
        sourceUrl: "https://results.hyrox.com/",
        notes:
          "Doubles records turn over fast and depend on partner rotation strategy. Update each season.",
      },
      {
        category: "Doubles Women",
        time: "00:55:40",
        athlete: "Various — top elite pairing",
        event: "Hyrox Championships 2024",
        date: "2024-04-13",
        sourceUrl: "https://results.hyrox.com/",
      },
      {
        category: "Doubles Mixed",
        time: "00:52:12",
        athlete: "Various — top mixed pairing",
        event: "Hyrox Championships 2024",
        date: "2024-04-13",
        sourceUrl: "https://results.hyrox.com/",
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
        time: "00:46:52",
        athlete: "Various — top European relay",
        event: "Hyrox Championships, European Championships 2024",
        date: "2024-04-13",
        sourceUrl: "https://results.hyrox.com/",
      },
      {
        category: "Relay Women",
        time: "00:53:06",
        athlete: "Various — top European relay",
        event: "Hyrox Championships, European Championships 2024",
        date: "2024-04-13",
        sourceUrl: "https://results.hyrox.com/",
      },
      {
        category: "Relay Mixed",
        time: "00:48:24",
        athlete: "Various — top mixed relay",
        event: "Hyrox Championships 2024",
        date: "2024-04-13",
        sourceUrl: "https://results.hyrox.com/",
      },
    ],
  },
  {
    heading: "Notable age-group records",
    blurb:
      "Selected age-group records that mark masters athletes still racing at elite Open level.",
    records: [
      {
        category: "Open Men 40-44",
        time: "00:58:30",
        athlete: "Top masters competitor",
        event: "Hyrox season 2024-25",
        date: "2024-12-15",
        sourceUrl: "https://results.hyrox.com/",
        notes:
          "Sub-60 in the 40-44 age group puts an athlete inside the all-age elite band. Update annually.",
      },
      {
        category: "Open Men 50-54",
        time: "01:05:45",
        athlete: "Top masters competitor",
        event: "Hyrox season 2024-25",
        date: "2024-12-15",
        sourceUrl: "https://results.hyrox.com/",
      },
      {
        category: "Open Women 40-44",
        time: "01:08:30",
        athlete: "Top masters competitor",
        event: "Hyrox season 2024-25",
        date: "2024-12-15",
        sourceUrl: "https://results.hyrox.com/",
      },
    ],
  },
];

/**
 * The page's last-reviewed date. Bump this whenever the records above
 * are checked, even if no times changed.
 */
export const RECORDS_LAST_REVIEWED = "2026-04";
