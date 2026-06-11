---
title: "Standardize and Automate Order Status Updates"
desc: "Define a clear set of order statuses and implement automated notifications for status changes to improve transparency."
status: "open"
source: "internal"
impact: "high"
relatedStorySlugs: []
updatedAt: "2026-06-11"
---

## Context

Without a standardized system for order status updates, communication between Shoppers and Locals can become fragmented, leading to uncertainty, repeated inquiries, and a suboptimal user experience. Clear, automated status updates enhance transparency and build trust.

## Suggested Action

Define a comprehensive set of order statuses (e.g., 'Bid Accepted', 'Item Acquired', 'Item Packaged', 'Shipped', 'Delivered', 'Cancelled'). Implement a user interface for Locals to easily select and update the current status of an order. Integrate this with a notification system to automatically alert Shoppers (via in-app, email, or push notifications) about significant status changes. This also includes updating the order data model and corresponding API endpoints.

## Impact Assessment

**Positive:**
*   **Transparency:** Both parties are always aware of the order's progress.
*   **Reduced Support Load:** Fewer inquiries about order status.
*   **Improved User Experience:** Higher satisfaction for both Shoppers and Locals.
*   **Accountability:** Provides a clear timeline of events for potential disputes.

**Negative:**
*   **Development Effort:** Requires changes to data model, UI, and notification service.
*   **Training:** Locals need to be educated on proper use of status updates.
