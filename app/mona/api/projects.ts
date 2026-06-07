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
    index: { title: string; desc?: string; status?: string; goals?: string[]; updatedAt?: string; content: string } | null
    stories: StorySummary[]
    suggestions: SuggestionSummary[]
}

export type StoryDocument = {
    slug: string
    title: string
    desc?: string
    status?: string
    priority?: number
    order?: number
    assignee?: string
    updatedAt?: string
    content: string
}

export type ProjectCodeNode = {
    path: string
    name: string
    kind: "file" | "directory"
    children?: ProjectCodeNode[]
}

export type ProjectCodeFile = {
    path: string
    content: string
    language: string
    size: number
    updatedAt: string
}

export type ProjectPreviewState = {
    url: string
    status: "idle" | "running" | "ready" | "error"
    pid: number | null
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

async function apiPut<T>(path: string, body: unknown): Promise<T> {
    const res = await fetch(path, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
    })
    if (!res.ok) {
        const data = (await res.json().catch(() => ({}))) as { error?: string }
        throw new ApiError(data.error ?? `Request failed: ${res.status}`, res.status)
    }
    return res.json() as Promise<T>
}

async function apiPatch<T>(path: string, body: unknown): Promise<T> {
    const res = await fetch(path, {
        method: "PATCH",
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

export function updateProjectPrd(projectSlug: string, content: string): Promise<{ title: string; content: string }> {
    return apiPut(`/api/projects/${projectSlug}/prd`, { content })
}

export function getProjectPreview(projectSlug: string): Promise<ProjectPreviewState> {
    return apiFetch(`/api/projects/${projectSlug}/preview`)
}

export function updateProjectPreview(
    projectSlug: string,
    payload: ProjectPreviewState,
): Promise<ProjectPreviewState> {
    return apiPut(`/api/projects/${projectSlug}/preview`, payload)
}

export function patchProjectPreview(
    projectSlug: string,
    payload: Partial<ProjectPreviewState>,
): Promise<ProjectPreviewState> {
    return apiPatch(`/api/projects/${projectSlug}/preview`, payload)
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

export function getProjectCodeTree(projectSlug: string): Promise<ProjectCodeNode[]> {
    return apiFetch(`/api/projects/${projectSlug}/code`)
}

export function getProjectCodeFile(projectSlug: string, filePath: string): Promise<ProjectCodeFile> {
    const params = new URLSearchParams({ path: filePath })
    return apiFetch(`/api/projects/${projectSlug}/code/file?${params.toString()}`)
}

export function getStoryDocument(
    projectSlug: string,
    featureSlug: string,
    storySlug: string,
): Promise<StoryDocument> {
    return apiFetch(`/api/projects/${projectSlug}/features/${featureSlug}/stories/${storySlug}`)
}

export type FeatureFrontmatterPatch = Partial<{
    title: string
    desc: string | null
    status: string | null
    goals: string[] | null
}>

export function updateFeatureFrontmatter(
    projectSlug: string,
    featureSlug: string,
    patch: FeatureFrontmatterPatch,
): Promise<FeatureDetail> {
    return apiPatch(`/api/projects/${projectSlug}/features/${featureSlug}`, patch)
}

export type StoryFrontmatterPatch = Partial<{
    title: string
    desc: string | null
    status: string | null
    priority: number | null
    order: number | null
    assignee: string | null
}>

export function updateStoryFrontmatterPatch(
    projectSlug: string,
    featureSlug: string,
    storySlug: string,
    patch: StoryFrontmatterPatch,
): Promise<StoryDocument> {
    return apiPatch(
        `/api/projects/${projectSlug}/features/${featureSlug}/stories/${storySlug}`,
        patch,
    )
}

export function getSuggestionDocument(
    projectSlug: string,
    featureSlug: string,
    suggestionSlug: string,
): Promise<SuggestionSummary & { content: string }> {
    return apiFetch(`/api/projects/${projectSlug}/features/${featureSlug}/suggestions/${suggestionSlug}`)
}
