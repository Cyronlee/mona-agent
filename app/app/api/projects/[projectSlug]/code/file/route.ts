import { NextResponse } from "next/server"
import {
  readProjectCodeFile,
  ProjectCodeError,
} from "@/lib/projects/code-store"

export async function GET(
  req: Request,
  { params }: { params: Promise<{ projectSlug: string }> },
) {
  try {
    const { projectSlug } = await params
    const filePath = new URL(req.url).searchParams.get("path") ?? ""
    return NextResponse.json(await readProjectCodeFile(projectSlug, filePath))
  } catch (error) {
    if (error instanceof ProjectCodeError) {
      return NextResponse.json({ error: error.message }, { status: error.status })
    }
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}