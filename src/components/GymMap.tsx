import { useEffect, useMemo, useRef, useState } from "react";
import L from "leaflet";
import "leaflet.markercluster";
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
          (g.neighbourhood ?? "").toLowerCase().includes(q) ||
          g.country.toLowerCase().includes(q) ||
          g.countryCode.toLowerCase() === q,
      );
    }
    return list;
  }, [mode, citySlug, singleSlug, filters]);

  useEffect(() => {
    if (!containerRef.current) return;
    let resizeObs: ResizeObserver | null = null;

    try {
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

      L.tileLayer("https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png", {
        attribution:
          '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors &copy; <a href="https://carto.com/attributions">CARTO</a>',
        maxZoom: 19,
      }).addTo(map);

      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const cluster = (L as any).markerClusterGroup({
        showCoverageOnHover: false,
        spiderfyOnMaxZoom: true,
        maxClusterRadius: 50,
        iconCreateFunction: (markerCluster: { getChildCount: () => number }) =>
          buildClusterIcon(markerCluster.getChildCount()),
      });
      clusterRef.current = cluster;

      const icon = buildPinIcon();
      for (const g of filteredGyms) {
        cluster.addLayer(L.marker([g.lat, g.lng], { icon }).bindPopup(buildPopup(g)));
      }
      map.addLayer(cluster);

      if (mode === "full" && filteredGyms.length > 1) {
        const bounds = L.latLngBounds(filteredGyms.map((g) => [g.lat, g.lng] as [number, number]));
        map.fitBounds(bounds, { padding: [40, 40], maxZoom: 6 });
      }

      resizeObs = new ResizeObserver(() => {
        map.invalidateSize();
      });
      resizeObs.observe(containerRef.current);

      // Force a tile reflow once the browser has painted (fixes intermittent
      // black-canvas issue when the container is mounted with delayed layout).
      requestAnimationFrame(() => {
        if (mapRef.current) (mapRef.current as L.Map).invalidateSize();
      });

      setReady(true);
    } catch (err) {
      console.error("[GymMap] Failed to initialise Leaflet map:", err);
    }

    return () => {
      resizeObs?.disconnect();
      const m = mapRef.current as L.Map | null;
      if (m && typeof m.remove === "function") m.remove();
      mapRef.current = null;
      clusterRef.current = null;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [mode, citySlug, singleSlug]);

  // Reactive marker rebuild when filters change (full mode only).
  useEffect(() => {
    if (mode !== "full" || !ready) return;
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const cluster = clusterRef.current as any;
    const map = mapRef.current as L.Map | null;
    if (!cluster || !map) return;

    try {
      const icon = buildPinIcon();
      cluster.clearLayers();
      for (const g of filteredGyms) {
        cluster.addLayer(L.marker([g.lat, g.lng], { icon }).bindPopup(buildPopup(g)));
      }
      if (filteredGyms.length > 1) {
        const bounds = L.latLngBounds(
          filteredGyms.map((g) => [g.lat, g.lng] as [number, number]),
        );
        map.fitBounds(bounds, { padding: [40, 40], maxZoom: 6 });
      } else if (filteredGyms.length === 1) {
        map.setView([filteredGyms[0].lat, filteredGyms[0].lng], 13);
      }
    } catch (err) {
      console.error("[GymMap] Failed to update markers:", err);
    }
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
    <div className="hyrox-map-shell rounded-2xl overflow-hidden border border-border bg-bg">
      {showFilters && (
        <div className="p-4 md:p-5 border-b border-border bg-bg-card-hover">
          <div className="flex flex-wrap md:grid md:grid-cols-[1fr_auto_auto_auto] gap-3">
            <input
              type="search"
              placeholder="Search by gym, city, neighbourhood, or country"
              value={filters.q}
              onChange={(e) => updateFilter("q", e.target.value)}
              className="basis-full md:basis-auto w-full px-4 py-2.5 rounded-lg bg-bg border border-border text-text placeholder:text-text-muted focus:outline-none focus:ring-2 focus:ring-accent focus:border-accent text-base"
              aria-label="Search gyms"
            />
            <select
              value={filters.country}
              onChange={(e) => updateFilter("country", e.target.value)}
              className="flex-1 min-w-0 md:min-w-[160px] px-4 py-2.5 rounded-lg bg-bg border border-border text-text focus:outline-none focus:ring-2 focus:ring-accent text-base"
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
              className="flex-1 min-w-0 md:min-w-[160px] px-4 py-2.5 rounded-lg bg-bg border border-border text-text focus:outline-none focus:ring-2 focus:ring-accent text-base"
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
              className="basis-full md:basis-auto px-4 py-2.5 rounded-lg bg-transparent border border-border text-text-muted hover:text-text hover:border-border-hover text-sm font-medium"
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
        className="hyrox-map-canvas"
        aria-label="Hyrox gym map"
        role="application"
      />
      <style>{`
        .hyrox-map-shell {
          background: #06111a;
        }
        .hyrox-map-canvas {
          background: #06111a;
        }
        .hyrox-map-canvas .leaflet-container {
          background: #06111a;
          color: #d7eef6;
          min-height: 100%;
        }
        .hyrox-map-canvas .leaflet-tile-pane {
          filter: saturate(0.88) contrast(1.04) brightness(0.92);
        }
        .hyrox-map-canvas .leaflet-control-zoom a,
        .hyrox-map-canvas .leaflet-bar a {
          background: #071824;
          border-bottom-color: #17384a;
          color: #d7eef6;
        }
        .hyrox-map-canvas .leaflet-control-zoom a:hover,
        .hyrox-map-canvas .leaflet-control-zoom a:focus,
        .hyrox-map-canvas .leaflet-bar a:hover,
        .hyrox-map-canvas .leaflet-bar a:focus {
          background: #0b2233;
          color: #67e8f9;
        }
        .hyrox-map-canvas .leaflet-bar {
          border: 1px solid #17384a;
          box-shadow: 0 6px 18px rgba(0, 0, 0, 0.45);
        }
        .hyrox-map-canvas .leaflet-control-attribution,
        .hyrox-map-canvas .leaflet-control-attribution.leaflet-control {
          background: rgba(7, 24, 36, 0.85);
          color: #9cc9d8;
          border-top-left-radius: 6px;
          padding: 2px 8px;
          font-size: 10px;
          backdrop-filter: blur(2px);
          -webkit-backdrop-filter: blur(2px);
        }
        .hyrox-map-canvas .leaflet-control-attribution a {
          color: #67e8f9;
        }
        .hyrox-map-canvas .leaflet-control-attribution a:hover {
          color: #a5f3fc;
        }
        .hyrox-map-canvas .leaflet-control-scale-line {
          background: rgba(7, 24, 36, 0.78);
          color: #d7eef6;
          border-color: #17384a;
          text-shadow: none;
        }
        .hyrox-map-canvas .leaflet-popup-content-wrapper,
        .hyrox-map-canvas .leaflet-popup-tip {
          background: #071824;
          border: 1px solid #17384a;
          box-shadow: 0 18px 48px rgba(0, 0, 0, 0.42);
        }
        .hyrox-map-canvas .leaflet-popup-content {
          margin: 14px;
        }
        .hyrox-map-canvas .leaflet-popup-close-button {
          color: #9cc9d8;
        }
        .hyrox-map-canvas .leaflet-popup-close-button:hover {
          color: #67e8f9;
        }
        @supports (padding: max(0px)) {
          .hyrox-map-canvas .leaflet-bottom.leaflet-right,
          .hyrox-map-canvas .leaflet-bottom.leaflet-left {
            padding-bottom: max(0px, env(safe-area-inset-bottom));
          }
        }
        .hyrox-cluster {
          background: rgba(8, 47, 73, 0.38);
          border-radius: 999px;
          border: 1px solid rgba(103, 232, 249, 0.38);
          box-shadow: 0 0 0 5px rgba(14, 116, 144, 0.12), 0 10px 28px rgba(0, 0, 0, 0.45);
        }
        .hyrox-cluster__inner {
          width: 100%;
          height: 100%;
          display: flex;
          align-items: center;
          justify-content: center;
          border-radius: 999px;
          background: radial-gradient(circle at 35% 30%, #155e75 0%, #0e7490 45%, #083344 100%);
          color: #ecfeff;
          font-size: 12px;
          font-weight: 900;
          letter-spacing: -0.02em;
          border: 1px solid rgba(236, 254, 255, 0.18);
        }
      `}</style>
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

function buildPinIcon(): L.Icon {
  const pinSvg =
    '<svg xmlns="http://www.w3.org/2000/svg" width="34" height="44" viewBox="0 0 34 44"><defs><linearGradient id="g" x1="8" y1="4" x2="27" y2="36" gradientUnits="userSpaceOnUse"><stop stop-color="#155e75"/><stop offset="0.58" stop-color="#0e7490"/><stop offset="1" stop-color="#083344"/></linearGradient><filter id="s" x="-28%" y="-20%" width="156%" height="150%"><feDropShadow dx="0" dy="4" stdDeviation="3" flood-color="#000000" flood-opacity="0.45"/></filter></defs><path filter="url(#s)" d="M17 1c8.284 0 15 6.716 15 15 0 11-15 27-15 27S2 27 2 16C2 7.716 8.716 1 17 1z" fill="url(#g)" stroke="#67e8f9" stroke-opacity="0.72" stroke-width="1.4"/><circle cx="17" cy="16" r="6" fill="#06111a" stroke="#cffafe" stroke-opacity="0.55" stroke-width="1"/></svg>';
  return L.icon({
    iconUrl: `data:image/svg+xml;utf8,${encodeURIComponent(pinSvg)}`,
    iconSize: [34, 44],
    iconAnchor: [17, 42],
    popupAnchor: [0, -38],
  });
}

function buildClusterIcon(count: number): L.DivIcon {
  const size = count >= 100 ? 48 : count >= 10 ? 42 : 36;
  return L.divIcon({
    html: `<span class="hyrox-cluster__inner">${count}</span>`,
    className: "hyrox-cluster",
    iconSize: [size, size],
  });
}

function buildPopup(g: Gym): string {
  const subtitle = g.neighbourhood ? `${g.neighbourhood}, ${g.city}` : g.city;
  const externalUrl =
    g.website ??
    `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(`${g.name} ${g.city} ${g.country}`)}`;
  const externalLabel = g.website ? "Website &rarr;" : "Find on Google &rarr;";
  return `
    <div style="font-family: Inter, system-ui, sans-serif; min-width: 220px;">
      <div style="font-weight: 800; color: #fafafa; font-size: 14px; line-height: 1.3; margin-bottom: 4px;">${escapeHtml(g.name)}</div>
      <div style="color: #38bdf8; font-size: 11px; font-weight: 700; text-transform: uppercase; letter-spacing: 0.05em; margin-bottom: 6px;">${escapeHtml(subtitle)}</div>
      <div style="color: #a1a1aa; font-size: 12px; line-height: 1.5; margin-bottom: 8px;">${escapeHtml(g.address)}</div>
      <div style="display: flex; gap: 8px; flex-wrap: wrap;">
        <a href="/gyms/g/${g.slug}/" style="display: inline-block; padding: 6px 10px; background: #38bdf8; color: #09090b; font-weight: 700; font-size: 12px; border-radius: 6px; text-decoration: none;">Details</a>
        <a href="${externalUrl}" target="_blank" rel="noopener noreferrer" style="display: inline-block; padding: 6px 10px; background: transparent; color: #38bdf8; border: 1px solid #38bdf8; font-weight: 700; font-size: 12px; border-radius: 6px; text-decoration: none;">${externalLabel}</a>
      </div>
    </div>
  `;
}
