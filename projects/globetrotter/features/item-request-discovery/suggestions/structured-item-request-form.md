---
title: "Enhance Item Request Form with Structured Data Fields"
desc: "Improve the item request process by adding structured data fields and a category system to requests."
status: "open"
source: "internal"
impact: "medium"
relatedStorySlugs: []
updatedAt: "2026-06-11"
---

## Context

Currently, Shopper item requests might rely heavily on free-form text descriptions, which can lead to ambiguity and make it harder for Locals to understand exactly what is being requested. Implementing structured data fields (e.g., category, brand, color, size, material) would provide clearer information, reduce back-and-forth communication, and improve the accuracy of bids.

## Suggested Action

Redesign the item request form to include a set of pre-defined categories and associated structured data fields. For example, selecting 'Fashion' category could prompt fields for 'Size', 'Color', 'Material', 'Brand'. This would involve updating the database schema to support these new fields and modifying the front-end form.

## Impact Assessment

**Positive:**
*   **Clarity:** More precise item requests, reducing misinterpretations.
*   **Efficiency:** Locals can more quickly assess requests and submit accurate bids.
*   **Searchability:** Improves the ability to filter and search for specific item types.
*   **User Experience (Locals):** Easier to fulfill requests.

**Negative:**
*   **Development Effort:** Requires database and UI changes.
*   **User Experience (Shoppers):** Potentially more steps in the request process, but ultimately leads to better outcomes.
