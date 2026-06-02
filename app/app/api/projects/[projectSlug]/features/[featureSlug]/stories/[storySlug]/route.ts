import { NextResponse } from "next/server"
import { getStoryDocument, ContentError } from "@/lib/projects/loader"

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
