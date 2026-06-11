---
name: atlassian-toolkit
description: Query and update Thoughtworks Jira (https://thoughtworks.atlassian.net) and Confluence (https://thoughtworks.atlassian.net/wiki) via a thin Python CLI. Use when the user asks to search/create/update/transition Jira issues, search/read/create/update Confluence pages, look up their assigned tickets, or work with TW Atlassian. Includes a bootstrap flow for first-time auth setup and a user-editable shortcuts.md for frequent boards and spaces.
---

# Atlassian Toolkit

Replaces the `mcp-atlassian` MCP server with a lazy-loaded skill. Calls Atlassian REST APIs through a thin Python wrapper at `scripts/atlassian.py` (uses `atlassian-python-api`). URLs are baked in; credentials come from env vars.

## Setup (run once)

If `ATLASSIAN_EMAIL` and `ATLASSIAN_API_TOKEN` are not in the environment, run:

```bash
bash scripts/bootstrap.sh
```

It prints token-creation instructions, then verifies auth with `GET /rest/api/3/myself`. **Do not** put the token in any committed file or in `mcp.json`. Use `~/.zshrc`.

## How to invoke commands

Always shell out via `uv` so dependencies are auto-resolved without polluting the user's Python:

```bash
uv run --with atlassian-python-api --with markdownify \
  python skills/atlassian-toolkit/scripts/atl.py <product> <cmd> [args]
```

(From the skill directory itself, `python scripts/atl.py …` is enough if deps are already installed.)

All commands print JSON to stdout. Errors go to stderr with non-zero exit.

## Common commands

| Goal | Command |
|---|---|
| My open issues | `atl.py jira my-issues` |
| JQL search | `atl.py jira search "project = TWAHM AND status = 'In Progress'"` |
| Get issue (with comments) | `atl.py jira get TWAHM-123 --comments` |
| Create issue | `atl.py jira create --project TWAHM --type Task --summary "..." --description "..."` |
| Transition status | `atl.py jira list-transitions TWAHM-123` then `atl.py jira transition TWAHM-123 Done` |
| Comment | `atl.py jira comment TWAHM-123 "LGTM"` |
| CQL search | `atl.py confluence search "space = TECHOPS AND title ~ 'onboarding'"` |
| Get page (by id) | `atl.py confluence get-page 123456789` |
| Get page (by title) | `atl.py confluence get-page "Onboarding" --space TECHOPS` |
| Create page | `atl.py confluence create-page --space TECHOPS --title "..." --body "wiki markup"` |

Full subcommand reference: [reference.md](./reference.md).

## Shortcuts

`shortcuts.md` is the user-curated list of frequent Jira boards / projects and Confluence spaces / pages. **Read it at the start of every session** that uses this skill — it usually answers "which project key?" or "what's the parent page?" without asking.

When the user says things like *"remember the TWAHM board"*, *"add TechOps space to my shortcuts"*, or *"save this page"*, append a row to the right section of `shortcuts.md` and commit. Keep entries one line each: `name — key/id — URL — short note`.

## When NOT to use

- Bulk operations (>50 issues): use the Atlassian UI or a dedicated script.
- Tools not in [reference.md](./reference.md) (workflows, custom fields, attachments, projects admin): fall back to direct `curl` against the Atlassian REST API using the same `ATLASSIAN_EMAIL` / `ATLASSIAN_API_TOKEN` for Basic auth.

## Notes for the agent

- Prefer `--fields` to limit JQL search payload size.
- Issue descriptions and comments use ADF on Cloud; `atlassian.py` flattens incoming ADF to text and wraps outgoing plain text into a minimal ADF doc. For rich formatting on writes, use Confluence wiki markup (default) or `--html` (storage format).
- `accountId` is preferred over username for `--assignee` on Cloud; user lookup is not in this CLI — get it from a prior `jira get` response if needed.
- Never echo or log `ATLASSIAN_API_TOKEN`. The bootstrap script masks all but the last 4 chars.
