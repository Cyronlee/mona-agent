# KPI Radio-Button Fields — Project-Level Reference

## Field IDs (5 KPI dimensions)

| Field Name | Custom Field ID | Domain |
|---|---|---|
| Business Analysis | `customfield_12317` | BA |
| Task Decomposition | `customfield_12318` | Tech |
| Code Generation | `customfield_12319` | Tech |
| Code Review | `customfield_12320` | Tech |
| Edge Cases & Quality | `customfield_12321` | Tech |

> **Removed fields** (always None in these projects): `Production Ops` (`customfield_12322`), `Collaboration & KB` (`customfield_12323`)

## Target Project JQLs

| Alias | JQL | Expected count |
|---|---|---|
| **GGQPA** | `project = GGQPA AND summary ~ "AI Native"` | ~11 |
| **GGAHTP** | `project = GGAHTP AND summary ~ "[P0] [UI] Endorsement"` | ~10 |
| **GGQFA** | `project = GGQFA AND labels = RevRec AND status != "To Do" AND issuetype != Bug` | ~9 |

## Distribution Query

Use the JQL above as base, then for each issue read:

```
fields[customfield_12317].value   → "Yes" | "No" | null
fields[customfield_12318].value   → "Yes" | "No" | null
fields[customfield_12319].value   → "Yes" | "No" | null
fields[customfield_12320].value   → "Yes" | "No" | null
fields[customfield_12321].value   → "Yes" | "No" | null
```

`null` means the field was never set (None).

### API endpoint

```bash
POST /rest/api/3/search/jql
Content-Type: application/json
Authorization: Basic $(echo -n "$ATLASSIAN_EMAIL:$ATLASSIAN_API_TOKEN" | base64)

{
  "jql": "<JQL>",
  "fields": ["summary", "customfield_12317", "customfield_12318", ...],
  "maxResults": 100
}
```

Paginate with `nextPageToken` from response; stop when `isLast: true`.

## Visualization

Open `kpi_adoption.html` in browser for interactive charts (adoption rate per field per project, stacked Yes/No/None breakdown, summary stats).

## Last Run

- Date: 2026-05-28
- Total issues across all 3 projects: 32
- Overall adoption rate: ~82%
