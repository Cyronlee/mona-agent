---
title: User Authentication & Profile
desc: Covers all sign-in, registration, password management, and profile editing flows.
status: done
goals:
  - Provide a frictionless, secure onboarding path for new users.
  - Support social sign-in (Google, Apple) alongside email/password.
  - Allow users to manage their profile, notification preferences, and connected accounts.
updatedAt: "2026-06-01"
---

## Overview

All authentication flows are handled via the central Auth service. JWT tokens are stored in secure HTTP-only cookies. Social sign-in delegates to OAuth 2.0 providers.

## Completed Stories

- Email/password registration and login ✅
- Google OAuth sign-in ✅
- Apple OAuth sign-in ✅
- Profile edit (avatar, display name, bio) ✅
- Password reset via email ✅
