# thuannguy.github.io

Personal site and blog of Thuan Nguy Duc, built with [Astro](https://astro.build) and hosted on Cloudflare (Workers static assets). Cloudflare builds and deploys every push to `master` through its Git integration; settings are in `wrangler.jsonc`.

## Develop

```bash
npm install
npm run dev          # http://localhost:4321
npm run build        # static output in dist/
npm run cf:preview   # serve dist/ with Cloudflare's runtime, incl. _redirects and _headers
```

## Write a post

Add a Markdown file to `src/content/blog/` named `YYYY-MM-DD-slug.md`:

```markdown
---
title: "Post title"
description: "One-line summary shown in post lists and search results"
tags: [tag1, tag2]
---

Post body...
```

The post is published at `/blog/YYYY/MM/DD/slug/`. Set `published: false` to keep it as a draft. Images go in `public/images/` and are referenced as `/images/name.png`.

Site settings (name, links, navigation) live in `src/site.ts`. Redirects and response headers live in `public/_redirects` and `public/_headers`.
