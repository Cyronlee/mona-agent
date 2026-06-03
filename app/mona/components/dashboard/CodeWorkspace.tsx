"use client"

import { CodeBlock } from "@/components/ai-elements/code-block"
import {
  FileTree,
  FileTreeFile,
  FileTreeFolder,
} from "@/components/ai-elements/file-tree"
import {
  getProjectCodeFile,
  getProjectCodeTree,
  type ProjectCodeFile,
  type ProjectCodeNode,
} from "../../api/projects"
import { useEffect, useMemo, useState } from "react"

function findFirstFile(nodes: ProjectCodeNode[]): string | null {
  for (const node of nodes) {
    if (node.kind === "file") {
      return node.path
    }
    if (node.children) {
      const nested = findFirstFile(node.children)
      if (nested) {
        return nested
      }
    }
  }
  return null
}

function collectExpandedDirectories(nodes: ProjectCodeNode[]): Set<string> {
  const expanded = new Set<string>()
  const walk = (items: ProjectCodeNode[]) => {
    for (const item of items) {
      if (item.kind === "directory") {
        expanded.add(item.path)
        if (item.children) {
          walk(item.children)
        }
      }
    }
  }
  walk(nodes)
  return expanded
}

function renderTree(nodes: ProjectCodeNode[]): React.ReactNode {
  return nodes.map((node) => {
    if (node.kind === "directory") {
      return (
        <FileTreeFolder key={node.path} name={node.name} path={node.path}>
          {renderTree(node.children ?? [])}
        </FileTreeFolder>
      )
    }

    return <FileTreeFile key={node.path} name={node.name} path={node.path} />
  })
}

export function CodeWorkspace({ projectSlug }: { projectSlug: string }) {
  const [tree, setTree] = useState<ProjectCodeNode[]>([])
  const [expandedPaths, setExpandedPaths] = useState<Set<string>>(new Set())
  const [selectedPath, setSelectedPath] = useState<string>()
  const [currentFile, setCurrentFile] = useState<ProjectCodeFile | null>(null)
  const [treeError, setTreeError] = useState<string | null>(null)
  const [fileError, setFileError] = useState<string | null>(null)
  const [treeLoading, setTreeLoading] = useState(false)
  const [fileLoading, setFileLoading] = useState(false)

  useEffect(() => {
    let cancelled = false
    setTreeLoading(true)
    setTreeError(null)
    setTree([])
    setExpandedPaths(new Set())
    setSelectedPath(undefined)
    setCurrentFile(null)
    setFileError(null)

    getProjectCodeTree(projectSlug)
      .then((nodes) => {
        if (cancelled) return
        setTree(nodes)
        setExpandedPaths(collectExpandedDirectories(nodes))
        setSelectedPath(findFirstFile(nodes) ?? undefined)
      })
      .catch((error) => {
        if (cancelled) return
        setTreeError(error instanceof Error ? error.message : "Failed to load code tree")
      })
      .finally(() => {
        if (!cancelled) {
          setTreeLoading(false)
        }
      })

    return () => {
      cancelled = true
    }
  }, [projectSlug])

  useEffect(() => {
    if (!selectedPath) {
      setCurrentFile(null)
      setFileError(null)
      return
    }

    let cancelled = false
    setFileLoading(true)
    setFileError(null)

    getProjectCodeFile(projectSlug, selectedPath)
      .then((file) => {
        if (cancelled) return
        setCurrentFile(file)
      })
      .catch((error) => {
        if (cancelled) return
        setCurrentFile(null)
        setFileError(error instanceof Error ? error.message : "Failed to load code file")
      })
      .finally(() => {
        if (!cancelled) {
          setFileLoading(false)
        }
      })

    return () => {
      cancelled = true
    }
  }, [projectSlug, selectedPath])

  const sidebarBody = useMemo(() => {
    if (treeLoading) {
      return <div className="px-4 py-3 text-sm text-[#717182]">Loading files...</div>
    }
    if (treeError) {
      return <div className="px-4 py-3 text-sm text-red-600">{treeError}</div>
    }
    if (tree.length === 0) {
      return (
        <div className="px-4 py-3 text-sm text-[#717182]">
          This project does not have any files yet.
        </div>
      )
    }

    return (
      <FileTree
        className="h-full rounded-none border-0 bg-transparent"
        expanded={expandedPaths}
        onExpandedChange={setExpandedPaths}
        onSelect={setSelectedPath}
        selectedPath={selectedPath}
      >
        {renderTree(tree)}
      </FileTree>
    )
  }, [expandedPaths, selectedPath, tree, treeError, treeLoading])

  return (
    <div className="flex flex-1 overflow-hidden">
      <aside
        className="flex shrink-0 flex-col overflow-hidden"
        style={{ width: 260, borderRight: "1px solid rgba(0,0,0,0.06)", background: "#fafafa" }}
      >
        <div
          className="px-4 py-3 text-[13px] uppercase tracking-[0.08em] text-[#717182]"
          style={{ borderBottom: "1px solid rgba(0,0,0,0.06)", fontFamily: "Inter, sans-serif", fontWeight: 600 }}
        >
          Project Files
        </div>
        <div className="min-h-0 flex-1 overflow-auto py-2">{sidebarBody}</div>
      </aside>

      <div className="flex min-w-0 flex-1 flex-col overflow-hidden bg-white">
        <div
          className="flex items-center justify-between px-5 py-3"
          style={{ borderBottom: "1px solid rgba(0,0,0,0.06)" }}
        >
          <div className="min-w-0">
            <div
              className="truncate text-[14px] text-[#0a0a0a]"
              style={{ fontFamily: "Inter, sans-serif", fontWeight: 600 }}
            >
              {currentFile?.path ?? "No file selected"}
            </div>
            <div
              className="mt-1 text-[12px] text-[#717182]"
              style={{ fontFamily: "Inter, sans-serif" }}
            >
              {currentFile
                ? `${currentFile.language} · ${currentFile.size} bytes`
                : "Project-scoped, read-only file view"}
            </div>
          </div>
          {fileLoading ? (
            <div className="text-[12px] text-[#717182]" style={{ fontFamily: "Inter, sans-serif" }}>
              Loading...
            </div>
          ) : null}
        </div>

        <div className="min-h-0 flex-1 overflow-auto bg-[#f8f9fb] p-4">
          {fileError ? (
            <div className="rounded-[12px] border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
              {fileError}
            </div>
          ) : currentFile ? (
            <CodeBlock
              className="overflow-hidden border border-black/8 bg-white"
              code={currentFile.content}
              language={currentFile.language}
              showLineNumbers
            />
          ) : (
            <div className="flex h-full items-center justify-center rounded-[16px] border border-dashed border-black/10 bg-white text-sm text-[#717182]">
              Select a file from the tree to inspect the project code.
            </div>
          )}
        </div>
      </div>
    </div>
  )
}