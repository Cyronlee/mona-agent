// Client-side API client for the projects content layer.
// All types mirror the JSON shapes returned by the Route Handlers.

export type ProjectSummary = {
    slug: string
    title: string
    desc: string
    status: string
    updatedAt: string
    featureCount: number
    storyCount: number
    suggestionCount: number
}

export type FeatureSummary = {
    slug: string
    title: string
    desc: string
    status: string
    order: number
    storyCount: number
    suggestionCount: number
    stories: StorySummary[]
}

export type ProjectDetail = {
    meta: { slug: string; title: string; desc: string; status: string; updatedAt: string }
    prd: { title: string; desc?: string; status?: string; version?: string } | null
    features: FeatureSummary[]
}

export type AggregatedSuggestion = {
    slug: string
    title: string
    desc?: string
    status?: string
    impact?: string
    featureSlug: string
    featureTitle: string
}

export type StorySummary = {
    slug: string
    title: string
    desc?: string
    status?: string
    priority?: number
    order?: number
}

export type SuggestionSummary = {
    slug: string
    title: string
    desc?: string
    status?: string
    impact?: string
}

export type FeatureDetail = {
    meta: FeatureSummary
    index: { title: string; desc?: string; status?: string; goals?: string[]; content: string } | null
    stories: StorySummary[]
    suggestions: SuggestionSummary[]
}

// ── Fetchers ──────────────────────────────────────────────────────────────────

async function apiFetch<T>(path: string): Promise<T> {
    const res = await fetch(path)
    if (!res.ok) {
        const body = await res.json().catch(() => ({}))
        throw new Error((body as { error?: string }).error ?? `Request failed: ${res.status}`)
    }
    return res.json() as Promise<T>
}

async function apiPost<T>(path: string, body: unknown): Promise<T> {
    const res = await fetch(path, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
    })
    if (!res.ok) {
        const data = (await res.json().catch(() => ({}))) as { error?: string }
        throw new ApiError(data.error ?? `Request failed: ${res.status}`, res.status)
    }
    return res.json() as Promise<T>
}

export class ApiError extends Error {
    readonly status: number
    constructor(message: string, status: number) {
        super(message)
        this.name = "ApiError"
        this.status = status
    }
}

export function listProjects(): Promise<ProjectSummary[]> {
    return apiFetch("/api/projects")
}

export function createProject(input: { title: string; desc?: string }): Promise<ProjectSummary> {
    return apiPost("/api/projects", input)
}

export function getProjectDetail(projectSlug: string): Promise<ProjectDetail> {
    return apiFetch(`/api/projects/${projectSlug}`)
}

export function getProjectPrd(projectSlug: string): Promise<{ title: string; content: string }> {
    return apiFetch(`/api/projects/${projectSlug}/prd`)
}

export function listFeatures(projectSlug: string): Promise<FeatureSummary[]> {
    return apiFetch(`/api/projects/${projectSlug}/features`)
}

export function getFeatureDetail(projectSlug: string, featureSlug: string): Promise<FeatureDetail> {
    return apiFetch(`/api/projects/${projectSlug}/features/${featureSlug}`)
}

export function getAllSuggestions(projectSlug: string): Promise<AggregatedSuggestion[]> {
    return apiFetch(`/api/projects/${projectSlug}/suggestions`)
}

export function getStoryDocument(
    projectSlug: string,
    featureSlug: string,
    storySlug: string,
): Promise<StorySummary & { content: string }> {
    return apiFetch(`/api/projects/${projectSlug}/features/${featureSlug}/stories/${storySlug}`)
}

export function getSuggestionDocument(
    projectSlug: string,
    featureSlug: string,
    suggestionSlug: string,
): Promise<SuggestionSummary & { content: string }> {
    return apiFetch(`/api/projects/${projectSlug}/features/${featureSlug}/suggestions/${suggestionSlug}`)
}
