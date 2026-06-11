import { NextResponse } from "next/server"
import { getFeatureDetail, updateFeatureIndexFrontmatter, ContentError } from "@/lib/projects/loader"
import { createJiraIssue } from "@/lib/jira/client"

const JIRA_PROJECT_KEY = "SSP"

export async function POST(
    _req: Request,
    { params }: { params: Promise<{ projectSlug: string; featureSlug: string }> },
) {
    try {
        const { projectSlug, featureSlug } = await params

        const detail = getFeatureDetail(projectSlug, featureSlug)
        const title = detail.index?.title ?? detail.meta.title
        const desc = detail.index?.desc ?? detail.meta.desc

        const description = [
            `Feature: ${title}`,
            desc ? `\nDescription: ${desc}` : "",
            `\n\nMona Feature: ${featureSlug} (project: ${projectSlug})`,
        ].join("")

        const issue = await createJiraIssue({
            projectKey: JIRA_PROJECT_KEY,
            issueType: "Story",
            summary: title,
            description,
        })

        const now = new Date().toISOString().slice(0, 10)
        const updated = updateFeatureIndexFrontmatter(projectSlug, featureSlug, {
            jiraKey: issue.key,
            jiraSyncedAt: now,
        })

        return NextResponse.json({
            feature: updated,
            jira: { key: issue.key, url: issue.url },
        })
    } catch (error) {
        if (error instanceof ContentError) {
            return NextResponse.json({ error: error.message }, { status: error.status })
        }
        const message = error instanceof Error ? error.message : "Internal server error"
        return NextResponse.json({ error: message }, { status: 500 })
    }
}
