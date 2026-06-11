---
title: "Implement a Structured Feedback System with Specific Criteria"
desc: "Enhance the review process by introducing specific rating criteria beyond a general star rating and optional free-form comments."
status: "open"
source: "internal"
impact: "high"
relatedStorySlugs: []
updatedAt: "2026-06-11"
---

## Context

While a general star rating and free-form comments are a good start, they often lack the specificity needed to provide truly actionable feedback or allow users to quickly gauge specific aspects of a transaction partner's performance. A structured feedback system can provide richer data and a more nuanced understanding of user interactions.

## Suggested Action

Design a review interface that includes:
*   **Specific Rating Categories:** For Locals: e.g., "Item Accuracy (vs. request)", "Communication Quality", "Packaging & Shipping", "Punctuality". For Shoppers: e.g., "Communication Quality", "Payment Promptness". Each category would have its own star rating (e.g., 1-5 stars).
*   **Qualitative Prompts:** Provide optional prompts for free-form comments that guide users to provide constructive feedback.
*   **Badges/Tags (Optional):** Allow reviewers to select positive attributes (e.g., "Great Communicator", "Fast Shipper").

This requires updates to the database schema for storing structured feedback and significant UI/UX work for the review submission and display.

## Impact Assessment

**Positive:**
*   **Actionable Feedback:** Provides specific areas for users to improve or highlight strengths.
*   **Enhanced Trust:** Shoppers and Locals can make more informed decisions based on granular feedback.
*   **Improved User Experience:** A more comprehensive and useful review system.
*   **Data Richness:** Provides valuable data for platform analytics and quality control.

**Negative:**
*   **Development Effort:** Requires detailed design and implementation of new data structures and UI.
*   **Review Fatigue:** Might slightly increase the time required to leave a review, potentially impacting completion rates if not well-designed.
