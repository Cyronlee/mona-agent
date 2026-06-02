import path from "node:path"

function resolveProjectsRoot(): string {
    if (process.env.PROJECTS_ROOT) return process.env.PROJECTS_ROOT
    return path.resolve(/* turbopackIgnore: true */ process.cwd(), "../projects")
}

function resolveAgentWorkspace(): string {
    if (process.env.AGENT_WORKSPACE) return process.env.AGENT_WORKSPACE
    return path.resolve(/* turbopackIgnore: true */ process.cwd(), "../workspace")
}

const PROJECTS_ROOT = resolveProjectsRoot()
const AGENT_WORKSPACE = resolveAgentWorkspace()

export function projectsRoot(): string {
  return PROJECTS_ROOT
}

export function agentWorkspace(): string {
  return AGENT_WORKSPACE
}

export function projectDir(projectSlug: string): string {
  return path.join(PROJECTS_ROOT, projectSlug)
}

export function runtimeDir(projectSlug: string): string {
  return path.join(projectDir(projectSlug), ".runtime")
}

export function sessionsDir(projectSlug: string): string {
  return path.join(runtimeDir(projectSlug), "sessions")
}

export function jobsDir(projectSlug: string): string {
  return path.join(runtimeDir(projectSlug), "jobs")
}

export function sessionJsonPath(projectSlug: string, sessionId: string): string {
  return path.join(sessionsDir(projectSlug), `${sessionId}.json`)
}

export function sessionJsonlPath(projectSlug: string, sessionId: string): string {
  return path.join(sessionsDir(projectSlug), `${sessionId}.jsonl`)
}

export function jobJsonPath(projectSlug: string, jobId: string): string {
  return path.join(jobsDir(projectSlug), `${jobId}.json`)
}

export function jobLogPath(projectSlug: string, jobId: string): string {
  return path.join(jobsDir(projectSlug), `${jobId}.log`)
}
