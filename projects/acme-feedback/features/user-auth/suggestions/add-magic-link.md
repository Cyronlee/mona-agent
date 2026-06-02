---
title: Add magic link / passwordless sign-in
desc: Allow users to sign in via a one-time magic link sent to their email, eliminating the need to remember a password.
status: open
source: user-feedback
impact: medium
relatedStorySlugs:
  - login-flow
updatedAt: "2026-06-02"
---

## Context

Several power users have requested passwordless login. Magic links are a well-established pattern that reduces friction for infrequent users who forget passwords.

## Suggested Action

Add a "Send me a sign-in link" option on the login page. Generate a signed, single-use token with a 10-minute expiry and email it to the user.
