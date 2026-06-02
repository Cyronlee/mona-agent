---
title: Global Marketplace Feed
desc: The central discovery surface. Users browse a curated, filterable feed of products from global sellers and navigate to item details.
status: in-progress
goals:
  - Enable users to discover relevant products from global sellers within 10 seconds of opening the app.
  - Reduce time-to-find for top items through smart filtering by country and category.
  - Provide a seamless path from feed item to purchase intent via item detail pages.
updatedAt: "2026-06-03"
---

## Overview

The Global Marketplace Feed is the primary entry point for buyer-side users. It consists of a curated explore tab, filtering controls, item detail redirection, and a keyword search. These four areas work together to give users an efficient and personalised discovery experience.

## Design Constraints

- The feed must render above-the-fold content on a 375 px wide viewport within 1.5 s on 4G.
- Infinite scroll is preferred over pagination for continuity.
- Filtering state must persist across app sessions via local storage.

## Open Questions

- Should the curated feed algorithm be user-personalised (requires ML pipeline) or editorially curated for v1?
- Who owns the country/category taxonomy — product or ops?
