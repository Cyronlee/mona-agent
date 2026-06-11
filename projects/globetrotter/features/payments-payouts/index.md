---
title: "Payments & Payouts"
desc: "Manages the secure processing of payments from Shoppers, escrow fund management, and timely payouts to Locals."
status: "planned"
goals:
  - "Ensure secure and reliable payment processing for Shoppers."
  - "Implement a robust escrow system to protect both parties."
  - "Provide transparent and timely payouts to Locals."
  - "Clearly display all transaction fees and commissions."
updatedAt: "2026-06-11"
---

## Overview

This feature handles all financial aspects of the Globetrotter marketplace. It includes integrating with payment gateways for Shopper payments, managing funds in an escrow system until order completion, and processing payouts to Locals. Transparency in fees and currency handling is a key consideration.

## Design Constraints

*   Must comply with PCI DSS standards for payment processing.
*   Escrow system must be legally compliant and clearly communicated to users.
*   Payouts should be accurate and processed within defined service level agreements.
*   Detailed transaction history should be available to both Shoppers and Locals.
*   Support for multiple payment methods (credit card, digital wallets) for Shoppers.

## Open Questions

*   Which primary payment gateway provider(s) will be used (e.g., Stripe, PayPal, Adyen)?
*   What is the exact commission structure for the platform, and how will it be applied?
*   What are the legal implications and requirements for operating an escrow service across different jurisdictions?
*   How will chargebacks and refunds be managed within the payment system?
