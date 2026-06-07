import { NextResponse } from "next/server"
import {
    ContentError,
    getProjectPreviewState,
    patchProjectPreviewState,
    updateProjectPreviewState,
} from "@/lib/projects/loader"

export async function GET(
    _req: Request,
    { params }: { params: Promise<{ projectSlug: string }> },
) {
    try {
        const { projectSlug } = await params
        return NextResponse.json(getProjectPreviewState(projectSlug))
    } catch (error) {
        if (error instanceof ContentError) {
            return NextResponse.json({ error: error.message }, { status: error.status })
        }
        return NextResponse.json({ error: "Internal server error" }, { status: 500 })
    }
}

export async function PUT(
    req: Request,
    { params }: { params: Promise<{ projectSlug: string }> },
) {
    try {
        const { projectSlug } = await params
        const body = await req.json()
        return NextResponse.json(updateProjectPreviewState(projectSlug, body))
    } catch (error) {
        if (error instanceof ContentError) {
            return NextResponse.json({ error: error.message }, { status: error.status })
        }
        return NextResponse.json({ error: "Internal server error" }, { status: 500 })
    }
}

export async function PATCH(
    req: Request,
    { params }: { params: Promise<{ projectSlug: string }> },
) {
    try {
        const { projectSlug } = await params
        const body = await req.json()
        return NextResponse.json(patchProjectPreviewState(projectSlug, body ?? {}))
    } catch (error) {
        if (error instanceof ContentError) {
            return NextResponse.json({ error: error.message }, { status: error.status })
        }
        return NextResponse.json({ error: "Internal server error" }, { status: 500 })
    }
}
