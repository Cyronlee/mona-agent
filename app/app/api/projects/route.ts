import { NextResponse } from "next/server"
import { listProjects } from "@/lib/projects/loader"
import { ContentError } from "@/lib/projects/loader"

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
