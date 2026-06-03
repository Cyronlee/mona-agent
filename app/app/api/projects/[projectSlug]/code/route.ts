import { NextResponse } from "next/server"
import {
  listProjectCodeTree,
  ProjectCodeError,
} from "@/lib/projects/code-store"

export async function GET(
  _req: Request,
  { params }: { params: Promise<{ projectSlug: string }> },
) {
  try {
    const { projectSlug } = await params
    return NextResponse.json(await listProjectCodeTree(projectSlug))
  } catch (error) {
    if (error instanceof ProjectCodeError) {
      return NextResponse.json({ error: error.message }, { status: error.status })
    }
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}