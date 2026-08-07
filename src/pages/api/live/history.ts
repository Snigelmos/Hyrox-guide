import type { APIRoute } from "astro";
import {
  athleteUrl,
  findAthlete,
  MIN_RACES_FOR_PAGE,
  PRO_DATASET_GENERATED_AT,
} from "../../../lib/pro-athletes";

export const prerender = false;

/**
 * Past races for an athlete found in the live tracker.
 *
 * This reads our own ingested dataset rather than the timing portal, because the
 * portal has no history endpoint at all — search is scoped to one division-day
 * and detail pages link only to rankings. See scripts/ingest-pro-results.mjs.
 *
 * The dataset covers Pro and Elite 15 singles. A miss is the normal case for
 * Open-division athletes and the caller is expected to say so plainly rather
 * than implying the athlete has never raced.
 *
 * Query params:
 *   name   - name as the portal stores it ("Lastname, Firstname") (required)
 *   nation - ISO3 code, disambiguates athletes who share a name
 */
export const GET: APIRoute = async ({ url }) => {
  const name = (url.searchParams.get("name") ?? "").trim();
  const nation = (url.searchParams.get("nation") ?? "").trim() || null;

  if (!name) {
    return json({ error: "missing name" }, 400);
  }

  const athlete = findAthlete(name, nation);
  if (!athlete) {
    return json(
      {
        found: false,
        reason: "not-in-dataset",
        detail:
          "We only hold race histories for the Hyrox Pro and Elite 15 singles divisions.",
        generatedAt: PRO_DATASET_GENERATED_AT,
      },
      200,
    );
  }

  return json(
    {
      found: true,
      athlete: {
        slug: athlete.slug,
        name: athlete.name,
        nation: athlete.nation,
        sex: athlete.sex,
        raceCount: athlete.races.length,
        // Only profiles above the bar have a page to link to.
        profileUrl:
          athlete.races.length >= MIN_RACES_FOR_PAGE
            ? athleteUrl(athlete.slug)
            : null,
        races: athlete.races.slice(0, 12).map((r) => ({
          raceSlug: r.raceSlug,
          raceYear: r.raceYear,
          raceCity: r.raceCity,
          date: r.date,
          division: r.division,
          rank: r.rank,
          time: r.time,
        })),
      },
      generatedAt: PRO_DATASET_GENERATED_AT,
    },
    200,
  );
};

function json(body: unknown, status: number): Response {
  return new Response(JSON.stringify(body), {
    status,
    headers: {
      "Content-Type": "application/json",
      // The dataset only changes when the weekly ingest runs.
      "Cache-Control":
        status === 200 ? "public, s-maxage=3600, stale-while-revalidate=86400" : "no-store",
    },
  });
}
