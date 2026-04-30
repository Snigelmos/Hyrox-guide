#!/usr/bin/env node
/**
 * Geocode Nordic Hyrox training clubs.
 *
 * Inputs:
 *  - _research/all-stores.json (12,307 official Hyrox training clubs)
 *  - Filter list of slug patterns matching Nordic cities & local chains
 *
 * Outputs:
 *  - _research/nordic-gyms.json (slug, name, city, country, lat, lng, address, website)
 *
 * Geocoder: OpenStreetMap Nominatim (free, no key, ~1 req/sec)
 *
 * Strategy: query Nominatim with the gym name + city hint extracted from the slug.
 * Validate that the returned country matches the expected country. Skip on mismatch.
 */

import { readFileSync, writeFileSync, existsSync } from "node:fs";
import { setTimeout as sleep } from "node:timers/promises";

const ROOT = process.cwd();
const STORES_PATH = `${ROOT}/_research/all-stores.json`;
const OUTPUT_PATH = `${ROOT}/_research/nordic-gyms.json`;
const CACHE_PATH = `${ROOT}/_research/nominatim-cache.json`;

const NORDIC_TOKENS = {
  Sweden: {
    code: "SE",
    cities: [
      "stockholm", "goteborg", "goeteborg", "malmo", "malmoe", "uppsala", "lund",
      "umea", "umeaa", "linkoping", "linkoeping", "vasteras", "vaesteras",
      "norrkoping", "norrkoeping", "helsingborg", "helsinborg", "jonkoping", "joenkoeping",
      "orebro", "oerebro", "kalmar", "halmstad", "sundsvall", "visby",
      "gavle", "gaevle", "falun", "karlstad", "vaxjo", "vaexjoe",
      "eskilstuna", "boras", "boraas", "nykoping", "nykoeping", "skaraborg",
      "kristianstad", "ostersund", "lulea", "trollhattan", "trollhaettan",
      "soder", "soeder", "kvillebacken", "kvillebaecken", "froelunda", "frolunda",
      "vaernhem", "varnhem", "klosters", "odenplan", "tannefors", "aspholmen",
      "aby", "valhalla", "johanneslust", "heleneholm", "vaederkvarnsgatan",
      "vaedergatan", "ekeby", "rocklunda", "simonsland", "friskishuset",
      "sveaplan", "straengnaes", "norremark",
      "ingelsta", "slottsmoellan", "himmelstalund", "gavlehov",
      "aveny", "leksand", "tullinge", "varberg", "ulriksdal", "olympen",
      "svandammen", "vaesby", "taeby", "gaerdet", "vasastan", "vaellingby",
      "tyresoe", "sisjoen", "kompassen", "vaestra", "skanstull", "haeggvik",
      "norrtaelje", "stenungsund", "trelleborg", "kungsbacka", "kungaelv",
      "katrineholm", "karlskrona", "ystad", "varberg", "simrishamn",
      "vaenersborg", "aelmhult", "aengelholm", "borlaenge", "danderyd",
      "hoeganaes", "hoerby", "tyresoe", "upplands", "froesoe",
    ],
    chainHints: ["fitness24seven-", "friskissvettis-", "friskis-svettis-",
      "friskis-soeder", "friskis-soder", "friskis-aby",
      "actic-", "nordic-wellness-",
      "first-class-gym-", "brave-fitness-malmo", "hyrox-skaraborg", "umea-performance",
      "traeningsklubben-i-kalmar", "basic-gym-kristianstad", "boxen-sporthuset",
      "o2-arena-karlstad", "crossfit-aby", "crossfit-vaexjoe",
      "crossfit-halmstad", "crossfit-visby", "crossfit-nykoeping",
      "crossfit-lund", "crossfit-kalmar", "puls-mora"],
  },
  Norway: {
    code: "NO",
    cities: ["oslo", "bergen", "trondheim", "stavanger", "tromso", "tromsoe",
      "kristiansand", "drammen", "fredrikstad", "sandnes", "sarpsborg",
      "sandefjord", "skien", "tonsberg", "alesund", "aalesund", "moss",
      "haugesund", "bodo", "arendal", "majorstuen", "lillestrom",
      "klosteroya", "fagerborg", "ryen", "asane", "langnes", "hillevag",
      "colosseum", "akersgata", "bekkestua", "carl-berner", "forde"],
    chainHints: ["adrenalin-kristiansand", "adrenalin-drammen", "focus-norway",
      "trondheim-performance", "friskis-majorstuen", "crossfit-sandefjord",
      "sats-oslo", "sats-fagerborg", "sats-ryen", "sats-asane",
      "sats-langnes", "sats-hillevag", "sats-colosseum", "sats-carl-berner",
      "sats-bekkestua", "sats-akersgata", "sats-lillestrom", "sats-klosteroya",
      "sats-aquarama", "sats-parken", "puls-forde", "max-puls-fitness",
      "bft-majorstuen"],
  },
  Denmark: {
    code: "DK",
    cities: ["copenhagen", "koebenhavn", "kobenhavn", "aarhus", "odense",
      "aalborg", "esbjerg", "randers", "kolding", "horsens", "vejle",
      "roskilde", "herning", "helsingor", "holbaek", "silkeborg", "naestved",
      "fredericia", "viborg", "koge", "hillerod", "kalundborg", "slagelse",
      "hjorring", "sydhavn", "taastrup", "norrebro", "nygardsvej",
      "fisketorget"],
    chainHints: ["box365-", "crossfit-aalborg", "crossfit-odense", "aarhus-crossfit",
      "crossfit-kalundborg", "ground-fredericia", "sporthealth-odense",
      "sats-copenhagen", "sats-aarhus", "sats-sydhavn", "sats-taastrup",
      "sats-norrebro", "sats-nygardsvej", "sats-fisketorget"],
  },
  Finland: {
    code: "FI",
    cities: ["helsinki", "helsingfors", "espoo", "tampere", "oulu", "vantaa",
      "turku", "jyvaskyla", "jyvaeskylae", "lahti", "kuopio", "pori",
      "joensuu", "lappeenranta", "vaasa", "kotka", "salo", "hameenlinna",
      "mikkeli", "rovaniemi", "seinajoki", "seinaejoki", "kemi", "kajaani",
      "kerava", "porvoo", "kouvola", "kivenlahti", "ruoholahti", "lielahti",
      "talvikangas", "ritaharju", "keskusta", "jeppis", "rajatorppa",
      "kalasatama", "savonlinnna", "savonlinna", "lippulaiva", "circus",
      "itis", "kaleva", "idepark", "setri"],
    chainHints: ["fressi-", "elixia-", "ladyline-", "easyfit-", "fun-",
      "tfw-helsinki", "tfw-joensuu", "rr-training-turku", "ole-fit-jeppis",
      "wasabox", "crossfit-pori", "sats-helsinki"],
  },
  Iceland: {
    code: "IS",
    cities: ["reykjavik", "kopavogur", "hafnarfjordur", "akureyri",
      "gardabaer", "mosfellsbaer", "selfoss", "reykjanesbaer", "keflavik"],
    chainHints: ["hyrox-iceland"],
  },
};

function decodeTitle(s) {
  return String(s)
    .replace(/&#038;/g, "&")
    .replace(/&#8211;/g, "–")
    .replace(/&amp;/g, "&")
    .replace(/&quot;/g, '"')
    .replace(/&apos;/g, "'");
}

function classify(slug, title) {
  const s = slug.toLowerCase();
  for (const [country, data] of Object.entries(NORDIC_TOKENS)) {
    // City must appear as its own slug-segment (between hyphens or at boundaries).
    const hasCity = data.cities.some((c) => {
      const pattern = new RegExp(`(^|-)${c}(-|$)`, "i");
      return pattern.test(s);
    });
    // Chain hints must be a contiguous substring AND start at a slug-segment boundary.
    const hasChain = data.chainHints.some((c) => {
      const cl = c.toLowerCase();
      // Anchor to start of slug or after a hyphen.
      return s === cl || s.startsWith(cl) || s.includes("-" + cl);
    });
    if (hasCity || hasChain) {
      return { country, code: data.code };
    }
  }
  return null;
}

function isLikelyFalsePositive(slug, title, country) {
  const s = slug.toLowerCase();
  const t = String(title).toLowerCase();
  const blacklist = [
    "bergen-county",     // D1 Training — US, NJ
    "hamburg",           // Elixia Hamburg — Germany
    "saphan-mai",        // Bangkok
    "onnut",             // Bangkok
    "stekene",           // Belgium
    "wirral",            // UK
    "hilton-head",       // US SC
    "long-island",       // US NY
    "yas-island",        // UAE
    "padre-island",      // US TX
    "cayman-islands",    // UK
    "almaryah-island",   // UAE
    "cane-island",       // US
    "burns-beach",       // AU
    "noumea",            // New Caledonia
    "south-island",      // could be NZ
    "strong-island",     // US
    "iron-island",       // generic
    "fit-island",        // generic
    "island-park",       // US
    "island-sports-canggu", // Bali
    "evolution-long-island",
    "kelham-island",     // UK
    "metabolic-london",
    // Generic Colosseum gyms outside Norway: only sats-colosseum is the Norwegian chain.
    "colosseum-gym-cardiff", // Wales
    "the-colosseum-gym",     // generic, not the Norwegian chain
    "chaos-colosseum",       // Hagen, Germany
  ];
  if (blacklist.some((bl) => s.includes(bl))) return true;
  // Title-based safety: any title containing a non-Nordic city we know about.
  const nonNordicCityHints = [
    "cardiff", "london", "manchester", "birmingham", "berlin",
    "munich", "hamburg", "paris", "amsterdam", "rotterdam",
    "brussels", "antwerp", "milan", "rome", "madrid", "barcelona",
    "vienna", "prague", "warsaw", "budapest", "athens", "lisbon",
    "dublin", "edinburgh", "glasgow", "leeds", "liverpool",
    "frankfurt", "cologne", "düsseldorf", "stuttgart", "leipzig",
    "zurich", "geneva", "basel", "lyon", "marseille", "toulouse",
  ];
  if (nonNordicCityHints.some((c) => t.includes(c))) return true;
  return false;
}

/**
 * Extract a "suburb" or specific-location token from the slug.
 * For gyms whose name is just a chain + neighbourhood, the suburb is what we want
 * to geocode (e.g. "kvillebaecken", "lielahti", "ruoholahti").
 */
function extractSuburbHint(slug) {
  const SUBURB_TOKENS = [
    "kvillebaecken", "kvillebacken", "froelunda", "frolunda", "vaernhem",
    "varnhem", "klosters", "odenplan", "tannefors", "aspholmen", "aby",
    "valhalla", "johanneslust", "heleneholm", "vaederkvarnsgatan", "ekeby",
    "rocklunda", "simonsland", "friskishuset", "gavlehov", "aveny",
    "slottsmoellan", "himmelstalund", "ruoholahti", "kalasatama", "itis",
    "kaleva", "lielahti", "circus", "lippulaiva", "kivenlahti",
    "talvikangas", "ritaharju", "jeppis", "rajatorppa", "idepark", "setri",
    "majorstuen", "fagerborg", "ryen", "asane", "langnes", "hillevag",
    "colosseum", "akersgata", "bekkestua", "carl-berner", "klosteroya",
    "lillestrom", "aquarama", "sydhavn", "taastrup", "norrebro",
    "nygardsvej", "fisketorget", "soder", "soeder", "leksand", "tullinge",
    "ulriksdal", "olympen", "svandammen", "vasastan", "vaellingby",
    "tyresoe", "sisjoen", "kompassen", "skanstull", "haeggvik",
    "norrtaelje", "stenungsund", "trelleborg", "kungsbacka", "kungaelv",
    "katrineholm", "karlskrona", "ystad", "varberg", "simrishamn",
    "vaenersborg", "aelmhult", "aengelholm", "danderyd", "hoeganaes",
    "hoerby", "trollhaettan", "trollhattan", "froesoe", "borlaenge",
    "vaernamo", "sveaplan", "straengnaes", "norremark", "ingelsta",
    "hajen", "kompassen", "savonlinna", "savonlinnna", "porvoo", "kouvola",
    "vaasa", "joensuu", "pori", "seinaejoki", "seinajoki", "mikkeli",
    "kerava", "nokia", "helsinborg",
  ];
  const s = slug.toLowerCase();
  // Walk through tokens longest-first to prefer multi-segment matches.
  const sorted = [...SUBURB_TOKENS].sort((a, b) => b.length - a.length);
  for (const t of sorted) {
    const re = new RegExp(`(^|-)${t}(-|$)`, "i");
    if (re.test(s)) return t;
  }
  // Fallback: take the last segment of the slug (often the most specific).
  const parts = s.split("-").filter((p) => !/^\d+$/.test(p));
  return parts[parts.length - 1] || null;
}

function extractCityHint(slug, country) {
  const s = slug.toLowerCase();
  const data = NORDIC_TOKENS[country];
  for (const c of data.cities) {
    const pattern = new RegExp(`(^|-)${c}(-|$)`, "i");
    if (pattern.test(s)) {
      // Map slug-form back to display form.
      const map = {
        goteborg: "Göteborg", goeteborg: "Göteborg", gothenburg: "Göteborg",
        malmo: "Malmö", malmoe: "Malmö",
        umea: "Umeå", umeaa: "Umeå",
        linkoping: "Linköping", linkoeping: "Linköping",
        vasteras: "Västerås", vaesteras: "Västerås",
        norrkoping: "Norrköping", norrkoeping: "Norrköping",
        jonkoping: "Jönköping", joenkoeping: "Jönköping",
        orebro: "Örebro", oerebro: "Örebro",
        gavle: "Gävle", gaevle: "Gävle",
        vaxjo: "Växjö", vaexjoe: "Växjö",
        boras: "Borås", boraas: "Borås",
        nykoping: "Nyköping", nykoeping: "Nyköping",
        ostersund: "Östersund",
        lulea: "Luleå",
        trollhattan: "Trollhättan", trollhaettan: "Trollhättan",
        tromso: "Tromsø", tromsoe: "Tromsø",
        alesund: "Ålesund", aalesund: "Ålesund",
        bodo: "Bodø",
        kobenhavn: "Copenhagen", koebenhavn: "Copenhagen",
        aarhus: "Aarhus",
        helsingor: "Helsingør",
        holbaek: "Holbæk",
        naestved: "Næstved",
        koge: "Køge",
        hillerod: "Hillerød",
        hjorring: "Hjørring",
        helsingfors: "Helsinki",
        jyvaskyla: "Jyväskylä", jyvaeskylae: "Jyväskylä",
        hameenlinna: "Hämeenlinna",
        seinajoki: "Seinäjoki", seinaejoki: "Seinäjoki",
        soder: "Stockholm", soeder: "Stockholm",
        majorstuen: "Oslo",
        odenplan: "Stockholm",
        ruoholahti: "Helsinki", kalasatama: "Helsinki", itis: "Helsinki",
        kivenlahti: "Espoo", lippulaiva: "Espoo",
        lielahti: "Tampere", kaleva: "Tampere", keskusta: null,
        talvikangas: "Oulu", ritaharju: "Oulu",
        jeppis: "Pietarsaari",
        rajatorppa: "Vantaa",
        circus: "Helsinki",
        idepark: "Hämeenlinna",
        setri: "Mikkeli",
        savonlinnna: "Savonlinna",
        kvillebacken: "Göteborg", kvillebaecken: "Göteborg",
        froelunda: "Göteborg", frolunda: "Göteborg",
        valhalla: "Göteborg", aby: "Göteborg",
        vaernhem: "Malmö", varnhem: "Malmö",
        johanneslust: "Malmö", heleneholm: "Malmö",
        klosters: "Lund",
        norremark: "Växjö",
        ingelsta: "Norrköping",
        himmelstalund: "Norrköping",
        slottsmoellan: "Halmstad",
        rocklunda: "Västerås",
        simonsland: "Borås", friskishuset: "Borås",
        ekeby: "Uppsala", vaederkvarnsgatan: "Uppsala", vaedergatan: "Uppsala",
        tannefors: "Linköping",
        aspholmen: "Örebro",
        sveaplan: "Eskilstuna", straengnaes: "Strängnäs",
        gavlehov: "Gävle", aveny: "Gävle",
        vaernamo: "Värnamo",
        skaraborg: "Skövde",
      };
      if (map[c] !== undefined) return map[c];
      return c.charAt(0).toUpperCase() + c.slice(1);
    }
  }
  return null;
}

const NOMINATIM_UA = "HyroxVault/1.0 (https://hyroxvault.com - hyrox training club locator)";

async function geocode(query, countryCodes = "se,no,dk,fi,is") {
  const url = new URL("https://nominatim.openstreetmap.org/search");
  url.searchParams.set("q", query);
  url.searchParams.set("format", "json");
  url.searchParams.set("addressdetails", "1");
  url.searchParams.set("limit", "5");
  url.searchParams.set("countrycodes", countryCodes.toLowerCase());
  url.searchParams.set("accept-language", "en");

  // Retry transient network failures up to 4 times with exponential backoff.
  let lastErr;
  for (let attempt = 0; attempt < 4; attempt++) {
    try {
      const res = await fetch(url, {
        headers: { "User-Agent": NOMINATIM_UA, "Accept": "application/json" },
      });
      if (!res.ok) {
        throw new Error(`Nominatim ${res.status}: ${await res.text()}`);
      }
      return res.json();
    } catch (e) {
      lastErr = e;
      const wait = 2000 * (attempt + 1) ** 2;
      await sleep(wait);
    }
  }
  throw lastErr ?? new Error("Geocode failed after retries");
}

const COUNTRY_CODE_TO_NAME = { se: "Sweden", no: "Norway", dk: "Denmark", fi: "Finland", is: "Iceland" };

async function main() {
  const cache = existsSync(CACHE_PATH)
    ? JSON.parse(readFileSync(CACHE_PATH, "utf8"))
    : {};

  const stores = JSON.parse(readFileSync(STORES_PATH, "utf8"));
  console.log(`Loaded ${stores.length} stores from Hyrox dataset`);

  // Slug -> {city, country, code} overrides for cases where the slug carries no city
  // and the gym name alone is not findable in OSM. Coordinates of the city itself are
  // accurate enough for a directory map pin; we re-geocode below to attach an address.
  const SLUG_OVERRIDES = {
    "puls-mora":                 { cityHint: "Mora",        country: "Sweden",  code: "SE" },
    "wasabox":                   { cityHint: "Vaasa",       country: "Finland", code: "FI" },
    "fun-gym":                   { cityHint: "Tampere",     country: "Finland", code: "FI" }, // FUN chain HQ Tampere
    "liikuntakeskus-fun-nokia":  { cityHint: "Nokia",       country: "Finland", code: "FI" },
    "hyrox-iceland":             { cityHint: "Reykjavik",   country: "Iceland", code: "IS" },
    "hyrox-iceland-2":           { cityHint: "Reykjavik",   country: "Iceland", code: "IS" },
    "max-puls-fitness":          { cityHint: "Oslo",        country: "Norway",  code: "NO" },
    "max-puls-fitness-as":       { cityHint: "Oslo",        country: "Norway",  code: "NO" },
    "focus-norway":              { cityHint: "Oslo",        country: "Norway",  code: "NO" },
    "focus-norway-2":            { cityHint: "Oslo",        country: "Norway",  code: "NO" },
  };

  // Identify Nordic candidates.
  const candidates = [];
  for (const s of stores) {
    const slug = s.slug;
    const title = decodeTitle(s.title?.rendered ?? "");
    const cls = classify(slug, title);
    if (!cls) continue;
    if (isLikelyFalsePositive(slug, title, cls.country)) continue;
    const ov = SLUG_OVERRIDES[slug];
    const cityHint = ov?.cityHint ?? extractCityHint(slug, cls.country);
    candidates.push({
      slug,
      title,
      country: ov?.country ?? cls.country,
      countryCode: ov?.code ?? cls.code,
      cityHint,
    });
  }
  console.log(`Identified ${candidates.length} Nordic candidates`);

  if (process.argv.includes("--list")) {
    const byCountry = {};
    for (const c of candidates) {
      byCountry[c.country] ??= [];
      byCountry[c.country].push(c);
    }
    for (const [country, list] of Object.entries(byCountry)) {
      console.log(`\n=== ${country} (${list.length}) ===`);
      list.sort((a, b) => a.slug.localeCompare(b.slug));
      for (const c of list) {
        console.log(`  ${c.slug.padEnd(50)} | ${c.title.padEnd(50)} | hint=${c.cityHint ?? "?"}`);
      }
    }
    return;
  }

  const enriched = [];
  let queryCount = 0;
  // Always retry misses on re-run so transient network errors are recovered.
  const retryMisses = true;
  for (const c of candidates) {
    const cacheKey = `${c.title}|${c.cityHint ?? ""}|${c.countryCode}`;
    let result = cache[cacheKey];
    if (result?.miss && retryMisses) {
      result = null;
    }

    if (!result) {
      // Try queries from most-specific to least-specific.
      // Many gyms aren't indexed in OSM by name; falling back to neighbourhood/city
      // gives an approximate but-correct location for the map pin.
      const tail = extractSuburbHint(c.slug);
      const queries = [];
      if (c.cityHint && !c.title.toLowerCase().includes(c.cityHint.toLowerCase())) {
        queries.push(`${c.title} ${c.cityHint}`);
      }
      queries.push(c.title);
      if (tail && c.cityHint) queries.push(`${tail} ${c.cityHint}`);
      if (c.cityHint) queries.push(c.cityHint);

      let pick = null;
      let pickQuery = null;
      let pickQuality = "none";

      for (const q of queries) {
        if (pick && pickQuality === "exact") break;
        try {
          await sleep(1100);
          const hits = await geocode(q);
          queryCount++;
          // Filter to Nordic country hits only.
          const nordicHits = hits.filter((h) =>
            ["se", "no", "dk", "fi", "is"].includes((h.address?.country_code ?? "").toLowerCase()),
          );
          if (nordicHits.length === 0) continue;

          const matchInOrig = nordicHits.find((h) => h.address?.country_code?.toLowerCase() === c.countryCode.toLowerCase());
          const candidate = matchInOrig ?? nordicHits[0];

          // Heuristic quality: gym/leisure/amenity = exact; suburb/neighbourhood = approx.
          const isExact = ["leisure", "amenity", "shop"].includes(candidate.class) ||
            ["gym", "fitness_centre", "sports_centre", "fitness_center"].includes(candidate.type);
          const quality = isExact ? "exact" : (queries.indexOf(q) <= 1 ? "name" : "approx");

          // Prefer first exact-class hit; otherwise keep the first non-empty result.
          if (!pick || (quality === "exact" && pickQuality !== "exact")) {
            pick = candidate;
            pickQuery = q;
            pickQuality = quality;
          }
        } catch (e) {
          console.error(`Geocoding failed for ${c.slug} on query "${q}": ${e.message}`);
        }
      }

      if (pick) {
        result = {
          lat: parseFloat(pick.lat),
          lng: parseFloat(pick.lon),
          display_name: pick.display_name,
          address: pick.address,
          class: pick.class,
          type: pick.type,
          importance: pick.importance,
          query: pickQuery,
          quality: pickQuality,
        };
      } else {
        result = { miss: true };
      }
      cache[cacheKey] = result;
      writeFileSync(CACHE_PATH, JSON.stringify(cache, null, 2));
    }

    // If the geocoder returned a different country than originally classified, update.
    const resolvedCC = result.address?.country_code?.toLowerCase();
    const resolvedCountry = resolvedCC && COUNTRY_CODE_TO_NAME[resolvedCC]
      ? COUNTRY_CODE_TO_NAME[resolvedCC]
      : c.country;
    const resolvedCountryCode = resolvedCC ? resolvedCC.toUpperCase() : c.countryCode;

    const enrichedItem = {
      slug: c.slug,
      title: c.title,
      classifiedCountry: c.country,
      country: resolvedCountry,
      countryCode: resolvedCountryCode,
      cityHint: c.cityHint,
      ...(result.lat ? {
        lat: result.lat,
        lng: result.lng,
        resolvedAddress: result.display_name,
        resolvedCity: result.address?.city || result.address?.town || result.address?.village || result.address?.municipality,
        resolvedSuburb: result.address?.suburb || result.address?.neighbourhood,
        resolvedPostcode: result.address?.postcode,
        resolvedRoad: result.address?.road,
        resolvedHouseNumber: result.address?.house_number,
        type: result.type,
        importance: result.importance,
      } : { unresolved: true }),
    };
    enriched.push(enrichedItem);
    console.log(`[${enriched.length}/${candidates.length}] ${result.lat ? "OK " : "MISS"} ${c.slug}${result.lat ? ` -> ${result.address?.city || result.address?.town || result.address?.village || "?"}` : ""}`);
  }

  writeFileSync(OUTPUT_PATH, JSON.stringify(enriched, null, 2));
  const ok = enriched.filter((e) => !e.unresolved).length;
  console.log(`\nDone. ${ok}/${enriched.length} resolved. Queries: ${queryCount}.`);
  console.log(`Output: ${OUTPUT_PATH}`);
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
