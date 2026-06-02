---
title: Payment & Escrow
desc: Secure payment processing with escrow hold to protect both buyers and sellers during a transaction.
status: done
goals:
  - Hold buyer funds securely until delivery is confirmed.
  - Release funds to seller automatically on confirmation or after a 7-day window.
  - Provide a dispute resolution path managed by Acme support.
updatedAt: "2026-06-01"
---

## Overview

Payments are processed via Stripe. Funds are held in an Acme-managed escrow account until the buyer confirms receipt. If no action is taken within 7 days, funds are auto-released to the seller.
