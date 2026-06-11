import { z } from "zod"

// ── JSON metadata schemas ─────────────────────────────────────────────────────

export const ProjectMetaSchema = z.object({
    slug: z.string(),
    title: z.string(),
    desc: z.string(),
    status: z.enum(["active", "archived", "paused"]),
    createdAt: z.string(),
    updatedAt: z.string(),
})

export const FeatureMetaSchema = z.object({
    slug: z.string(),
    title: z.string(),
    desc: z.string(),
    status: z.enum(["planned", "in-progress", "done", "paused"]),
    order: z.number(),
    owner: z.string().optional(),
    updatedAt: z.string(),
})

// ── Frontmatter schemas ───────────────────────────────────────────────────────

export const PrdFrontmatterSchema = z.object({
    title: z.string(),
    desc: z.string().optional(),
    status: z.string().optional(),
    version: z.string().optional(),
    updatedAt: z.string().optional(),
})

export const FeatureIndexFrontmatterSchema = z.object({
    title: z.string(),
    desc: z.string().optional(),
    status: z.string().optional(),
    goals: z.array(z.string()).optional(),
    jiraKey: z.string().optional(),
    jiraSyncedAt: z.string().optional(),
    updatedAt: z.string().optional(),
})

export const StoryFrontmatterSchema = z.object({
    title: z.string(),
    desc: z.string().optional(),
    status: z.string().optional(),
    priority: z.number().optional(),
    order: z.number().optional(),
    assignee: z.string().optional(),
    updatedAt: z.string().optional(),
})

export const SuggestionFrontmatterSchema = z.object({
    title: z.string(),
    desc: z.string().optional(),
    status: z.string().optional(),
    source: z.string().optional(),
    impact: z.enum(["low", "medium", "high"]).optional(),
    relatedStorySlugs: z.array(z.string()).optional(),
    updatedAt: z.string().optional(),
})

export const ProjectPreviewStatusSchema = z.enum([
    "idle",
    "running",
    "ready",
    "error",
])

export const ProjectPreviewStateSchema = z.object({
    url: z.string(),
    status: ProjectPreviewStatusSchema,
    pid: z.number().int().nullable(),
})

// ── Inferred types ────────────────────────────────────────────────────────────

export type ProjectMeta = z.infer<typeof ProjectMetaSchema>
export type FeatureMeta = z.infer<typeof FeatureMetaSchema>
export type PrdFrontmatter = z.infer<typeof PrdFrontmatterSchema>
export type FeatureIndexFrontmatter = z.infer<typeof FeatureIndexFrontmatterSchema>
export type StoryFrontmatter = z.infer<typeof StoryFrontmatterSchema>
export type SuggestionFrontmatter = z.infer<typeof SuggestionFrontmatterSchema>
export type ProjectPreviewState = z.infer<typeof ProjectPreviewStateSchema>

// ── API response types ────────────────────────────────────────────────────────

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

export type AggregatedSuggestion = SuggestionSummary & {
    featureSlug: string
    featureTitle: string
}

export type FeatureSummary = {
    slug: string
    title: string
    desc: string
    status: string
    order: number
    storyCount: number
    suggestionCount: number
    jiraKey?: string
    jiraSyncedAt?: string
    stories: StorySummary[]
}

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

export type ProjectDetail = {
    meta: ProjectMeta
    prd: PrdFrontmatter | null
    features: FeatureSummary[]
}

export type PrdDocument = PrdFrontmatter & { content: string }

export type FeatureDetail = {
    meta: FeatureMeta
    index: (FeatureIndexFrontmatter & { content: string }) | null
    stories: StorySummary[]
    suggestions: SuggestionSummary[]
}

export type StoryDocument = StoryFrontmatter & { slug: string; content: string }

export type SuggestionDocument = SuggestionFrontmatter & { slug: string; content: string }
