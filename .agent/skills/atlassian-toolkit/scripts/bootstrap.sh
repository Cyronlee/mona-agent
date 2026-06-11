#!/usr/bin/env bash
# Bootstrap for the atlassian-toolkit skill.
# Verifies env vars, tests auth, prints next-step guidance.
set -euo pipefail

JIRA_URL="${JIRA_URL:-https://thoughtworks.atlassian.net}"
CONFLUENCE_URL="${CONFLUENCE_URL:-https://thoughtworks.atlassian.net/wiki}"

red()   { printf '\033[31m%s\033[0m\n' "$*"; }
green() { printf '\033[32m%s\033[0m\n' "$*"; }
yellow(){ printf '\033[33m%s\033[0m\n' "$*"; }
bold()  { printf '\033[1m%s\033[0m\n' "$*"; }

bold "atlassian-toolkit bootstrap"
echo

missing=0
if [[ -z "${ATLASSIAN_EMAIL:-}" ]]; then
  red "  ATLASSIAN_EMAIL is not set"
  missing=1
else
  green "  ATLASSIAN_EMAIL = ${ATLASSIAN_EMAIL}"
fi
if [[ -z "${ATLASSIAN_API_TOKEN:-}" ]]; then
  red "  ATLASSIAN_API_TOKEN is not set"
  missing=1
else
  green "  ATLASSIAN_API_TOKEN = ********${ATLASSIAN_API_TOKEN: -4}"
fi

if [[ $missing -eq 1 ]]; then
  echo
  yellow "Set the missing variables, then re-run this script."
  cat <<'EOF'

  1. Create an API token (browser):
       https://id.atlassian.com/manage-profile/security/api-tokens

  2. Add to your shell profile (~/.zshrc or ~/.bashrc):

       export ATLASSIAN_EMAIL="your.name@thoughtworks.com"
       export ATLASSIAN_API_TOKEN="paste-the-token-here"

  3. Reload:  source ~/.zshrc   (or open a new terminal)

  WARNING: never commit the token. .zshrc / .bashrc are local only.
EOF
  exit 1
fi

echo
bold "Testing Jira auth against ${JIRA_URL} ..."
auth_header=$(printf '%s:%s' "$ATLASSIAN_EMAIL" "$ATLASSIAN_API_TOKEN" | base64 | tr -d '\n')
http_code=$(curl -sS -o /tmp/atlassian-toolkit-myself.json -w '%{http_code}' \
  -H "Authorization: Basic $auth_header" \
  -H "Accept: application/json" \
  "${JIRA_URL}/rest/api/3/myself")

if [[ "$http_code" == "200" ]]; then
  display=$(python3 -c 'import json,sys; d=json.load(open("/tmp/atlassian-toolkit-myself.json")); print(d.get("displayName",""), "<"+d.get("emailAddress","")+">")' 2>/dev/null || true)
  green "  authenticated as: ${display:-OK}"
else
  red "  auth FAILED (HTTP $http_code). Check email and token."
  cat /tmp/atlassian-toolkit-myself.json 2>/dev/null || true
  exit 1
fi

rm -f /tmp/atlassian-toolkit-myself.json

echo
bold "Next steps:"
cat <<EOF
  - Use the CLI via uv:
      uv run --with atlassian-python-api --with markdownify \\
        python "$(dirname "$0")/atl.py" jira my-issues

  - Edit shortcuts.md to record boards / spaces you use often.
  - Ask the agent things like:
      "Use atlassian-toolkit: show me my open Jira issues."
      "Use atlassian-toolkit: get TWAHM-123 with comments."
      "Use atlassian-toolkit: search Confluence for 'onboarding' in TECHOPS."
EOF
