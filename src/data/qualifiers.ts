/**
 * Hyrox qualifying-system reference data.
 *
 * Sourced from the 2025-26 athlete handbook on hyrox.com.
 * Pro division qualifying times are the published 2025-26 thresholds.
 * Update each summer when the new season's qualifying times are released.
 */

export interface QualifyingTime {
  ageGroup: string;
  menTime: string; // "HH:MM:SS"
  womenTime: string;
}

export const PRO_QUALIFYING_TIMES_2026: QualifyingTime[] = [
  { ageGroup: "16-24", menTime: "1:05:00", womenTime: "1:18:00" },
  { ageGroup: "25-29", menTime: "1:03:00", womenTime: "1:16:00" },
  { ageGroup: "30-34", menTime: "1:03:00", womenTime: "1:16:00" },
  { ageGroup: "35-39", menTime: "1:05:00", womenTime: "1:18:00" },
  { ageGroup: "40-44", menTime: "1:08:00", womenTime: "1:21:00" },
  { ageGroup: "45-49", menTime: "1:11:00", womenTime: "1:24:00" },
  { ageGroup: "50-54", menTime: "1:14:00", womenTime: "1:28:00" },
  { ageGroup: "55-59", menTime: "1:17:00", womenTime: "1:32:00" },
  { ageGroup: "60+", menTime: "1:21:00", womenTime: "1:38:00" },
];

export interface QualifierPage {
  slug: string;
  title: string;
  description: string;
  metaTitle: string;
}

export const QUALIFIER_PAGES: QualifierPage[] = [
  {
    slug: "pro-qualifying-times",
    title: "Hyrox Pro Qualifying Times 2026",
    description: "The full 2026 Hyrox Pro qualifying times by age group, division, and what they mean for your season.",
    metaTitle: "Hyrox Pro Qualifying Times 2026 — Men & Women by Age Group",
  },
  {
    slug: "world-championship",
    title: "How to Qualify for the Hyrox World Championship 2026",
    description: "Complete guide to qualifying for the 2026 Hyrox World Championships in Stockholm. Age-group qualifying, season ranking, and Elite 15.",
    metaTitle: "How to Qualify for Hyrox World Championship 2026 (Stockholm)",
  },
  {
    slug: "season-ranking-points",
    title: "Hyrox Season Ranking Points Explained",
    description: "How Hyrox season ranking points work, what they mean for World Championship qualifying, and how to maximise your points across the season.",
    metaTitle: "Hyrox Season Ranking Points Explained — How They Work",
  },
  {
    slug: "elite-15",
    title: "Hyrox Elite 15 Qualifying Explained",
    description: "How the Hyrox Elite 15 qualifying system works: Major events, season ranking, and how the top 15 athletes per division earn their World Championship spots.",
    metaTitle: "Hyrox Elite 15 Qualifying — How the Top 15 Earn Their Spots",
  },
  {
    slug: "age-group-world-championship",
    title: "Hyrox Age Group World Championship Qualifying",
    description: "Age-group qualifying for the Hyrox World Championship: how Open division winners earn World Championship spots, and what time you need to win your group.",
    metaTitle: "Hyrox Age Group World Championship Qualifying — 2026 Guide",
  },
];
