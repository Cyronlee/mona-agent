// This module reads from the filesystem and must only be imported in server contexts
// (Route Handlers, Server Components). Never import in client components.
import fs from "node:fs"
import path from "node:path"
import matter from "gray-matter"
import type {
    ProjectMeta,
    FeatureMeta,
    ProjectSummary,
    ProjectDetail,
    PrdDocument,
    FeatureSummary,
    FeatureDetail,
    StoryDocument,
    SuggestionDocument,
    StorySummary,
    SuggestionSummary,
    AggregatedSuggestion,
} from "./types"
import {
    ProjectMetaSchema,
    FeatureMetaSchema,
    PrdFrontmatterSchema,
    ProjectPreviewState,
    ProjectPreviewStateSchema,
    FeatureIndexFrontmatterSchema,
    StoryFrontmatterSchema,
    StoryFrontmatter,
    SuggestionFrontmatterSchema,
    SuggestionFrontmatter,
} from "./types"

// ── Content root ──────────────────────────────────────────────────────────────

function getProjectsRoot(): string {
    return process.env.PROJECTS_ROOT ?? path.resolve(process.cwd(), "../projects")
}

// ── Slug helpers ──────────────────────────────────────────────────────────────

function slugify(input: string): string {
    return input
        .toLowerCase()
        .trim()
        .replace(/[^a-z0-9\s-]/g, "")
        .replace(/\s+/g, "-")
        .replace(/-+/g, "-")
        .replace(/^-+|-+$/g, "")
}

function resolveUniqueSlug(root: string, base: string): string {
    if (!base) return ""
    if (!fs.existsSync(path.join(root, base))) return base
    let i = 2
    while (fs.existsSync(path.join(root, `${base}-${i}`))) i++
    return `${base}-${i}`
}

// ── Internal error type ───────────────────────────────────────────────────────

export class ContentError extends Error {
    readonly status: 404 | 422
    constructor(msg: string, status: 404 | 422 = 404) {
        super(msg)
        this.name = "ContentError"
        this.status = status
    }
}

// ── Low-level FS helpers ──────────────────────────────────────────────────────

function safeReadJson<T>(filePath: string): T | null {
    try {
        return JSON.parse(fs.readFileSync(filePath, "utf-8")) as T
    } catch {
        return null
    }
}

function safeReadMd(filePath: string): { data: Record<string, unknown>; content: string } | null {
    try {
        const { data, content } = matter(fs.readFileSync(filePath, "utf-8"))
        return { data, content }
    } catch {
        return null
    }
}

function listSubdirs(dirPath: string): string[] {
    try {
        return fs
            .readdirSync(dirPath)
            .filter((name) => fs.statSync(path.join(dirPath, name)).isDirectory())
    } catch {
        return []
    }
}

function listMdSlugs(dirPath: string): string[] {
    try {
        return fs
            .readdirSync(dirPath)
            .filter((name) => name.endsWith(".md"))
            .map((name) => name.replace(/\.md$/, ""))
    } catch {
        return []
    }
}

function writeJsonAtomicSync(filePath: string, data: unknown): void {
    const tmpPath = `${filePath}.tmp`
    fs.writeFileSync(tmpPath, JSON.stringify(data, null, 2), "utf-8")
    fs.renameSync(tmpPath, filePath)
}

// ── Validated meta accessors ──────────────────────────────────────────────────

function requireProjectMeta(projectSlug: string): ProjectMeta {
    const file = path.join(getProjectsRoot(), projectSlug, "project.json")
    const raw = safeReadJson<unknown>(file)
    if (!raw) throw new ContentError(`Project "${projectSlug}" not found`)
    const result = ProjectMetaSchema.safeParse(raw)
    if (!result.success) throw new ContentError(`Invalid project.json for "${projectSlug}": ${result.error.message}`, 422)
    return result.data
}

function requireFeatureMeta(projectSlug: string, featureSlug: string): FeatureMeta {
    const file = path.join(getProjectsRoot(), projectSlug, "features", featureSlug, "feature.json")
    const raw = safeReadJson<unknown>(file)
    if (!raw) throw new ContentError(`Feature "${featureSlug}" not found in project "${projectSlug}"`)
    const result = FeatureMetaSchema.safeParse(raw)
    if (!result.success)
        throw new ContentError(`Invalid feature.json for "${projectSlug}/${featureSlug}": ${result.error.message}`, 422)
    return result.data
}

// ── Feature summary builder ───────────────────────────────────────────────────

function buildFeatureSummary(projectSlug: string, featureSlug: string): FeatureSummary | null {
    const root = getProjectsRoot()
    const featureDir = path.join(root, projectSlug, "features", featureSlug)
    const raw = safeReadJson<unknown>(path.join(featureDir, "feature.json"))
    const parsed = raw ? FeatureMetaSchema.safeParse(raw) : null
    if (!parsed?.success) return null

    const fm = parsed.data
    const storySlugs = listMdSlugs(path.join(featureDir, "story"))
    const stories: StorySummary[] = storySlugs
        .map((slug): StorySummary | null => {
            const doc = safeReadMd(path.join(featureDir, "story", `${slug}.md`))
            if (!doc) return null
            const sfm = StoryFrontmatterSchema.safeParse(doc.data)
            if (!sfm.success) return null
            return { slug, title: sfm.data.title, desc: sfm.data.desc, status: sfm.data.status, priority: sfm.data.priority, order: sfm.data.order }
        })
        .filter((s): s is StorySummary => s !== null)
        .sort((a, b) => (a.order ?? 99) - (b.order ?? 99))

    return {
        slug: fm.slug,
        title: fm.title,
        desc: fm.desc,
        status: fm.status,
        order: fm.order,
        storyCount: storySlugs.length,
        suggestionCount: listMdSlugs(path.join(featureDir, "suggestions")).length,
        stories,
    }
}

// ── Public API ────────────────────────────────────────────────────────────────

export function listProjects(): ProjectSummary[] {
    const root = getProjectsRoot()
    const projectSlugs = listSubdirs(root)
    const results: ProjectSummary[] = []

    for (const slug of projectSlugs) {
        const raw = safeReadJson<unknown>(path.join(root, slug, "project.json"))
        const parsed = raw ? ProjectMetaSchema.safeParse(raw) : null
        if (!parsed?.success) continue

        const meta = parsed.data
        const featuresDir = path.join(root, slug, "features")
        const featureSlugs = listSubdirs(featuresDir)
        let storyCount = 0
        let suggestionCount = 0
        for (const fSlug of featureSlugs) {
            storyCount += listMdSlugs(path.join(featuresDir, fSlug, "story")).length
            suggestionCount += listMdSlugs(path.join(featuresDir, fSlug, "suggestions")).length
        }

        results.push({
            slug: meta.slug,
            title: meta.title,
            desc: meta.desc,
            status: meta.status,
            updatedAt: meta.updatedAt,
            featureCount: featureSlugs.length,
            storyCount,
            suggestionCount,
        })
    }

    return results
}

export function createProject(input: { title: string; desc?: string }): ProjectSummary {
    const title = (input.title ?? "").trim()
    if (!title) throw new ContentError("title is required", 422)
    if (title.length > 120) throw new ContentError("title too long (max 120 chars)", 422)

    const root = getProjectsRoot()
    fs.mkdirSync(root, { recursive: true })

    const base = slugify(title)
    if (!base) {
        throw new ContentError("title must contain at least one alphanumeric character", 422)
    }

    const slug = resolveUniqueSlug(root, base)
    const projectDir = path.join(root, slug)
    const codeDir = path.join(projectDir, "code")
    const featuresDir = path.join(projectDir, "features")
    const now = new Date().toISOString().slice(0, 10)
    const desc = (input.desc ?? "").trim() || `${title} project workspace.`

    fs.mkdirSync(codeDir, { recursive: true })
    fs.mkdirSync(featuresDir, { recursive: true })

    const meta: ProjectMeta = {
        slug,
        title,
        desc,
        status: "active",
        createdAt: now,
        updatedAt: now,
    }
    fs.writeFileSync(path.join(projectDir, "project.json"), JSON.stringify(meta, null, 4))

    const prdBody = [
        "## Overview",
        "",
        desc,
        "",
        "## Goals",
        "",
        "- Define the initial scope and success criteria",
        "- Identify primary users and their jobs-to-be-done",
        "",
        "## Scope",
        "",
        "_To be filled in._",
    ].join("\n")
    const prdDoc = [
        "---",
        `title: "${title} — Product Requirements Document"`,
        `desc: ${JSON.stringify(desc)}`,
        "status: draft",
        'version: "0.1"',
        `updatedAt: ${JSON.stringify(now)}`,
        "---",
        "",
        prdBody,
        "",
    ].join("\n")
    fs.writeFileSync(path.join(projectDir, "PRD.md"), prdDoc)

    return {
        slug: meta.slug,
        title: meta.title,
        desc: meta.desc,
        status: meta.status,
        updatedAt: meta.updatedAt,
        featureCount: 0,
        storyCount: 0,
        suggestionCount: 0,
    }
}

export function getProjectDetail(projectSlug: string): ProjectDetail {
    const meta = requireProjectMeta(projectSlug)
    const root = getProjectsRoot()

    const prdParsed = safeReadMd(path.join(root, projectSlug, "PRD.md"))
    const prdFm = prdParsed ? PrdFrontmatterSchema.safeParse(prdParsed.data) : null
    const prd = prdFm?.success ? prdFm.data : null

    const featureSlugs = listSubdirs(path.join(root, projectSlug, "features"))
    const features: FeatureSummary[] = featureSlugs
        .map((fSlug) => buildFeatureSummary(projectSlug, fSlug))
        .filter((f): f is FeatureSummary => f !== null)
        .sort((a, b) => a.order - b.order)

    return { meta, prd, features }
}

export function getProjectPrd(projectSlug: string): PrdDocument {
    requireProjectMeta(projectSlug)
    const file = path.join(getProjectsRoot(), projectSlug, "PRD.md")
    const parsed = safeReadMd(file)
    if (!parsed) throw new ContentError(`PRD.md not found for project "${projectSlug}"`)
    const fm = PrdFrontmatterSchema.safeParse(parsed.data)
    if (!fm.success) throw new ContentError(`Invalid PRD.md frontmatter for "${projectSlug}"`, 422)
    return { ...fm.data, content: parsed.content.trim() }
}

export function updateProjectPrd(projectSlug: string, content: string): PrdDocument {
    requireProjectMeta(projectSlug)
    const file = path.join(getProjectsRoot(), projectSlug, "PRD.md")
    const parsed = safeReadMd(file)
    if (!parsed) throw new ContentError(`PRD.md not found for project "${projectSlug}"`)
    const fm = PrdFrontmatterSchema.safeParse(parsed.data)
    if (!fm.success) throw new ContentError(`Invalid PRD.md frontmatter for "${projectSlug}"`, 422)

    const doc = matter.stringify(content, { ...fm.data, updatedAt: new Date().toISOString().slice(0, 10) })
    fs.writeFileSync(file, doc)
    return { ...fm.data, content: content.trim() }
}

function previewStatePath(projectSlug: string): string {
    return path.join(getProjectsRoot(), projectSlug, "preview.json")
}

function defaultPreviewState(): ProjectPreviewState {
    return {
        url: "",
        status: "idle",
        pid: null,
    }
}

export function getProjectPreviewState(projectSlug: string): ProjectPreviewState {
    requireProjectMeta(projectSlug)
    const filePath = previewStatePath(projectSlug)
    const raw = safeReadJson<unknown>(filePath)
    if (!raw) return defaultPreviewState()

    const parsed = ProjectPreviewStateSchema.safeParse(raw)
    if (!parsed.success) {
        throw new ContentError(`Invalid preview.json for "${projectSlug}": ${parsed.error.message}`, 422)
    }
    return parsed.data
}

export function updateProjectPreviewState(
    projectSlug: string,
    input: ProjectPreviewState,
): ProjectPreviewState {
    requireProjectMeta(projectSlug)
    const parsed = ProjectPreviewStateSchema.safeParse(input)
    if (!parsed.success) {
        throw new ContentError(`Invalid preview payload: ${parsed.error.message}`, 422)
    }

    const filePath = previewStatePath(projectSlug)
    writeJsonAtomicSync(filePath, parsed.data)
    return parsed.data
}

export function patchProjectPreviewState(
    projectSlug: string,
    patch: Partial<ProjectPreviewState>,
): ProjectPreviewState {
    const current = getProjectPreviewState(projectSlug)
    const next = {
        ...current,
        ...patch,
    }

    const parsed = ProjectPreviewStateSchema.safeParse(next)
    if (!parsed.success) {
        throw new ContentError(`Invalid preview payload: ${parsed.error.message}`, 422)
    }

    const filePath = previewStatePath(projectSlug)
    writeJsonAtomicSync(filePath, parsed.data)
    return parsed.data
}

export function listFeatures(projectSlug: string): FeatureSummary[] {
    requireProjectMeta(projectSlug)
    const featuresDir = path.join(getProjectsRoot(), projectSlug, "features")
    return listSubdirs(featuresDir)
        .map((fSlug) => buildFeatureSummary(projectSlug, fSlug))
        .filter((f): f is FeatureSummary => f !== null)
        .sort((a, b) => a.order - b.order)
}

export function getFeatureDetail(projectSlug: string, featureSlug: string): FeatureDetail {
    const meta = requireFeatureMeta(projectSlug, featureSlug)
    const featureDir = path.join(getProjectsRoot(), projectSlug, "features", featureSlug)

    const indexParsed = safeReadMd(path.join(featureDir, "index.md"))
    const indexFm = indexParsed ? FeatureIndexFrontmatterSchema.safeParse(indexParsed.data) : null
    const index = indexFm?.success ? { ...indexFm.data, content: indexParsed!.content.trim() } : null

    const stories: StorySummary[] = listMdSlugs(path.join(featureDir, "story"))
        .map((slug): StorySummary | null => {
            const doc = safeReadMd(path.join(featureDir, "story", `${slug}.md`))
            if (!doc) return null
            const fm = StoryFrontmatterSchema.safeParse(doc.data)
            if (!fm.success) return null
            return { slug, title: fm.data.title, desc: fm.data.desc, status: fm.data.status, priority: fm.data.priority, order: fm.data.order }
        })
        .filter((s): s is StorySummary => s !== null)
        .sort((a, b) => (a.order ?? 99) - (b.order ?? 99))

    const suggestions: SuggestionSummary[] = listMdSlugs(path.join(featureDir, "suggestions"))
        .map((slug): SuggestionSummary | null => {
            const doc = safeReadMd(path.join(featureDir, "suggestions", `${slug}.md`))
            if (!doc) return null
            const fm = SuggestionFrontmatterSchema.safeParse(doc.data)
            if (!fm.success) return null
            return { slug, title: fm.data.title, desc: fm.data.desc, status: fm.data.status, impact: fm.data.impact }
        })
        .filter((s): s is SuggestionSummary => s !== null)

    return { meta, index, stories, suggestions }
}

export function getStoryDocument(projectSlug: string, featureSlug: string, storySlug: string): StoryDocument {
    requireFeatureMeta(projectSlug, featureSlug)
    const file = path.join(getProjectsRoot(), projectSlug, "features", featureSlug, "story", `${storySlug}.md`)
    const parsed = safeReadMd(file)
    if (!parsed) throw new ContentError(`Story "${storySlug}" not found in feature "${featureSlug}"`)
    const fm = StoryFrontmatterSchema.safeParse(parsed.data)
    if (!fm.success) throw new ContentError(`Invalid frontmatter for story "${storySlug}"`, 422)
    return { slug: storySlug, ...fm.data, content: parsed.content.trim() }
}

export type FeatureFrontmatterPatch = Partial<{
    title: string
    desc: string | null
    status: string | null
    goals: string[] | null
}>

export function updateFeatureIndexFrontmatter(
    projectSlug: string,
    featureSlug: string,
    patch: FeatureFrontmatterPatch,
): FeatureDetail {
    const meta = requireFeatureMeta(projectSlug, featureSlug)
    const file = path.join(getProjectsRoot(), projectSlug, "features", featureSlug, "index.md")
    const parsed = safeReadMd(file)
    if (!parsed) throw new ContentError(`index.md not found for feature "${featureSlug}"`)
    const fm = FeatureIndexFrontmatterSchema.safeParse(parsed.data)
    if (!fm.success) throw new ContentError(`Invalid frontmatter for feature "${featureSlug}"`, 422)

    const next: Record<string, unknown> = { ...fm.data }
    if (patch.title !== undefined) next.title = patch.title
    if (patch.desc !== undefined) next.desc = patch.desc ?? undefined
    if (patch.status !== undefined) next.status = patch.status ?? undefined
    if (patch.goals !== undefined) next.goals = patch.goals ?? undefined
    if (Object.keys(next).length === 0) throw new ContentError("patch is empty", 422)

    const validated = FeatureIndexFrontmatterSchema.safeParse(next)
    if (!validated.success) throw new ContentError(`Invalid patched frontmatter: ${validated.error.message}`, 422)

    next.updatedAt = new Date().toISOString().slice(0, 10)
    const doc = matter.stringify(parsed.content, next)
    fs.writeFileSync(file, doc)
    void meta

    return getFeatureDetail(projectSlug, featureSlug)
}

export type StoryFrontmatterPatch = Partial<{
    title: string
    desc: string | null
    status: string | null
    priority: number | null
    order: number | null
    assignee: string | null
}>

export function updateStoryFrontmatter(
    projectSlug: string,
    featureSlug: string,
    storySlug: string,
    patch: StoryFrontmatterPatch,
): StoryDocument {
    requireFeatureMeta(projectSlug, featureSlug)
    const file = path.join(getProjectsRoot(), projectSlug, "features", featureSlug, "story", `${storySlug}.md`)
    const parsed = safeReadMd(file)
    if (!parsed) throw new ContentError(`Story "${storySlug}" not found in feature "${featureSlug}"`)
    const fm = StoryFrontmatterSchema.safeParse(parsed.data)
    if (!fm.success) throw new ContentError(`Invalid frontmatter for story "${storySlug}"`, 422)

    const next: Record<string, unknown> = { ...fm.data }
    if (patch.title !== undefined) next.title = patch.title
    if (patch.desc !== undefined) next.desc = patch.desc ?? undefined
    if (patch.status !== undefined) next.status = patch.status ?? undefined
    if (patch.priority !== undefined) next.priority = patch.priority ?? undefined
    if (patch.order !== undefined) next.order = patch.order ?? undefined
    if (patch.assignee !== undefined) next.assignee = patch.assignee ?? undefined
    if (Object.keys(next).length === 0) throw new ContentError("patch is empty", 422)

    const validated = StoryFrontmatterSchema.safeParse(next)
    if (!validated.success) throw new ContentError(`Invalid patched frontmatter: ${validated.error.message}`, 422)

    next.updatedAt = new Date().toISOString().slice(0, 10)
    const doc = matter.stringify(parsed.content, next)
    fs.writeFileSync(file, doc)

    return { slug: storySlug, ...(validated.data as StoryFrontmatter), content: parsed.content.trim() }
}

export function getSuggestionDocument(
    projectSlug: string,
    featureSlug: string,
    suggestionSlug: string,
): SuggestionDocument {
    requireFeatureMeta(projectSlug, featureSlug)
    const file = path.join(
        getProjectsRoot(),
        projectSlug,
        "features",
        featureSlug,
        "suggestions",
        `${suggestionSlug}.md`,
    )
    const parsed = safeReadMd(file)
    if (!parsed) throw new ContentError(`Suggestion "${suggestionSlug}" not found in feature "${featureSlug}"`)
    const fm = SuggestionFrontmatterSchema.safeParse(parsed.data)
    if (!fm.success) throw new ContentError(`Invalid frontmatter for suggestion "${suggestionSlug}"`, 422)
    return { slug: suggestionSlug, ...fm.data, content: parsed.content.trim() }
}

export type SuggestionFrontmatterPatch = Partial<{
    title: string
    desc: string | null
    status: string | null
    source: string | null
    impact: "low" | "medium" | "high" | null
    relatedStorySlugs: string[] | null
}>

export function updateSuggestionFrontmatter(
    projectSlug: string,
    featureSlug: string,
    suggestionSlug: string,
    patch: SuggestionFrontmatterPatch,
): SuggestionDocument {
    requireFeatureMeta(projectSlug, featureSlug)
    const file = path.join(
        getProjectsRoot(),
        projectSlug,
        "features",
        featureSlug,
        "suggestions",
        `${suggestionSlug}.md`,
    )
    const parsed = safeReadMd(file)
    if (!parsed) throw new ContentError(`Suggestion "${suggestionSlug}" not found in feature "${featureSlug}"`)
    const fm = SuggestionFrontmatterSchema.safeParse(parsed.data)
    if (!fm.success) throw new ContentError(`Invalid frontmatter for suggestion "${suggestionSlug}"`, 422)

    const next: Record<string, unknown> = { ...fm.data }
    if (patch.title !== undefined) next.title = patch.title
    if (patch.desc !== undefined) next.desc = patch.desc ?? undefined
    if (patch.status !== undefined) next.status = patch.status ?? undefined
    if (patch.source !== undefined) next.source = patch.source ?? undefined
    if (patch.impact !== undefined) next.impact = patch.impact ?? undefined
    if (patch.relatedStorySlugs !== undefined) next.relatedStorySlugs = patch.relatedStorySlugs ?? undefined
    if (Object.keys(next).length === 0) throw new ContentError("patch is empty", 422)

    const validated = SuggestionFrontmatterSchema.safeParse(next)
    if (!validated.success) throw new ContentError(`Invalid patched frontmatter: ${validated.error.message}`, 422)

    next.updatedAt = new Date().toISOString().slice(0, 10)
    const doc = matter.stringify(parsed.content, next)
    fs.writeFileSync(file, doc)

    return { slug: suggestionSlug, ...(validated.data as SuggestionFrontmatter), content: parsed.content.trim() }
}

export function getAllProjectSuggestions(projectSlug: string): AggregatedSuggestion[] {
    requireProjectMeta(projectSlug)
    const root = getProjectsRoot()
    const featuresDir = path.join(root, projectSlug, "features")
    const featureSlugs = listSubdirs(featuresDir)
    const results: AggregatedSuggestion[] = []

    for (const fSlug of featureSlugs) {
        const featureRaw = safeReadJson<unknown>(path.join(featuresDir, fSlug, "feature.json"))
        const featureParsed = featureRaw ? FeatureMetaSchema.safeParse(featureRaw) : null
        const featureTitle = featureParsed?.success ? featureParsed.data.title : fSlug

        listMdSlugs(path.join(featuresDir, fSlug, "suggestions")).forEach((slug) => {
            const doc = safeReadMd(path.join(featuresDir, fSlug, "suggestions", `${slug}.md`))
            if (!doc) return
            const fm = SuggestionFrontmatterSchema.safeParse(doc.data)
            if (!fm.success) return
            results.push({ slug, title: fm.data.title, desc: fm.data.desc, status: fm.data.status, impact: fm.data.impact, featureSlug: fSlug, featureTitle })
        })
    }

    return results
}
