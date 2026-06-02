import { NextResponse } from "next/server"
import { listFeatures, ContentError } from "@/lib/projects/loader"

export async function GET(_req: Request, { params }: { params: Promise<{ projectSlug: string }> }) {
    try {
        const { projectSlug } = await params
        return NextResponse.json(listFeatures(projectSlug))
    } catch (error) {
        if (error instanceof ContentError) {
            return NextResponse.json({ error: error.message }, { status: error.status })
        }
        return NextResponse.json({ error: "Internal server error" }, { status: 500 })
    }
}
