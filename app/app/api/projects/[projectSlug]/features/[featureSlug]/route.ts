import { NextResponse } from "next/server"
import { getFeatureDetail, ContentError } from "@/lib/projects/loader"

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
