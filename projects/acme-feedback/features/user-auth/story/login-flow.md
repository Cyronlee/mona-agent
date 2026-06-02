---
title: Email & Password Login Flow
desc: Standard credential-based login with rate limiting and lockout protection.
status: done
priority: 1
order: 1
updatedAt: "2026-06-01"
---

## Acceptance Criteria

- User can log in with email and password.
- After 5 failed attempts, the account is locked for 15 minutes.
- A "Forgot password?" link initiates the reset flow.
- Login state is persisted via a secure HTTP-only cookie (7-day session).
