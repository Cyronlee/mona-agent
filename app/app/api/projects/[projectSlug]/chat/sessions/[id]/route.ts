import { NextResponse } from "next/server"
import { deleteSession, getSession } from "@/lib/runtime/sessions"
import { listMessages } from "@/lib/runtime/messages"

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ projectSlug: string; id: string }> },
) {
  const { projectSlug, id } = await params
  const session = await getSession(projectSlug, id)
  if (!session) {
    return NextResponse.json({ error: "Session not found" }, { status: 404 })
  }
  const messages = await listMessages(projectSlug, id)
  return NextResponse.json({ ...session, messages })
}

export async function DELETE(
  _request: Request,
  { params }: { params: Promise<{ projectSlug: string; id: string }> },
) {
  const { projectSlug, id } = await params
  try {
    const removed = await deleteSession(projectSlug, id)
    if (!removed) {
      return NextResponse.json({ error: "Session not found" }, { status: 404 })
    }
    return NextResponse.json({ ok: true })
  } catch (err) {
    return NextResponse.json(
      { error: `Failed to delete session: ${(err as Error).message}` },
      { status: 500 },
    )
  }
}
