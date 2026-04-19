import { useState, useEffect } from "react";

export type GeoRegion = "SE" | "NO" | "DK" | "FI" | "DE" | "AT" | "CH" | "GB" | "US" | "AU" | "default";

const CACHE_KEY = "hyrox_user_region";

function mapCountryToRegion(countryCode: string): GeoRegion {
  const map: Record<string, GeoRegion> = {
    SE: "SE", NO: "NO", DK: "DK", FI: "FI",
    DE: "DE", AT: "DE", CH: "DE",
    GB: "GB", IE: "GB",
    US: "US", CA: "US",
    AU: "AU", NZ: "AU",
  };
  return map[countryCode] ?? "default";
}

export function useGeoCountry(): { region: GeoRegion; loading: boolean } {
  const [region, setRegion] = useState<GeoRegion>("default");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Check session cache first to avoid repeated API calls
    const cached = sessionStorage.getItem(CACHE_KEY) as GeoRegion | null;
    if (cached) {
      setRegion(cached);
      setLoading(false);
      return;
    }

    // api.country.is is free, no key needed, just returns {"ip":"...","country":"SE"}
    fetch("https://api.country.is/")
      .then((r) => r.json())
      .then((data) => {
        const mapped = mapCountryToRegion(data.country ?? "");
        sessionStorage.setItem(CACHE_KEY, mapped);
        setRegion(mapped);
      })
      .catch(() => {
        // Silently fall back to default (Amazon global / iHerb)
        setRegion("default");
      })
      .finally(() => setLoading(false));
  }, []);

  return { region, loading };
}
