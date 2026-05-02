/**
 * Satori template for HyroxVault Open Graph cards.
 *
 * Returns a plain element tree (no JSX) so this file works in Astro's
 * static-build context without a TSX pipeline. The shape mirrors
 * React-flavoured nodes that satori expects: { type, props: { children, style, ... } }.
 *
 * Card layout (1200 x 630):
 *  - Dark bg with subtle grid + radial accent glow
 *  - Top: HYROXVAULT wordmark + category pill
 *  - Middle: title (auto-shrinks for long copy)
 *  - Bottom: 8-station course ribbon + domain
 */

export interface OgTemplateInput {
  title: string;
  category?: string;
  domain?: string;
}

type Node = {
  type: string;
  props: {
    style?: Record<string, unknown>;
    children?: Node | string | Array<Node | string>;
    [key: string]: unknown;
  };
};

const el = (
  type: string,
  style: Record<string, unknown>,
  children?: Node | string | Array<Node | string>
): Node => ({
  type,
  props: { style, ...(children !== undefined ? { children } : {}) },
});

const COLORS = {
  bg: "#09090b",
  bgCard: "#131316",
  border: "#27272a",
  borderAccent: "rgba(56,189,248,0.45)",
  accent: "#38bdf8",
  accentDim: "#0ea5e9",
  text: "#fafafa",
  textMuted: "#a1a1aa",
};

function pickTitleSize(title: string): number {
  const len = title.length;
  if (len <= 36) return 84;
  if (len <= 56) return 72;
  if (len <= 78) return 60;
  if (len <= 110) return 50;
  return 42;
}

function categoryLabel(category?: string): string | null {
  if (!category) return null;
  const map: Record<string, string> = {
    blog: "Blog",
    training: "Training",
    nutrition: "Nutrition",
    "race-strategy": "Race Strategy",
    "station-guides": "Station Guides",
    gear: "Gear",
    beginner: "Beginner",
    "race-recaps": "Race Recap",
    news: "News",
    supplements: "Supplements",
    "racing-guide": "Racing Guide",
    calculator: "Calculator",
    gyms: "Gyms",
    competitions: "Competitions",
    home: "HyroxVault",
    about: "About",
    faq: "FAQ",
    glossary: "Glossary",
    qualifiers: "Qualifiers",
    events: "Events",
    compare: "Compare",
    times: "Times",
    stations: "Stations",
    workouts: "Workouts",
    "training-plans": "Training Plans",
  };
  return map[category] ?? category.replace(/-/g, " ");
}

function courseRibbonNode(): Node {
  const stations = ["1", "2", "3", "4", "5", "6", "7", "8"];
  return el(
    "div",
    {
      display: "flex",
      alignItems: "center",
      gap: "10px",
    },
    stations.flatMap((s, i) => {
      const items: Node[] = [];
      if (i > 0) {
        items.push(
          el("div", {
            width: "26px",
            height: "2px",
            background: `linear-gradient(90deg, ${COLORS.accent}, ${COLORS.accentDim})`,
            opacity: 0.55,
            borderRadius: "1px",
          })
        );
      }
      items.push(
        el(
          "div",
          {
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            width: "44px",
            height: "44px",
            borderRadius: "22px",
            background: "rgba(56,189,248,0.10)",
            border: `1.5px solid ${COLORS.borderAccent}`,
            color: COLORS.accent,
            fontWeight: 800,
            fontSize: 18,
          },
          s
        )
      );
      return items;
    })
  );
}

export function ogTemplate({ title, category, domain = "hyroxvault.com" }: OgTemplateInput): Node {
  const fontSize = pickTitleSize(title);
  const cat = categoryLabel(category);

  return el(
    "div",
    {
      width: "1200px",
      height: "630px",
      display: "flex",
      flexDirection: "column",
      justifyContent: "space-between",
      padding: "60px 70px",
      background: `radial-gradient(ellipse 80% 60% at 18% 0%, rgba(56,189,248,0.18), transparent 70%), radial-gradient(ellipse 60% 50% at 100% 100%, rgba(129,140,248,0.14), transparent 65%), ${COLORS.bg}`,
      color: COLORS.text,
      fontFamily: "Inter",
      position: "relative",
    },
    [
      el(
        "div",
        {
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          width: "100%",
        },
        [
          el(
            "div",
            { display: "flex", alignItems: "center", gap: "14px" },
            [
              el(
                "div",
                {
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  width: "44px",
                  height: "44px",
                  borderRadius: "10px",
                  background: COLORS.accent,
                  color: COLORS.bg,
                  fontSize: 26,
                  fontWeight: 900,
                },
                "H"
              ),
              el(
                "div",
                {
                  display: "flex",
                  fontSize: 28,
                  fontWeight: 900,
                  letterSpacing: "-0.01em",
                  color: COLORS.text,
                },
                [
                  el("span", { color: COLORS.text }, "HYROX"),
                  el("span", { color: COLORS.accent }, "VAULT"),
                ]
              ),
            ]
          ),
          ...(cat
            ? [
                el(
                  "div",
                  {
                    display: "flex",
                    padding: "8px 18px",
                    borderRadius: "999px",
                    background: "rgba(56,189,248,0.12)",
                    border: `1.5px solid ${COLORS.borderAccent}`,
                    color: COLORS.accent,
                    fontSize: 18,
                    fontWeight: 700,
                    textTransform: "uppercase",
                    letterSpacing: "0.08em",
                  },
                  cat
                ),
              ]
            : []),
        ]
      ),

      el(
        "div",
        {
          display: "flex",
          flexDirection: "column",
          maxWidth: "1060px",
        },
        [
          el(
            "div",
            {
              display: "flex",
              fontSize,
              lineHeight: 1.08,
              fontWeight: 900,
              letterSpacing: "-0.02em",
              color: COLORS.text,
            },
            title
          ),
        ]
      ),

      el(
        "div",
        {
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          width: "100%",
        },
        [
          courseRibbonNode(),
          el(
            "div",
            {
              display: "flex",
              alignItems: "center",
              gap: "10px",
              fontSize: 22,
              fontWeight: 600,
              color: COLORS.textMuted,
            },
            [
              el("div", {
                width: "10px",
                height: "10px",
                borderRadius: "5px",
                background: COLORS.accent,
              }),
              domain,
            ]
          ),
        ]
      ),
    ]
  );
}
