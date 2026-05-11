import rss from "@astrojs/rss";
import { getAllPosts, BLOG_CATEGORY_META } from "../data/blog";

export async function GET(context) {
  const posts = await getAllPosts();
  return rss({
    title: "Hyrox Vault — Blog",
    description:
      "Hyrox training, race strategy, station technique, nutrition, and gear. New articles every week.",
    site: context.site,
    items: posts.map((post) => ({
      title: post.data.title,
      description: post.data.description,
      pubDate: post.data.pubDate,
      link: `/blog/${post.id}/`,
      categories: [
        BLOG_CATEGORY_META[post.data.category].label,
        ...(post.data.tags ?? []),
      ],
      ...(post.data.author ? { author: post.data.author } : {}),
    })),
    customData: "<language>en-us</language>",
    trailingSlash: true,
  });
}
