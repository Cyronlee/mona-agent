import { NextResponse } from "next/server"
import { getProjectPrd, updateProjectPrd, ContentError } from "@/lib/projects/loader"

export async function GET(_req: Request, { params }: { params: Promise<{ projectSlug: string }> }) {
    try {
        const { projectSlug } = await params
        return NextResponse.json(getProjectPrd(projectSlug))
    } catch (error) {
        if (error instanceof ContentError) {
            return NextResponse.json({ error: error.message }, { status: error.status })
        }
        return NextResponse.json({ error: "Internal server error" }, { status: 500 })
    }
}

export async function PUT(req: Request, { params }: { params: Promise<{ projectSlug: string }> }) {
    try {
        const { projectSlug } = await params
        const body = await req.json() as { content: string }
        if (typeof body.content !== "string") {
            return NextResponse.json({ error: "content is required" }, { status: 422 })
        }
        return NextResponse.json(updateProjectPrd(projectSlug, body.content))
    } catch (error) {
        if (error instanceof ContentError) {
            return NextResponse.json({ error: error.message }, { status: error.status })
        }
        return NextResponse.json({ error: "Internal server error" }, { status: 500 })
    }
}
