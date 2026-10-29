# thuannguy.github.io

Personal site and blog of Thuan Nguy Duc, built with [Astro](https://astro.build) and deployed to GitHub Pages by GitHub Actions (`.github/workflows/deploy.yml`) on every push to `master`.

## Develop

```bash
npm install
npm run dev      # http://localhost:4321
npm run build    # static output in dist/
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

Site settings (name, links, navigation) live in `src/site.ts`.
