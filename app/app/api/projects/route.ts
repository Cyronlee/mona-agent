import { NextResponse } from "next/server"
import { z } from "zod"
import { ContentError, createProject, listProjects } from "@/lib/projects/loader"

const CreateProjectSchema = z.object({
    title: z.string().min(1).max(120),
    desc: z.string().max(500).optional(),
})

export async function GET() {
    try {
        return NextResponse.json(listProjects())
    } catch (error) {
        if (error instanceof ContentError) {
            return NextResponse.json({ error: error.message }, { status: error.status })
        }
        return NextResponse.json({ error: "Internal server error" }, { status: 500 })
    }
}

export async function POST(req: Request) {
    let body: unknown
    try {
        body = await req.json()
    } catch {
        return NextResponse.json({ error: "Invalid JSON body" }, { status: 400 })
    }
    const parsed = CreateProjectSchema.safeParse(body)
    if (!parsed.success) {
        return NextResponse.json({ error: parsed.error.issues[0]?.message ?? "Invalid input" }, { status: 422 })
    }
    try {
        return NextResponse.json(createProject(parsed.data), { status: 201 })
    } catch (error) {
        if (error instanceof ContentError) {
            return NextResponse.json({ error: error.message }, { status: error.status })
        }
        return NextResponse.json({ error: "Internal server error" }, { status: 500 })
    }
}
