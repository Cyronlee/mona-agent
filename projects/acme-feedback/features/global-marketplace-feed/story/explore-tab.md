---
title: Explore Tab (Curated Feed)
desc: A vertically scrolling curated feed of trending and recommended items shown on the home tab. Powered by an editorial or algorithmic ranking model.
status: ready
priority: 1
order: 1
updatedAt: "2026-06-03"
---

## Acceptance Criteria

- The Explore tab is the default active tab on app launch for authenticated users.
- Each feed card displays: item image, item title, seller country flag, price, and a save (heart) action.
- The feed supports infinite scroll; next batch loads within 500 ms of reaching 80% scroll depth.
- An empty state is shown when no items are available for the user's locale.

## Technical Notes

- Feed data is served via `/api/feed?page=N&locale=XX`.
- Image loading uses lazy loading with a blurred placeholder.
