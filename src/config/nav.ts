/**
 * Canonical primary navigation — single source of truth.
 *
 * Every primary menu on the site (header ribbon, hero quick-links, and the
 * homepage "Inside the Vault" module cards) MUST render this list. Do not
 * fork it. If you need a different cut, add a separate, clearly-named export
 * (e.g. `utilityNav`) so the primary nav stays consistent everywhere.
 */

export type NavIcon =
  | "compass"
  | "dumbbell"
  | "pill"
  | "map"
  | "gauge"
  | "post"
  | "trophy";

export interface NavItem {
  /** Short label used in the header and hero grid. */
  label: string;
  /** Destination URL. */
  href: string;
  /** Optional URL prefix used to mark the link as active across subpages. */
  activePrefix?: string;
  /** Module icon key (see ModuleIcons.astro). */
  icon: NavIcon;
  /** Tailwind text-color class used for the icon and accent details. */
  iconColor: string;
  /** One-line module description used on the homepage cards. */
  description: string;
  /** Call-to-action used on the homepage cards. */
  cta: string;
  /** Short badge label used on the homepage cards. */
  badge: string;
  /** Tailwind classes for the badge pill (text/bg/border). */
  badgeColor: string;
}

export const primaryNav: NavItem[] = [
  {
    label: "Racing Guide",
    href: "/racing-guide/",
    icon: "compass",
    iconColor: "text-accent",
    description:
      "Race format, the 8 stations, categories, pacing, and what to do on race day.",
    cta: "Read the Guide",
    badge: "Start Here",
    badgeColor: "text-accent bg-accent/10 border-accent/20",
  },
  {
    label: "Training",
    href: "/training/",
    icon: "dumbbell",
    iconColor: "text-emerald-400",
    description:
      "Beginner to advanced programs, station drills, and full race simulations.",
    cta: "Start Training",
    badge: "Get Race-Ready",
    badgeColor: "text-emerald-400 bg-emerald-400/10 border-emerald-400/20",
  },
  {
    label: "Supplements",
    href: "/supplements/",
    icon: "pill",
    iconColor: "text-amber-400",
    description:
      "Evidence-based picks — creatine, protein, gels, pre-workout, electrolytes.",
    cta: "See Our Picks",
    badge: "Fuel Your Race",
    badgeColor: "text-amber-400 bg-amber-400/10 border-amber-400/20",
  },
  {
    label: "Gyms",
    href: "/gyms/map/",
    activePrefix: "/gyms/",
    icon: "map",
    iconColor: "text-emerald-400",
    description:
      "Find a Hyrox-affiliated gym near you. Train where the rigs already are.",
    cta: "Find a Gym",
    badge: "Train Local",
    badgeColor: "text-emerald-400 bg-emerald-400/10 border-emerald-400/20",
  },
  {
    label: "Time Calculator",
    href: "/calculator/",
    icon: "gauge",
    iconColor: "text-accent",
    description:
      "Enter your 5K pace and lifts. Get a full race split breakdown — instantly.",
    cta: "Calculate My Time",
    badge: "Free Tool",
    badgeColor: "text-accent bg-accent/10 border-accent/20",
  },
  {
    label: "Blog",
    href: "/blog/",
    icon: "post",
    iconColor: "text-sky-400",
    description:
      "Race strategy, training tips, and evidence-based deep-dives. Updated weekly.",
    cta: "Read the Blog",
    badge: "Latest Insights",
    badgeColor: "text-sky-400 bg-sky-400/10 border-sky-400/20",
  },
  {
    label: "Competitions",
    href: "/competitions/",
    icon: "trophy",
    iconColor: "text-amber-400",
    description:
      "Upcoming Hyrox races worldwide. Find your event, check the date, sign up.",
    cta: "Find a Race",
    badge: "Upcoming Races",
    badgeColor: "text-amber-400 bg-amber-400/10 border-amber-400/20",
  },
];

export const isNavItemActive = (item: NavItem, currentPath: string): boolean =>
  currentPath.startsWith(item.activePrefix ?? item.href);
