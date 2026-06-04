import { NextResponse } from "next/server"
import { getFeatureDetail, updateFeatureIndexFrontmatter, ContentError } from "@/lib/projects/loader"

export async function GET(
    _req: Request,
    { params }: { params: Promise<{ projectSlug: string; featureSlug: string }> },
) {
    try {
        const { projectSlug, featureSlug } = await params
        return NextResponse.json(getFeatureDetail(projectSlug, featureSlug))
    } catch (error) {
        if (error instanceof ContentError) {
            return NextResponse.json({ error: error.message }, { status: error.status })
        }
        return NextResponse.json({ error: "Internal server error" }, { status: 500 })
    }
}

export async function PATCH(
    req: Request,
    { params }: { params: Promise<{ projectSlug: string; featureSlug: string }> },
) {
    try {
        const { projectSlug, featureSlug } = await params
        const body = (await req.json().catch(() => ({}))) as Record<string, unknown>
        const patch = {
            title: typeof body.title === "string" ? body.title : undefined,
            desc: body.desc === null ? null : typeof body.desc === "string" ? body.desc : undefined,
            status: body.status === null ? null : typeof body.status === "string" ? body.status : undefined,
            goals: Array.isArray(body.goals)
                ? (body.goals as unknown[]).filter((g): g is string => typeof g === "string")
                : body.goals === null
                  ? null
                  : undefined,
        }
        const updated = updateFeatureIndexFrontmatter(projectSlug, featureSlug, patch)
        return NextResponse.json(updated)
    } catch (error) {
        if (error instanceof ContentError) {
            return NextResponse.json({ error: error.message }, { status: error.status })
        }
        return NextResponse.json({ error: "Internal server error" }, { status: 500 })
    }
}
