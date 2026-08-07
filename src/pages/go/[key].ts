import type { APIRoute } from "astro";
import {
  getLinksForProduct,
  resolveAffiliateUrl,
} from "../../data/affiliateLinks";
import { storeForCountry } from "../../data/amazon-regions";

export const prerender = false;

/**
 * Outbound affiliate redirect.
 *
 * Every "Buy on Amazon" button points here rather than at Amazon, for two
 * reasons a static page cannot handle on its own:
 *
 *  1. The right storefront depends on where the visitor is, which is only
 *     knowable per request. Vercel supplies it as `x-vercel-ip-country`.
 *  2. Clicks are otherwise invisible. Amazon reports sales, not the pages that
 *     sent them, so there was no way to tell which content actually earns.
 *     Each hop logs a line, which shows up in the Vercel function logs.
 *
 * 302, not 301: the destination genuinely varies by visitor and will change
 * again as regional tags are added, so it must not be cached as permanent.
 */
export const GET: APIRoute = async ({ params, request, redirect }) => {
  const key = params.key ?? "";
  const link = getLinksForProduct(key);

  // An unknown key means a button references a product that no longer exists.
  // Sending the visitor to the gear hub is more useful than a 404, and the log
  // line makes the broken reference findable.
  if (!link) {
    console.warn(`[go] unknown product key: ${JSON.stringify(key)}`);
    return redirect("/gear/", 302);
  }

  const country = request.headers.get("x-vercel-ip-country");
  const store = storeForCountry(country);
  const destination = resolveAffiliateUrl(link, store, country);

  console.log(
    JSON.stringify({
      event: "affiliate_click",
      key,
      country: country ?? "unknown",
      store: store.host,
      // Whether this visitor got their own storefront or fell back to the US.
      routed: store.host !== "www.amazon.com",
      referer: request.headers.get("referer") ?? null,
    }),
  );

  return redirect(destination, 302);
};
