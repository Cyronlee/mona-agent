---
title: "Introduce Identity Verification for Locals"
desc: "Implement a system for Locals to verify their identity to build trust and ensure compliance."
status: "open"
source: "internal"
impact: "high"
relatedStorySlugs: []
updatedAt: "2026-06-11"
---

## Context

For a peer-to-peer marketplace involving financial transactions and shipping of physical goods, establishing trust among participants is crucial. Identity verification for Locals (Travelers/Residents) can significantly enhance platform security, reduce fraudulent activities, and increase Shopper confidence.

## Suggested Action

Research and integrate a third-party identity verification service (e.g., Jumio, Onfido, Veriff). The service should support document verification (e.g., passport, national ID) and potentially biometric checks (e.g., liveness detection). Initially, this could be an optional feature that provides a "Verified Local" badge, with potential for it to become mandatory for Locals reaching certain transaction volumes or values.

## Impact Assessment

**Positive:**
*   **Trust & Safety:** Increased confidence for Shoppers and overall platform integrity.
*   **Fraud Reduction:** Deters malicious actors.
*   **Compliance:** Helps meet regulatory requirements for financial transactions.
*   **Reputation:** Enhances the professional image of the platform.

**Negative:**
*   **Development Effort:** Integration of a third-party service.
*   **User Experience:** Adds a step to the Local's onboarding, which might deter some.
*   **Cost:** Third-party verification services typically incur per-verification fees.
*   **Privacy Concerns:** Requires careful handling of sensitive user data.
