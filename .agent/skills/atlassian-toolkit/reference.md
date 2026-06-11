# atlassian-toolkit CLI reference

`scripts/atl.py` exposes two top-level groups: `jira` and `confluence`.
Output is always JSON on stdout.

Run any command with `--help` for an exact, machine-generated signature.

## Environment

| Var | Required | Default |
|---|---|---|
| `ATLASSIAN_EMAIL` | yes | — |
| `ATLASSIAN_API_TOKEN` | yes | — |
| `JIRA_URL` | no | `https://thoughtworks.atlassian.net` |
| `CONFLUENCE_URL` | no | `https://thoughtworks.atlassian.net/wiki` |

## Jira

### `jira search <jql> [--fields a,b,c] [--limit N] [--start N]`

Run a JQL query. Returns `{ total, count, issues: [...] }` where each issue is slimmed to: `key, id, url, summary, status, type, priority, assignee, reporter, created, updated, labels`.

Default fields: `summary,status,issuetype,priority,assignee,updated`. Pass `--fields description,...` to include more.

### `jira get <KEY> [--comments]`

Fetch one issue. Returns the same slim shape, plus `description` (ADF-flattened to text). With `--comments`, includes a `comments` array (author / created / body).

### `jira my-issues [--limit N] [--fields ...]`

Shortcut for `assignee = currentUser() AND statusCategory != Done ORDER BY updated DESC`.

### `jira create --project KEY --type NAME --summary STR [--description STR] [--assignee ID_OR_NAME] [--labels a,b]`

Returns `{ key, url }`. `--type` is the issue type name (`Task`, `Bug`, `Story`, etc.) — must exist in the project. For `--assignee`, prefer the Atlassian `accountId` (long string); a short value is treated as `name` for backwards compat.

### `jira update <KEY> [--summary STR] [--description STR] [--assignee STR] [--labels a,b]`

At least one field is required. Description is converted from plain text to minimal ADF.

### `jira list-transitions <KEY>`

Returns the transitions currently available for the issue: `[{ id, name, to }]`. Run this first if you don't know the exact transition name (transition names are workflow-specific and case-sensitive on the server — the CLI matches case-insensitively).

### `jira transition <KEY> <TRANSITION_NAME>`

Move the issue. The CLI resolves the transition name to an id; errors clearly list available names if unmatched.

### `jira comment <KEY> <BODY>`

Add a comment. Body is plain text.

## Confluence

### `confluence search <cql> [--limit N]`

CQL search. Common patterns:

- `space = TECHOPS AND title ~ "onboard*"`
- `text ~ "RAG report" AND type = page`
- `creator = currentUser() ORDER BY lastmodified DESC`

Returns `[{ id, type, title, space, url, excerpt }]`.

### `confluence get-page <ID_OR_TITLE> [--space KEY]`

If the argument is all digits, treated as a page id. Otherwise it is treated as a title and `--space` is required. Returns id, title, space, version, url, and `body_markdown` (HTML body converted to Markdown via `markdownify`).

### `confluence create-page --space KEY --title STR --body STR [--parent ID] [--html]`

Default body is wiki markup. Use `--html` to send Confluence storage-format HTML instead. Returns `{ id, title, url }`.

### `confluence update-page <ID> --body STR [--title STR] [--html]`

Replaces the body. Confluence version is bumped automatically by `atlassian-python-api`.

## Fallback for unsupported operations

This CLI deliberately covers ~90% of day-to-day usage. For anything else — attachments, watchers, version history, custom fields, project / space admin, board configuration — call the REST API directly:

```bash
curl -sS -u "$ATLASSIAN_EMAIL:$ATLASSIAN_API_TOKEN" \
  -H "Accept: application/json" \
  "https://thoughtworks.atlassian.net/rest/api/3/<endpoint>"
```

Jira Cloud REST docs: https://developer.atlassian.com/cloud/jira/platform/rest/v3/
Confluence Cloud REST docs: https://developer.atlassian.com/cloud/confluence/rest/v2/
