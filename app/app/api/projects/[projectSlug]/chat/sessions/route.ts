import { NextResponse } from "next/server"
import { listSessions } from "@/lib/runtime/sessions"

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ projectSlug: string }> },
) {
  const { projectSlug } = await params
  try {
    const sessions = await listSessions(projectSlug)
    return NextResponse.json(sessions)
  } catch (err) {
    return NextResponse.json(
      { error: `Failed to list sessions: ${(err as Error).message}` },
      { status: 500 },
    )
  }
}
