import json, os
from atlassian import Jira

j = Jira(
    url="https://thoughtworks.atlassian.net",
    username=os.environ["ATLASSIAN_EMAIL"],
    password=os.environ["ATLASSIAN_API_TOKEN"],
    cloud=True,
)

FIELDS = ["customfield_12317", "customfield_12318", "customfield_12319", "customfield_12320", "customfield_12321"]

QUERIES = [
    ("GGQPA", 'project = GGQPA AND summary ~ "AI Native"'),
    ("GGAHTP", 'project = GGAHTP AND summary ~ "[P0] [UI] Endorsement"'),
    ("GGQFA", 'project = GGQFA AND labels = RevRec AND status != "To Do" AND issuetype != Bug'),
]

results = {}
for proj, jql in QUERIES:
    issues = []
    next_token = None
    while True:
        body = {"jql": jql, "fields": ["summary", "issuetype"] + FIELDS, "maxResults": 100}
        if next_token:
            body["nextPageToken"] = next_token
        data = j.post("/rest/api/3/search/jql", data=body)
        issues.extend(data.get("issues", []))
        if data.get("isLast", True):
            break
        next_token = data.get("nextPageToken")

    counts = {cf: {"Yes": 0, "No": 0, "None": 0} for cf in FIELDS}
    for issue in issues:
        fs = issue.get("fields", {})
        for cf in FIELDS:
            val = fs.get(cf)
            if val is None:
                counts[cf]["None"] += 1
            else:
                v = val.get("value", "")
                if v in counts[cf]:
                    counts[cf][v] += 1
                else:
                    counts[cf]["None"] += 1

    results[proj] = {"total": len(issues), "counts": counts}

print(json.dumps(results, indent=2))
