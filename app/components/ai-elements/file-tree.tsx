"use client"

import { cn } from "@/lib/utils"
import {
  ChevronRightIcon,
  FileIcon,
  FolderIcon,
  FolderOpenIcon,
} from "lucide-react"
import type { HTMLAttributes, ReactNode } from "react"
import {
  createContext,
  useCallback,
  useContext,
  useMemo,
  useState,
} from "react"

interface FileTreeContextType {
  expandedPaths: Set<string>
  togglePath: (path: string) => void
  selectedPath?: string
  onSelect?: (path: string) => void
}

const noop = () => {}

const FileTreeContext = createContext<FileTreeContextType>({
  expandedPaths: new Set(),
  togglePath: noop,
})

export type FileTreeProps = Omit<HTMLAttributes<HTMLDivElement>, "onSelect"> & {
  expanded?: Set<string>
  defaultExpanded?: Set<string>
  selectedPath?: string
  onSelect?: (path: string) => void
  onExpandedChange?: (expanded: Set<string>) => void
}

export function FileTree({
  expanded: controlledExpanded,
  defaultExpanded = new Set(),
  selectedPath,
  onSelect,
  onExpandedChange,
  className,
  children,
  ...props
}: FileTreeProps) {
  const [internalExpanded, setInternalExpanded] = useState(defaultExpanded)
  const expandedPaths = controlledExpanded ?? internalExpanded

  const togglePath = useCallback(
    (path: string) => {
      const nextExpanded = new Set(expandedPaths)
      if (nextExpanded.has(path)) {
        nextExpanded.delete(path)
      } else {
        nextExpanded.add(path)
      }
      setInternalExpanded(nextExpanded)
      onExpandedChange?.(nextExpanded)
    },
    [expandedPaths, onExpandedChange],
  )

  const contextValue = useMemo(
    () => ({ expandedPaths, togglePath, selectedPath, onSelect }),
    [expandedPaths, togglePath, selectedPath, onSelect],
  )

  return (
    <FileTreeContext.Provider value={contextValue}>
      <div
        className={cn(
          "rounded-lg border bg-background font-mono text-sm",
          className,
        )}
        role="tree"
        {...props}
      >
        <div className="p-2">{children}</div>
      </div>
    </FileTreeContext.Provider>
  )
}

export type FileTreeFolderProps = HTMLAttributes<HTMLDivElement> & {
  path: string
  name: string
}

export function FileTreeFolder({
  path,
  name,
  className,
  children,
  ...props
}: FileTreeFolderProps) {
  const { expandedPaths, togglePath } = useContext(FileTreeContext)
  const isExpanded = expandedPaths.has(path)

  const handleToggle = useCallback(() => {
    togglePath(path)
  }, [path, togglePath])

  return (
    <div className={className} role="treeitem" {...props}>
      <div className="flex items-center gap-1 rounded px-2 py-1 transition-colors hover:bg-muted/50">
        <button
          className="flex size-4 shrink-0 cursor-pointer items-center justify-center border-none bg-transparent p-0"
          onClick={handleToggle}
          type="button"
        >
          <ChevronRightIcon
            className={cn(
              "size-4 text-muted-foreground transition-transform",
              isExpanded && "rotate-90",
            )}
          />
        </button>
        <button
          className="flex min-w-0 flex-1 cursor-pointer items-center gap-1 border-none bg-transparent p-0 text-left"
          onClick={handleToggle}
          type="button"
        >
          {isExpanded ? (
            <FolderOpenIcon className="size-4 shrink-0 text-blue-500" />
          ) : (
            <FolderIcon className="size-4 shrink-0 text-blue-500" />
          )}
          <span className="truncate">{name}</span>
        </button>
      </div>
      {isExpanded ? <div className="ml-4 border-l pl-2">{children}</div> : null}
    </div>
  )
}

export type FileTreeFileProps = HTMLAttributes<HTMLDivElement> & {
  path: string
  name: string
  icon?: ReactNode
}

export function FileTreeFile({
  path,
  name,
  icon,
  className,
  children,
  ...props
}: FileTreeFileProps) {
  const { selectedPath, onSelect } = useContext(FileTreeContext)
  const isSelected = selectedPath === path

  const handleClick = useCallback(() => {
    onSelect?.(path)
  }, [onSelect, path])

  const handleKeyDown = useCallback(
    (event: React.KeyboardEvent) => {
      if (event.key === "Enter" || event.key === " ") {
        event.preventDefault()
        onSelect?.(path)
      }
    },
    [onSelect, path],
  )

  return (
    <div
      className={cn(
        "flex cursor-pointer items-center gap-1 rounded px-2 py-1 transition-colors hover:bg-muted/50",
        isSelected && "bg-muted",
        className,
      )}
      onClick={handleClick}
      onKeyDown={handleKeyDown}
      role="treeitem"
      tabIndex={0}
      {...props}
    >
      {children ?? (
        <>
          <span className="size-4 shrink-0" />
          {icon ?? <FileIcon className="size-4 shrink-0 text-muted-foreground" />}
          <span className="truncate">{name}</span>
        </>
      )}
    </div>
  )
}