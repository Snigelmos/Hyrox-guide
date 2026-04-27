import { useEffect, useMemo, useRef, useState } from "react";
import "leaflet/dist/leaflet.css";
import "leaflet.markercluster/dist/MarkerCluster.css";
import "leaflet.markercluster/dist/MarkerCluster.Default.css";
import {
  GYMS,
  AFFILIATION_LABELS,
  listCountries,
  type AffiliationType,
  type Gym,
} from "../data/gym-finder";

interface GymMapProps {
  mode?: "full" | "city" | "single";
  citySlug?: string;
  singleSlug?: string;
  height?: string;
}

interface UrlFilters {
  country: string;
  type: AffiliationType | "";
  q: string;
}

const DEFAULT_FILTERS: UrlFilters = { country: "", type: "", q: "" };

function readUrlFilters(): UrlFilters {
  if (typeof window === "undefined") return DEFAULT_FILTERS;
  const params = new URLSearchParams(window.location.search);
  return {
    country: params.get("country") ?? "",
    type: (params.get("type") as AffiliationType | null) ?? "",
    q: params.get("q") ?? "",
  };
}

function writeUrlFilters(f: UrlFilters): void {
  if (typeof window === "undefined") return;
  const params = new URLSearchParams();
  if (f.country) params.set("country", f.country);
  if (f.type) params.set("type", f.type);
  if (f.q) params.set("q", f.q);
  const qs = params.toString();
  const next = qs ? `${window.location.pathname}?${qs}` : window.location.pathname;
  window.history.replaceState({}, "", next);
}

export default function GymMap({
  mode = "full",
  citySlug,
  singleSlug,
  height,
}: GymMapProps) {
  const containerRef = useRef<HTMLDivElement | null>(null);
  const mapRef = useRef<unknown>(null);
  const clusterRef = useRef<unknown>(null);
  const [ready, setReady] = useState(false);
  const [filters, setFilters] = useState<UrlFilters>(DEFAULT_FILTERS);

  useEffect(() => {
    if (mode === "full") setFilters(readUrlFilters());
  }, [mode]);

  const filteredGyms = useMemo<Gym[]>(() => {
    let list: Gym[] = GYMS;
    if (mode === "single" && singleSlug) {
      list = GYMS.filter((g) => g.slug === singleSlug);
      return list;
    }
    if (mode === "city" && citySlug) {
      list = GYMS.filter((g) => g.citySlug === citySlug);
      return list;
    }
    if (filters.country) list = list.filter((g) => g.countryCode === filters.country);
    if (filters.type) list = list.filter((g) => g.affiliationType === filters.type);
    if (filters.q) {
      const q = filters.q.toLowerCase();
      list = list.filter(
        (g) =>
          g.name.toLowerCase().includes(q) ||
          g.city.toLowerCase().includes(q) ||
          (g.neighbourhood ?? "").toLowerCase().includes(q),
      );
    }
    return list;
  }, [mode, citySlug, singleSlug, filters]);

  useEffect(() => {
    let disposed = false;
    let resizeObs: ResizeObserver | null = null;

    async function init() {
      if (!containerRef.current) return;
      const [{ default: L }] = await Promise.all([
        import("leaflet"),
        import("leaflet.markercluster"),
      ]);

      if (disposed || !containerRef.current) return;

      // Custom Hyrox-branded SVG pin (replaces Leaflet's default raster pins).
      const pinSvg =
        '<svg xmlns="http://www.w3.org/2000/svg" width="34" height="44" viewBox="0 0 34 44"><defs><filter id="s" x="-20%" y="-20%" width="140%" height="140%"><feDropShadow dx="0" dy="2" stdDeviation="2" flood-opacity="0.35"/></filter></defs><path filter="url(#s)" d="M17 1c8.284 0 15 6.716 15 15 0 11-15 27-15 27S2 27 2 16C2 7.716 8.716 1 17 1z" fill="#38bdf8" stroke="#0c4a6e" stroke-width="1.5"/><circle cx="17" cy="16" r="6" fill="#09090b"/></svg>';
      const pinUrl = `data:image/svg+xml;utf8,${encodeURIComponent(pinSvg)}`;
      const icon = L.icon({
        iconUrl: pinUrl,
        iconSize: [34, 44],
        iconAnchor: [17, 42],
        popupAnchor: [0, -38],
      });

      // Initial view based on filtered gyms (or world view if empty).
      let center: [number, number] = [30, 10];
      let zoom = 2;
      if (filteredGyms.length === 1) {
        center = [filteredGyms[0].lat, filteredGyms[0].lng];
        zoom = 14;
      } else if (filteredGyms.length > 0 && (mode === "city" || mode === "single")) {
        const avgLat = filteredGyms.reduce((s, g) => s + g.lat, 0) / filteredGyms.length;
        const avgLng = filteredGyms.reduce((s, g) => s + g.lng, 0) / filteredGyms.length;
        center = [avgLat, avgLng];
        zoom = filteredGyms.length === 1 ? 14 : 12;
      }

      const map = L.map(containerRef.current, {
        center,
        zoom,
        scrollWheelZoom: mode === "full",
        zoomControl: true,
        worldCopyJump: true,
      });
      mapRef.current = map;

      L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
        attribution:
          '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
        maxZoom: 19,
      }).addTo(map);

      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const cluster = (L as any).markerClusterGroup({
        showCoverageOnHover: false,
        spiderfyOnMaxZoom: true,
        maxClusterRadius: 50,
      });
      clusterRef.current = cluster;

      for (const g of filteredGyms) {
        const popup = `
          <div style="font-family: Inter, system-ui, sans-serif; min-width: 220px;">
            <div style="font-weight: 800; color: #fafafa; font-size: 14px; line-height: 1.3; margin-bottom: 4px;">${escapeHtml(g.name)}</div>
            ${g.neighbourhood ? `<div style="color: #38bdf8; font-size: 11px; font-weight: 700; text-transform: uppercase; letter-spacing: 0.05em; margin-bottom: 6px;">${escapeHtml(g.neighbourhood)}, ${escapeHtml(g.city)}</div>` : `<div style="color: #38bdf8; font-size: 11px; font-weight: 700; text-transform: uppercase; letter-spacing: 0.05em; margin-bottom: 6px;">${escapeHtml(g.city)}</div>`}
            <div style="color: #a1a1aa; font-size: 12px; line-height: 1.5; margin-bottom: 8px;">${escapeHtml(g.address)}</div>
            <div style="display: flex; gap: 8px; flex-wrap: wrap;">
              <a href="/gyms/g/${g.slug}/" style="display: inline-block; padding: 6px 10px; background: #38bdf8; color: #09090b; font-weight: 700; font-size: 12px; border-radius: 6px; text-decoration: none;">Details</a>
              ${g.website ? `<a href="${g.website}" target="_blank" rel="noopener noreferrer" style="display: inline-block; padding: 6px 10px; background: transparent; color: #38bdf8; border: 1px solid #38bdf8; font-weight: 700; font-size: 12px; border-radius: 6px; text-decoration: none;">Website &rarr;</a>` : ""}
            </div>
          </div>
        `;
        const marker = L.marker([g.lat, g.lng], { icon }).bindPopup(popup);
        cluster.addLayer(marker);
      }
      map.addLayer(cluster);

      // Fit world view bounds when in full mode.
      if (mode === "full" && filteredGyms.length > 1) {
        const bounds = L.latLngBounds(filteredGyms.map((g) => [g.lat, g.lng] as [number, number]));
        map.fitBounds(bounds, { padding: [40, 40], maxZoom: 6 });
      }

      // Ensure tiles render on async size changes (sidebar collapse, mobile rotate).
      resizeObs = new ResizeObserver(() => {
        map.invalidateSize();
      });
      resizeObs.observe(containerRef.current);

      setReady(true);
    }

    init();

    return () => {
      disposed = true;
      resizeObs?.disconnect();
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const m = mapRef.current as any;
      if (m && typeof m.remove === "function") m.remove();
      mapRef.current = null;
      clusterRef.current = null;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [mode, citySlug, singleSlug]);

  // Reactive marker rebuild when filters change (full mode only).
  useEffect(() => {
    if (mode !== "full" || !ready) return;
    if (typeof window === "undefined") return;
    let cancelled = false;
    (async () => {
      const { default: L } = await import("leaflet");
      if (cancelled) return;
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const cluster = clusterRef.current as any;
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const map = mapRef.current as any;
      if (!cluster || !map) return;

      const pinSvg =
        '<svg xmlns="http://www.w3.org/2000/svg" width="34" height="44" viewBox="0 0 34 44"><defs><filter id="s" x="-20%" y="-20%" width="140%" height="140%"><feDropShadow dx="0" dy="2" stdDeviation="2" flood-opacity="0.35"/></filter></defs><path filter="url(#s)" d="M17 1c8.284 0 15 6.716 15 15 0 11-15 27-15 27S2 27 2 16C2 7.716 8.716 1 17 1z" fill="#38bdf8" stroke="#0c4a6e" stroke-width="1.5"/><circle cx="17" cy="16" r="6" fill="#09090b"/></svg>';
      const icon = L.icon({
        iconUrl: `data:image/svg+xml;utf8,${encodeURIComponent(pinSvg)}`,
        iconSize: [34, 44],
        iconAnchor: [17, 42],
        popupAnchor: [0, -38],
      });

      cluster.clearLayers();
      for (const g of filteredGyms) {
        const popup = `
          <div style="font-family: Inter, system-ui, sans-serif; min-width: 220px;">
            <div style="font-weight: 800; color: #fafafa; font-size: 14px; line-height: 1.3; margin-bottom: 4px;">${escapeHtml(g.name)}</div>
            ${g.neighbourhood ? `<div style="color: #38bdf8; font-size: 11px; font-weight: 700; text-transform: uppercase; letter-spacing: 0.05em; margin-bottom: 6px;">${escapeHtml(g.neighbourhood)}, ${escapeHtml(g.city)}</div>` : `<div style="color: #38bdf8; font-size: 11px; font-weight: 700; text-transform: uppercase; letter-spacing: 0.05em; margin-bottom: 6px;">${escapeHtml(g.city)}</div>`}
            <div style="color: #a1a1aa; font-size: 12px; line-height: 1.5; margin-bottom: 8px;">${escapeHtml(g.address)}</div>
            <div style="display: flex; gap: 8px; flex-wrap: wrap;">
              <a href="/gyms/g/${g.slug}/" style="display: inline-block; padding: 6px 10px; background: #38bdf8; color: #09090b; font-weight: 700; font-size: 12px; border-radius: 6px; text-decoration: none;">Details</a>
              ${g.website ? `<a href="${g.website}" target="_blank" rel="noopener noreferrer" style="display: inline-block; padding: 6px 10px; background: transparent; color: #38bdf8; border: 1px solid #38bdf8; font-weight: 700; font-size: 12px; border-radius: 6px; text-decoration: none;">Website &rarr;</a>` : ""}
            </div>
          </div>
        `;
        cluster.addLayer(L.marker([g.lat, g.lng], { icon }).bindPopup(popup));
      }
      if (filteredGyms.length > 1) {
        const bounds = L.latLngBounds(
          filteredGyms.map((g) => [g.lat, g.lng] as [number, number]),
        );
        map.fitBounds(bounds, { padding: [40, 40], maxZoom: 6 });
      } else if (filteredGyms.length === 1) {
        map.setView([filteredGyms[0].lat, filteredGyms[0].lng], 13);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [filteredGyms, mode, ready]);

  function updateFilter<K extends keyof UrlFilters>(key: K, value: UrlFilters[K]) {
    const next = { ...filters, [key]: value };
    setFilters(next);
    writeUrlFilters(next);
  }

  function clearFilters() {
    setFilters(DEFAULT_FILTERS);
    writeUrlFilters(DEFAULT_FILTERS);
  }

  const countries = useMemo(() => listCountries(), []);
  const showFilters = mode === "full";
  const mapHeight =
    height ??
    (mode === "full"
      ? "min(70vh, 720px)"
      : mode === "city"
        ? "420px"
        : "320px");

  return (
    <div className="rounded-2xl overflow-hidden border border-border bg-bg-card">
      {showFilters && (
        <div className="p-4 md:p-5 border-b border-border bg-bg-card-hover">
          <div className="grid gap-3 md:grid-cols-[1fr_auto_auto_auto]">
            <input
              type="search"
              placeholder="Search by gym, city or neighbourhood"
              value={filters.q}
              onChange={(e) => updateFilter("q", e.target.value)}
              className="w-full px-4 py-2.5 rounded-lg bg-bg border border-border text-text placeholder:text-text-muted focus:outline-none focus:ring-2 focus:ring-accent focus:border-accent text-sm"
              aria-label="Search gyms"
            />
            <select
              value={filters.country}
              onChange={(e) => updateFilter("country", e.target.value)}
              className="px-4 py-2.5 rounded-lg bg-bg border border-border text-text focus:outline-none focus:ring-2 focus:ring-accent text-sm min-w-[160px]"
              aria-label="Filter by country"
            >
              <option value="">All countries</option>
              {countries.map((c) => (
                <option key={c.countryCode} value={c.countryCode}>
                  {c.country} ({c.gyms.length})
                </option>
              ))}
            </select>
            <select
              value={filters.type}
              onChange={(e) => updateFilter("type", e.target.value as AffiliationType | "")}
              className="px-4 py-2.5 rounded-lg bg-bg border border-border text-text focus:outline-none focus:ring-2 focus:ring-accent text-sm min-w-[160px]"
              aria-label="Filter by type"
            >
              <option value="">All types</option>
              {(Object.keys(AFFILIATION_LABELS) as AffiliationType[]).map((t) => (
                <option key={t} value={t}>
                  {AFFILIATION_LABELS[t]}
                </option>
              ))}
            </select>
            <button
              type="button"
              onClick={clearFilters}
              className="px-4 py-2.5 rounded-lg bg-transparent border border-border text-text-muted hover:text-text hover:border-border-hover text-sm font-medium"
            >
              Clear
            </button>
          </div>
          <div className="mt-3 text-xs text-text-muted">
            Showing <span className="text-accent font-bold">{filteredGyms.length}</span> {filteredGyms.length === 1 ? "gym" : "gyms"}
            {filters.country || filters.type || filters.q ? " (filtered)" : ""}
          </div>
        </div>
      )}
      <div
        ref={containerRef}
        style={{ height: mapHeight, width: "100%" }}
        className="bg-bg"
        aria-label="Hyrox gym map"
        role="application"
      />
    </div>
  );
}

function escapeHtml(s: string): string {
  return s
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");
}
