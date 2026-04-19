import { useState, useMemo } from "react";

interface Competition {
  city: string;
  country: string;
  date: string;
  venue: string;
  registrationUrl: string;
  status: string;
  region: string;
}

interface Props {
  competitions: Competition[];
}

export default function CompetitionTable({ competitions }: Props) {
  const [regionFilter, setRegionFilter] = useState("all");
  const [statusFilter, setStatusFilter] = useState("all");
  const [searchQuery, setSearchQuery] = useState("");

  const regions = useMemo(
    () => [...new Set(competitions.map((c) => c.region))].sort(),
    [competitions]
  );

  const filtered = useMemo(() => {
    return competitions
      .filter((c) => regionFilter === "all" || c.region === regionFilter)
      .filter((c) => statusFilter === "all" || c.status === statusFilter)
      .filter(
        (c) =>
          searchQuery === "" ||
          c.city.toLowerCase().includes(searchQuery.toLowerCase()) ||
          c.country.toLowerCase().includes(searchQuery.toLowerCase()) ||
          c.venue.toLowerCase().includes(searchQuery.toLowerCase())
      )
      .sort((a, b) => a.date.localeCompare(b.date));
  }, [competitions, regionFilter, statusFilter, searchQuery]);

  const formatDate = (dateStr: string) => {
    const date = new Date(dateStr + "T00:00:00");
    return date.toLocaleDateString("en-US", {
      weekday: "short",
      month: "long",
      day: "numeric",
      year: "numeric",
    });
  };

  const getStatusBadge = (status: string) => {
    const styles: Record<string, string> = {
      open: "bg-emerald-500/10 text-emerald-400 border-emerald-500/20",
      coming_soon: "bg-amber-500/10 text-amber-400 border-amber-500/20",
      sold_out: "bg-red-500/10 text-red-400 border-red-500/20",
    };
    const labels: Record<string, string> = {
      open: "Open",
      coming_soon: "Coming Soon",
      sold_out: "Sold Out",
    };
    return (
      <span
        className={`inline-flex px-2.5 py-0.5 text-xs font-semibold rounded-full border ${styles[status] ?? styles.open}`}
      >
        {labels[status] ?? status}
      </span>
    );
  };

  const daysUntil = (dateStr: string) => {
    const now = new Date();
    const target = new Date(dateStr + "T00:00:00");
    const diff = Math.ceil(
      (target.getTime() - now.getTime()) / (1000 * 60 * 60 * 24)
    );
    if (diff < 0) return "Past";
    if (diff === 0) return "Today!";
    if (diff === 1) return "Tomorrow";
    return `${diff} days`;
  };

  const inputClass =
    "px-4 py-3 bg-[#131316] border border-[#27272a] rounded-xl text-[#e4e4e7] placeholder:text-[#a1a1aa] focus:outline-none focus:border-[#38bdf8] transition-colors text-sm";

  return (
    <div>
      <div className="flex flex-col sm:flex-row gap-3 mb-8">
        <input
          type="text"
          placeholder="Search city, country, or venue..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className={`flex-1 ${inputClass}`}
        />
        <select
          value={regionFilter}
          onChange={(e) => setRegionFilter(e.target.value)}
          className={`${inputClass} cursor-pointer`}
        >
          <option value="all">All Regions</option>
          {regions.map((r) => (
            <option key={r} value={r}>
              {r}
            </option>
          ))}
        </select>
        <select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
          className={`${inputClass} cursor-pointer`}
        >
          <option value="all">All Statuses</option>
          <option value="open">Open</option>
          <option value="coming_soon">Coming Soon</option>
          <option value="sold_out">Sold Out</option>
        </select>
      </div>

      <p className="text-sm text-[#a1a1aa] mb-4">
        Showing {filtered.length} of {competitions.length} competitions
      </p>

      {filtered.length === 0 ? (
        <div className="text-center py-16 text-[#a1a1aa]">
          <p className="text-lg mb-2">No competitions match your filters.</p>
          <button
            onClick={() => {
              setRegionFilter("all");
              setStatusFilter("all");
              setSearchQuery("");
            }}
            className="text-[#38bdf8] hover:underline text-sm"
          >
            Clear all filters
          </button>
        </div>
      ) : (
        <div className="space-y-4">
          {filtered.map((comp) => (
            <div
              key={`${comp.city}-${comp.date}`}
              className="bg-[#131316] border border-[#27272a] rounded-2xl p-6 hover:border-[#3f3f46] transition-all group"
            >
              <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-2">
                    <h3 className="text-xl font-bold text-white">
                      {comp.city}
                    </h3>
                    {getStatusBadge(comp.status)}
                  </div>
                  <div className="flex flex-wrap gap-x-6 gap-y-1 text-sm text-[#a1a1aa]">
                    <span>{comp.country}</span>
                    <span>{formatDate(comp.date)}</span>
                    <span>{comp.venue}</span>
                  </div>
                </div>
                <div className="flex items-center gap-4">
                  <div className="text-right hidden sm:block">
                    <div className="text-xs text-[#a1a1aa]">Countdown</div>
                    <div className="text-[#38bdf8] font-bold">
                      {daysUntil(comp.date)}
                    </div>
                  </div>
                  <a
                    href={comp.registrationUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className={`inline-flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-bold transition-all ${
                      comp.status === "sold_out"
                        ? "bg-[#27272a] text-[#a1a1aa] cursor-not-allowed"
                        : "bg-[#38bdf8] text-[#09090b] hover:bg-[#0ea5e9] hover:shadow-[0_0_20px_rgba(56,189,248,0.2)]"
                    }`}
                  >
                    {comp.status === "sold_out"
                      ? "Sold Out"
                      : comp.status === "coming_soon"
                        ? "Notify Me"
                        : "Register"}
                    <svg
                      className="w-4 h-4"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14"
                      />
                    </svg>
                  </a>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
