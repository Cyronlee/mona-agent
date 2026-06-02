import { NextResponse } from "next/server"
import { getSuggestionDocument, ContentError } from "@/lib/projects/loader"

export async function GET(
    _req: Request,
    {
        params,
    }: { params: Promise<{ projectSlug: string; featureSlug: string; suggestionSlug: string }> },
) {
    try {
        const { projectSlug, featureSlug, suggestionSlug } = await params
        return NextResponse.json(getSuggestionDocument(projectSlug, featureSlug, suggestionSlug))
    } catch (error) {
        if (error instanceof ContentError) {
            return NextResponse.json({ error: error.message }, { status: error.status })
        }
        return NextResponse.json({ error: "Internal server error" }, { status: 500 })
    }
}
