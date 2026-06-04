import { NextResponse } from "next/server"
import { getStoryDocument, updateStoryFrontmatter, ContentError } from "@/lib/projects/loader"

export async function GET(
    _req: Request,
    { params }: { params: Promise<{ projectSlug: string; featureSlug: string; storySlug: string }> },
) {
    try {
        const { projectSlug, featureSlug, storySlug } = await params
        return NextResponse.json(getStoryDocument(projectSlug, featureSlug, storySlug))
    } catch (error) {
        if (error instanceof ContentError) {
            return NextResponse.json({ error: error.message }, { status: error.status })
        }
        return NextResponse.json({ error: "Internal server error" }, { status: 500 })
    }
}

export async function PATCH(
    req: Request,
    { params }: { params: Promise<{ projectSlug: string; featureSlug: string; storySlug: string }> },
) {
    try {
        const { projectSlug, featureSlug, storySlug } = await params
        const body = (await req.json().catch(() => ({}))) as Record<string, unknown>
        const numOrNull = (v: unknown): number | null | undefined => {
            if (v === null) return null
            if (typeof v === "number" && Number.isFinite(v)) return v
            return undefined
        }
        const patch = {
            title: typeof body.title === "string" ? body.title : undefined,
            desc: body.desc === null ? null : typeof body.desc === "string" ? body.desc : undefined,
            status: body.status === null ? null : typeof body.status === "string" ? body.status : undefined,
            priority: numOrNull(body.priority),
            order: numOrNull(body.order),
            assignee: body.assignee === null ? null : typeof body.assignee === "string" ? body.assignee : undefined,
        }
        const updated = updateStoryFrontmatter(projectSlug, featureSlug, storySlug, patch)
        return NextResponse.json(updated)
    } catch (error) {
        if (error instanceof ContentError) {
            return NextResponse.json({ error: error.message }, { status: error.status })
        }
        return NextResponse.json({ error: "Internal server error" }, { status: 500 })
    }
}
