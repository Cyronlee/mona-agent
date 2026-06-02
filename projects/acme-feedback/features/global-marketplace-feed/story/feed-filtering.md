---
title: Feed Filtering (Country & Category)
desc: Persistent filter controls allowing users to narrow the feed by seller country and product category.
status: ready
priority: 1
order: 2
updatedAt: "2026-06-03"
---

## Acceptance Criteria

- A filter bar is accessible via a "Filter" button in the feed header.
- Users can select one or more countries and/or one or more categories.
- Applied filters are shown as removable chips below the feed header.
- Filter state persists across sessions using local storage.
- Removing all filters restores the full curated feed.

## Technical Notes

- Country and category taxonomies are fetched once on app start from `/api/meta/taxonomies` and cached.
