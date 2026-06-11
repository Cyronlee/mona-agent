const JIRA_URL = process.env.JIRA_URL ?? "https://thoughtworks.atlassian.net"

function authHeader(): string {
    const email = process.env.ATLASSIAN_EMAIL
    const token = process.env.ATLASSIAN_API_TOKEN
    if (!email || !token) {
        throw new Error("ATLASSIAN_EMAIL and ATLASSIAN_API_TOKEN must be set")
    }
    return `Basic ${Buffer.from(`${email}:${token}`).toString("base64")}`
}

function textToAdf(text: string) {
    const paragraphs = text.split("\n\n").filter((p) => p.trim())
    const content = paragraphs.map((p) => ({
        type: "paragraph" as const,
        content: [{ type: "text" as const, text: p }],
    }))
    return {
        type: "doc",
        version: 1,
        content: content.length > 0 ? content : [{ type: "paragraph" as const, content: [] }],
    }
}

type JiraIssueResult = {
    key: string
    url: string
    status: string
}

export async function createJiraIssue(params: {
    projectKey: string
    issueType: string
    summary: string
    description: string
}): Promise<JiraIssueResult> {
    const body = {
        fields: {
            project: { key: params.projectKey },
            issuetype: { name: params.issueType },
            summary: params.summary,
            description: textToAdf(params.description),
        },
    }

    const res = await fetch(`${JIRA_URL}/rest/api/3/issue`, {
        method: "POST",
        headers: {
            Authorization: authHeader(),
            "Content-Type": "application/json",
            Accept: "application/json",
        },
        body: JSON.stringify(body),
    })

    if (!res.ok) {
        const err = await res.json().catch(() => ({}))
        const messages = (err as { errors?: Record<string, string>; errorMessages?: string[] }).errors
        const detail = messages ? Object.entries(messages).map(([k, v]) => `${k}: ${v}`).join("; ") : (err as { errorMessages?: string[] }).errorMessages?.join("; ") ?? res.statusText
        throw new Error(`Jira create failed: ${detail}`)
    }

    const data = (await res.json()) as { key: string; id: string }
    const key = data.key
    const url = `${JIRA_URL}/browse/${key}`

    return { key, url, status: "To Do" }
}

export async function getIssueTransitions(issueKey: string): Promise<Array<{ id: string; name: string; toStatus: string }>> {
    const res = await fetch(`${JIRA_URL}/rest/api/3/issue/${issueKey}/transitions`, {
        headers: {
            Authorization: authHeader(),
            Accept: "application/json",
        },
    })

    if (!res.ok) {
        throw new Error(`Failed to get transitions for ${issueKey}: ${res.statusText}`)
    }

    const data = (await res.json()) as { transitions: Array<{ id: string; name: string; to: { name: string } }> }
    return (data.transitions ?? []).map((t) => ({
        id: t.id,
        name: t.name,
        toStatus: t.to?.name ?? t.name,
    }))
}

export async function transitionIssue(issueKey: string, transitionName: string): Promise<void> {
    const transitions = await getIssueTransitions(issueKey)
    const match = transitions.find(
        (t) => t.name.toLowerCase() === transitionName.toLowerCase() || t.toStatus.toLowerCase() === transitionName.toLowerCase(),
    )
    if (!match) {
        const available = transitions.map((t) => `${t.name} → ${t.toStatus}`).join(", ")
        throw new Error(`Transition "${transitionName}" not found for ${issueKey}. Available: ${available}`)
    }

    const res = await fetch(`${JIRA_URL}/rest/api/3/issue/${issueKey}/transitions`, {
        method: "POST",
        headers: {
            Authorization: authHeader(),
            "Content-Type": "application/json",
            Accept: "application/json",
        },
        body: JSON.stringify({ transition: { id: match.id } }),
    })

    if (!res.ok) {
        throw new Error(`Failed to transition ${issueKey}: ${res.statusText}`)
    }
}
