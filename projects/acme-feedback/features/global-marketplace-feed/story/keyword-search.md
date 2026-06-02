---
title: Keyword Search
desc: A global search input allowing users to find items by keyword across all categories and countries.
status: in-progress
priority: 1
order: 3
updatedAt: "2026-06-03"
---

## Acceptance Criteria

- A search icon in the top navigation bar opens a full-screen search overlay.
- Typing triggers debounced search suggestions (300 ms debounce).
- Submitting a query shows a results page with the same card layout as the feed.
- Recent searches are shown when the search input is focused and empty.
- Results include a count label and a "no results" state.

## Technical Notes

- Search is backed by a full-text index on item title, description, and tags.
- The search overlay is rendered as a modal route so the back button dismisses it.
