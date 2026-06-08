import { NextResponse } from "next/server"
import { AgentRunner, extractUserText } from "@/lib/agent/runner"

export async function POST(
  request: Request,
  { params }: { params: Promise<{ projectSlug: string }> },
) {
  const { projectSlug } = await params

  let body: {
    messages?: unknown
    id?: string
    sessionId?: string
  }
  try {
    body = await request.json()
  } catch {
    return NextResponse.json({ error: "Invalid JSON body" }, { status: 400 })
  }

  const messages = Array.isArray(body.messages) ? body.messages : []
  const lastUser = [...messages]
    .reverse()
    .find((m): m is Record<string, unknown> => {
      return (
        !!m &&
        typeof m === "object" &&
        (m as Record<string, unknown>).role === "user"
      )
    })
  if (!lastUser) {
    return NextResponse.json(
      { error: "No user message found" },
      { status: 400 },
    )
  }

  const userText = extractUserText(lastUser)
  if (!userText) {
    return NextResponse.json(
      { error: "No user text found" },
      { status: 400 },
    )
  }

  const sessionId = (body.sessionId ?? null) as string | null

  return AgentRunner.run(projectSlug, sessionId, userText)
}
