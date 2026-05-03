# Reddit weekly cadence — r/Hyrox

This is the off-site channel chosen as the single manual lever for traffic
growth. Reddit r/Hyrox has ~80k members, asks the same long-tail
questions our pages already rank for, and one good answer can drive
1,000-10,000 visits plus a permanent backlink.

## Cadence

**Once per week**, around the same day each time. Mondays work well
because the weekend race recaps drive a wave of fresh questions.

Total time per week: ~15 minutes.

## The script

```bash
npm run reddit-prompts
```

This pulls the latest ~50 r/Hyrox posts, filters to question-shaped
posts whose titles overlap with topics already covered on the site,
ranks by opportunity, and writes a digest to
`docs/reddit-prompts.md`.

The digest is gitignored — it's an ephemeral working file.

## What to do with the digest

1. Open `docs/reddit-prompts.md`.
2. Read the top 3 thread URLs in the actual thread, not just the title.
3. Pick 1 (max 2) where one of our pages is **genuinely the best
   answer** — not just topically related.
4. Write a substantive 80-150 word comment that answers the question
   fully on its own. The link is supporting, not the body.
5. Drop the suggested URL inline once with natural anchor text.
6. Move on.

## What not to do

- **Don't link-drop.** A comment that's just "you should check out
  [our page]" gets removed and tanks your account.
- **Don't post the same answer everywhere.** Reddit recognises
  patterns and the moderators of r/Hyrox are active.
- **Don't comment if our page isn't the right answer.** The point is
  to be useful, not to inject links.
- **Don't comment on posts older than 36 hours.** Late comments get
  buried.
- **Don't comment more than 2 times per week from the same account.**
  Reddit treats high-frequency commenters with suspicion. Quality > volume.

## Account hygiene

- Use a real account that has at least some baseline activity outside
  /r/Hyrox (other subreddits, occasional non-link comments). A
  single-purpose linking account looks spammy and gets shadow-banned.
- Disclose affiliation on the account profile bio if you're posting as
  HyroxVault. Transparency over stealth.
- If a moderator removes a comment, do not repost it. Move on.

## Tracking results

Once a month, check the URL referrer in Vercel Analytics or GSC. Posts
that drove >100 referral visits are repeatable patterns — note the
prompt template that worked and look for similar threads next week.

## When to escalate

If a single comment goes unusually well (top of thread, > 50 upvotes),
that's a signal the underlying topic deserves a dedicated long-form post
with the same angle. Add it to the editorial backlog and link the
Reddit thread as the original source of the question.
