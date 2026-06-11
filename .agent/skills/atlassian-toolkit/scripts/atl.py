#!/usr/bin/env python3
"""Thin CLI wrapper around atlassian-python-api for the atlassian-toolkit skill.

Reads credentials from environment:
  ATLASSIAN_EMAIL      Atlassian account email
  ATLASSIAN_API_TOKEN  API token from https://id.atlassian.com/manage-profile/security/api-tokens

Jira / Confluence base URLs are hardcoded for Thoughtworks but may be overridden
via JIRA_URL / CONFLUENCE_URL env vars.

Output: JSON on stdout for machine-friendly consumption by the agent.
Errors: human-readable message to stderr, non-zero exit.
"""
from __future__ import annotations

import argparse
import json
import os
import sys
from typing import Any

DEFAULT_JIRA_URL = "https://thoughtworks.atlassian.net"
DEFAULT_CONFLUENCE_URL = "https://thoughtworks.atlassian.net/wiki"


def _die(msg: str, code: int = 1) -> None:
    print(f"error: {msg}", file=sys.stderr)
    sys.exit(code)


def _creds() -> tuple[str, str]:
    email = os.environ.get("ATLASSIAN_EMAIL")
    token = os.environ.get("ATLASSIAN_API_TOKEN")
    if not email or not token:
        _die(
            "ATLASSIAN_EMAIL and ATLASSIAN_API_TOKEN must be set. "
            "Run scripts/bootstrap.sh for setup instructions."
        )
    return email, token  # type: ignore[return-value]


def _jira_client():
    from atlassian import Jira

    email, token = _creds()
    return Jira(
        url=os.environ.get("JIRA_URL", DEFAULT_JIRA_URL),
        username=email,
        password=token,
        cloud=True,
    )


def _confluence_client():
    from atlassian import Confluence

    email, token = _creds()
    return Confluence(
        url=os.environ.get("CONFLUENCE_URL", DEFAULT_CONFLUENCE_URL),
        username=email,
        password=token,
        cloud=True,
    )


def _print(data: Any) -> None:
    json.dump(data, sys.stdout, indent=2, ensure_ascii=False, default=str)
    sys.stdout.write("\n")


def _adf_to_text(node: Any) -> str:
    """Best-effort flatten ADF (Atlassian Document Format) to plain text."""
    if node is None:
        return ""
    if isinstance(node, str):
        return node
    if isinstance(node, list):
        return "".join(_adf_to_text(n) for n in node)
    if not isinstance(node, dict):
        return ""
    t = node.get("type")
    if t == "text":
        return node.get("text", "")
    if t == "hardBreak":
        return "\n"
    if t in {"paragraph", "heading"}:
        return _adf_to_text(node.get("content", [])) + "\n"
    if t in {"bulletList", "orderedList"}:
        return _adf_to_text(node.get("content", []))
    if t == "listItem":
        return "- " + _adf_to_text(node.get("content", [])).strip() + "\n"
    if t == "codeBlock":
        return "```\n" + _adf_to_text(node.get("content", [])) + "\n```\n"
    return _adf_to_text(node.get("content", []))


def _slim_issue(issue: dict) -> dict:
    f = issue.get("fields", {}) or {}
    out = {
        "key": issue.get("key"),
        "id": issue.get("id"),
        "url": f"{os.environ.get('JIRA_URL', DEFAULT_JIRA_URL)}/browse/{issue.get('key')}",
        "summary": f.get("summary"),
        "status": (f.get("status") or {}).get("name"),
        "type": (f.get("issuetype") or {}).get("name"),
        "priority": (f.get("priority") or {}).get("name"),
        "assignee": (f.get("assignee") or {}).get("displayName"),
        "reporter": (f.get("reporter") or {}).get("displayName"),
        "created": f.get("created"),
        "updated": f.get("updated"),
        "labels": f.get("labels"),
    }
    desc = f.get("description")
    if isinstance(desc, dict):
        out["description"] = _adf_to_text(desc).strip()
    elif isinstance(desc, str):
        out["description"] = desc
    return out


# ---------- Jira commands ----------


def cmd_jira_search(args) -> None:
    jira = _jira_client()
    fields = args.fields.split(",") if args.fields else [
        "summary",
        "status",
        "issuetype",
        "priority",
        "assignee",
        "updated",
    ]
    res = jira.jql(args.jql, fields=fields, limit=args.limit, start=args.start)
    issues = [_slim_issue(i) for i in (res.get("issues") or [])]
    _print({"total": res.get("total"), "count": len(issues), "issues": issues})


def cmd_jira_get(args) -> None:
    jira = _jira_client()
    issue = jira.issue(args.key, expand="renderedFields")
    slim = _slim_issue(issue)
    if args.comments:
        comments = jira.issue_get_comments(args.key) or {}
        slim["comments"] = [
            {
                "author": (c.get("author") or {}).get("displayName"),
                "created": c.get("created"),
                "body": _adf_to_text(c.get("body")) if isinstance(c.get("body"), dict) else c.get("body"),
            }
            for c in (comments.get("comments") or [])
        ]
    _print(slim)


def cmd_jira_my_issues(args) -> None:
    jql = "assignee = currentUser() AND statusCategory != Done ORDER BY updated DESC"
    args.jql = jql
    args.fields = args.fields or "summary,status,issuetype,priority,updated"
    args.start = 0
    cmd_jira_search(args)


def _text_to_adf(text: str) -> dict:
    """Wrap plain text into a minimal ADF document. Newlines split paragraphs."""
    paragraphs = [p for p in text.split("\n\n")]
    content = []
    for p in paragraphs:
        if not p.strip():
            continue
        content.append(
            {
                "type": "paragraph",
                "content": [{"type": "text", "text": p}],
            }
        )
    return {"type": "doc", "version": 1, "content": content or [{"type": "paragraph", "content": []}]}


def cmd_jira_create(args) -> None:
    jira = _jira_client()
    fields: dict[str, Any] = {
        "project": {"key": args.project},
        "summary": args.summary,
        "issuetype": {"name": args.type},
    }
    if args.description:
        fields["description"] = _text_to_adf(args.description)
    if args.assignee:
        fields["assignee"] = {"accountId": args.assignee} if len(args.assignee) > 20 else {"name": args.assignee}
    if args.labels:
        fields["labels"] = args.labels.split(",")
    res = jira.create_issue(fields=fields)
    key = res.get("key")
    _print({"key": key, "url": f"{os.environ.get('JIRA_URL', DEFAULT_JIRA_URL)}/browse/{key}"})


def cmd_jira_update(args) -> None:
    jira = _jira_client()
    fields: dict[str, Any] = {}
    if args.summary:
        fields["summary"] = args.summary
    if args.description:
        fields["description"] = _text_to_adf(args.description)
    if args.assignee:
        fields["assignee"] = {"accountId": args.assignee} if len(args.assignee) > 20 else {"name": args.assignee}
    if args.labels:
        fields["labels"] = args.labels.split(",")
    if not fields:
        _die("nothing to update; pass at least one of --summary/--description/--assignee/--labels")
    jira.update_issue_field(args.key, fields)
    _print({"key": args.key, "updated": list(fields.keys())})


def cmd_jira_transitions(args) -> None:
    jira = _jira_client()
    transitions = jira.get_issue_transitions(args.key) or []
    _print([{"id": t.get("id"), "name": t.get("name"), "to": (t.get("to") or {}).get("name")} for t in transitions])


def cmd_jira_transition(args) -> None:
    jira = _jira_client()
    transitions = jira.get_issue_transitions(args.key) or []
    match = next((t for t in transitions if t.get("name", "").lower() == args.transition.lower()), None)
    if not match:
        names = ", ".join(t.get("name", "") for t in transitions)
        _die(f"transition '{args.transition}' not available. Available: {names}")
    jira.set_issue_status_by_transition_id(args.key, match["id"])
    _print({"key": args.key, "transitioned_to": (match.get("to") or {}).get("name")})


def cmd_jira_comment(args) -> None:
    jira = _jira_client()
    jira.issue_add_comment(args.key, args.body)
    _print({"key": args.key, "comment_added": True})


# ---------- Confluence commands ----------


def cmd_conf_search(args) -> None:
    conf = _confluence_client()
    res = conf.cql(args.cql, limit=args.limit, expand="space")
    results = []
    for r in (res.get("results") or []):
        content = r.get("content") or {}
        results.append(
            {
                "id": content.get("id"),
                "type": content.get("type"),
                "title": content.get("title") or r.get("title"),
                "space": (content.get("space") or {}).get("key"),
                "url": f"{os.environ.get('CONFLUENCE_URL', DEFAULT_CONFLUENCE_URL)}{(r.get('url') or '')}",
                "excerpt": r.get("excerpt"),
            }
        )
    _print({"count": len(results), "results": results})


def cmd_conf_get_page(args) -> None:
    conf = _confluence_client()
    page_id = args.page
    if not page_id.isdigit():
        if not args.space:
            _die("when --page is a title, --space is required")
        page = conf.get_page_by_title(args.space, page_id, expand="body.storage,version")
        if not page:
            _die(f"page '{page_id}' not found in space {args.space}")
        page_id = page["id"]
    page = conf.get_page_by_id(page_id, expand="body.storage,version,space")
    body_html = ((page.get("body") or {}).get("storage") or {}).get("value", "")
    body_md = body_html
    try:
        from markdownify import markdownify

        body_md = markdownify(body_html, heading_style="ATX")
    except Exception:
        pass
    _print(
        {
            "id": page.get("id"),
            "title": page.get("title"),
            "space": (page.get("space") or {}).get("key"),
            "version": (page.get("version") or {}).get("number"),
            "url": f"{os.environ.get('CONFLUENCE_URL', DEFAULT_CONFLUENCE_URL)}/spaces/{(page.get('space') or {}).get('key')}/pages/{page.get('id')}",
            "body_markdown": body_md,
        }
    )


def cmd_conf_create_page(args) -> None:
    conf = _confluence_client()
    page = conf.create_page(
        space=args.space,
        title=args.title,
        body=args.body,
        parent_id=args.parent,
        representation="storage" if args.html else "wiki",
    )
    _print(
        {
            "id": page.get("id"),
            "title": page.get("title"),
            "url": f"{os.environ.get('CONFLUENCE_URL', DEFAULT_CONFLUENCE_URL)}/spaces/{args.space}/pages/{page.get('id')}",
        }
    )


def cmd_conf_update_page(args) -> None:
    conf = _confluence_client()
    current = conf.get_page_by_id(args.page, expand="version")
    if not current:
        _die(f"page {args.page} not found")
    title = args.title or current["title"]
    page = conf.update_page(
        page_id=args.page,
        title=title,
        body=args.body,
        representation="storage" if args.html else "wiki",
    )
    _print({"id": page.get("id"), "title": page.get("title"), "version": (page.get("version") or {}).get("number")})


# ---------- arg parsing ----------


def build_parser() -> argparse.ArgumentParser:
    p = argparse.ArgumentParser(prog="atl", description=__doc__.splitlines()[0])
    sub = p.add_subparsers(dest="product", required=True)

    # Jira
    jp = sub.add_parser("jira", help="Jira operations")
    jsub = jp.add_subparsers(dest="cmd", required=True)

    s = jsub.add_parser("search", help="JQL search")
    s.add_argument("jql")
    s.add_argument("--fields", help="comma-separated field names")
    s.add_argument("--limit", type=int, default=25)
    s.add_argument("--start", type=int, default=0)
    s.set_defaults(func=cmd_jira_search)

    g = jsub.add_parser("get", help="Get issue by key")
    g.add_argument("key")
    g.add_argument("--comments", action="store_true")
    g.set_defaults(func=cmd_jira_get)

    m = jsub.add_parser("my-issues", help="Issues assigned to me (open)")
    m.add_argument("--fields")
    m.add_argument("--limit", type=int, default=25)
    m.set_defaults(func=cmd_jira_my_issues)

    c = jsub.add_parser("create", help="Create an issue")
    c.add_argument("--project", required=True)
    c.add_argument("--type", required=True, help="Issue type name e.g. Task, Bug, Story")
    c.add_argument("--summary", required=True)
    c.add_argument("--description")
    c.add_argument("--assignee", help="accountId (preferred) or username")
    c.add_argument("--labels", help="comma-separated")
    c.set_defaults(func=cmd_jira_create)

    u = jsub.add_parser("update", help="Update issue fields")
    u.add_argument("key")
    u.add_argument("--summary")
    u.add_argument("--description")
    u.add_argument("--assignee")
    u.add_argument("--labels")
    u.set_defaults(func=cmd_jira_update)

    lt = jsub.add_parser("list-transitions", help="List available transitions")
    lt.add_argument("key")
    lt.set_defaults(func=cmd_jira_transitions)

    t = jsub.add_parser("transition", help="Transition an issue by transition name")
    t.add_argument("key")
    t.add_argument("transition")
    t.set_defaults(func=cmd_jira_transition)

    cm = jsub.add_parser("comment", help="Add a comment to an issue")
    cm.add_argument("key")
    cm.add_argument("body")
    cm.set_defaults(func=cmd_jira_comment)

    # Confluence
    cp = sub.add_parser("confluence", help="Confluence operations")
    csub = cp.add_subparsers(dest="cmd", required=True)

    cs = csub.add_parser("search", help="CQL search")
    cs.add_argument("cql")
    cs.add_argument("--limit", type=int, default=25)
    cs.set_defaults(func=cmd_conf_search)

    gp = csub.add_parser("get-page", help="Get page by id, or by title with --space")
    gp.add_argument("page", help="page id (digits) or page title")
    gp.add_argument("--space", help="space key (required when page is a title)")
    gp.set_defaults(func=cmd_conf_get_page)

    cc = csub.add_parser("create-page", help="Create a page")
    cc.add_argument("--space", required=True)
    cc.add_argument("--title", required=True)
    cc.add_argument("--body", required=True, help="Wiki markup by default; pass --html for storage/HTML body")
    cc.add_argument("--parent", help="parent page id")
    cc.add_argument("--html", action="store_true")
    cc.set_defaults(func=cmd_conf_create_page)

    cu = csub.add_parser("update-page", help="Update a page (replaces body)")
    cu.add_argument("page")
    cu.add_argument("--title")
    cu.add_argument("--body", required=True)
    cu.add_argument("--html", action="store_true")
    cu.set_defaults(func=cmd_conf_update_page)

    return p


def main() -> None:
    args = build_parser().parse_args()
    try:
        args.func(args)
    except SystemExit:
        raise
    except Exception as e:  # noqa: BLE001
        _die(f"{type(e).__name__}: {e}")


if __name__ == "__main__":
    main()
