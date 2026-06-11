---
title: "Implement Multi-Currency Support and Conversion"
desc: "Enable Shoppers to pay in their local currency and Locals to receive payouts in theirs, with transparent currency conversion."
status: "open"
source: "internal"
impact: "high"
relatedStorySlugs: []
updatedAt: "2026-06-11"
---

## Context

Globetrotter is a global platform connecting users across different countries. Currently, all transactions might be assumed to be in a single base currency, which creates friction for international users who incur conversion fees from their banks and face uncertainty regarding exchange rates. Multi-currency support is essential for a truly global marketplace.

## Suggested Action

Integrate a robust multi-currency solution within the payment gateway. This involves:
1.  Allowing Shoppers to view item requests and pay in their preferred local currency.
2.  Displaying estimated currency conversions during the bidding process for both Shoppers and Locals.
3.  Enabling Locals to specify their preferred payout currency.
4.  Clearly communicating exchange rates and any associated conversion fees to both parties.
This will require updates to the pricing and payment processing logic, as well as UI changes to display currency options and conversions.

## Impact Assessment

**Positive:**
*   **Global Reach:** Significantly expands the addressable market by removing currency barriers.
*   **User Experience:** Much smoother and more predictable experience for international users.
*   **Transparency:** Reduces hidden costs and builds trust.
*   **Conversion Rates:** Potentially increases transaction completion rates by reducing payment friction.

**Negative:**
*   **Development Complexity:** Significant effort required for integration and testing.
*   **Operational Costs:** May incur additional fees from payment processors for currency conversion.
*   **Exchange Rate Volatility:** Needs careful management to mitigate risks associated with fluctuating exchange rates.
