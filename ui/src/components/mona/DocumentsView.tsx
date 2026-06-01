import { useCallback, useEffect, useMemo, useRef, useState } from "react"
import {
  getCoreRowModel,
  getPaginationRowModel,
  getSortedRowModel,
  useReactTable,
} from "@tanstack/react-table"
import type { ColumnDef, SortingState } from "@tanstack/react-table"
import { format } from "date-fns"
import {
  PlusIcon,
  MoreHorizontalIcon,
  PencilIcon,
  Trash2Icon,
  FolderIcon,
} from "lucide-react"

import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { DataGrid } from "@/components/reui/data-grid/data-grid"
import { DataGridContainer } from "@/components/reui/data-grid/data-grid"
import { DataGridColumnHeader } from "@/components/reui/data-grid/data-grid-column-header"
import { DataGridPagination } from "@/components/reui/data-grid/data-grid-pagination"
import { DataGridTable } from "@/components/reui/data-grid/data-grid-table"
import {
  fetchDocuments as apiFetchDocuments,
  fetchFolders as apiFetchFolders,
  createDocument,
  updateDocument,
  deleteDocument,
} from "@/api-clients/documents"
import type { Document } from "@/api-clients/documents"

import {
  MDXEditor,
  headingsPlugin,
  listsPlugin,
  quotePlugin,
  thematicBreakPlugin,
  markdownShortcutPlugin,
  linkPlugin,
  tablePlugin,
  codeBlockPlugin,
  toolbarPlugin,
  BoldItalicUnderlineToggles,
  BlockTypeSelect,
  CreateLink,
  InsertThematicBreak,
  ListsToggle,
  CodeToggle,
  UndoRedo,
  type MDXEditorMethods,
} from "@mdxeditor/editor"
import "@mdxeditor/editor/style.css"

function formatDate(dateStr: string) {
  try {
    return format(new Date(dateStr), "yyyy-MM-dd HH:mm")
  } catch {
    return dateStr
  }
}

export function DocumentsView() {
  const [documents, setDocuments] = useState<Document[]>([])
  const [folders, setFolders] = useState<string[]>([])
  const [selectedFolder, setSelectedFolder] = useState<string>("__all__")
  const [isLoading, setIsLoading] = useState(true)
  const [sorting, setSorting] = useState<SortingState>([])

  // Dialog state
  const [dialogOpen, setDialogOpen] = useState(false)
  const [editingDoc, setEditingDoc] = useState<Document | null>(null)
  const [formFolder, setFormFolder] = useState("")
  const [formTitle, setFormTitle] = useState("")
  const [formContent, setFormContent] = useState("")
  const [isSaving, setIsSaving] = useState(false)
  const mdxRef = useRef<MDXEditorMethods | null>(null)

  // Delete confirm
  const [deleteConfirmOpen, setDeleteConfirmOpen] = useState(false)
  const [deletingDoc, setDeletingDoc] = useState<Document | null>(null)

  const fetchDocuments = useCallback(async () => {
    setIsLoading(true)
    try {
      const folder =
        selectedFolder === "__all__" ? undefined : selectedFolder
      const data = await apiFetchDocuments(folder)
      setDocuments(data)
    } finally {
      setIsLoading(false)
    }
  }, [selectedFolder])

  const fetchFolders = useCallback(async () => {
    try {
      const data = await apiFetchFolders()
      setFolders(data)
    } catch {
      // ignore
    }
  }, [])

  useEffect(() => {
    fetchDocuments()
  }, [fetchDocuments])

  useEffect(() => {
    fetchFolders()
  }, [fetchFolders])

  const handleCreate = () => {
    setEditingDoc(null)
    setFormFolder(selectedFolder === "__all__" ? "" : selectedFolder)
    setFormTitle("")
    setFormContent("")
    setDialogOpen(true)
  }

  const handleEdit = (doc: Document) => {
    setEditingDoc(doc)
    setFormFolder(doc.folder)
    setFormTitle(doc.title)
    setFormContent(doc.content)
    setDialogOpen(true)
  }

  const handleSave = async () => {
    if (!formFolder.trim() || !formTitle.trim()) return
    const markdown = mdxRef.current?.getMarkdown() ?? formContent
    setIsSaving(true)
    try {
      if (editingDoc) {
        await updateDocument(editingDoc.id, {
          folder: formFolder.trim(),
          title: formTitle.trim(),
          content: markdown,
        })
      } else {
        await createDocument({
          folder: formFolder.trim(),
          title: formTitle.trim(),
          content: markdown,
        })
      }
      setDialogOpen(false)
      fetchDocuments()
      fetchFolders()
    } finally {
      setIsSaving(false)
    }
  }

  const handleDeleteConfirm = async () => {
    if (!deletingDoc) return
    await deleteDocument(deletingDoc.id)
    setDeleteConfirmOpen(false)
    setDeletingDoc(null)
    fetchDocuments()
    fetchFolders()
  }

  const columns: ColumnDef<Document>[] = useMemo(
    () => [
      {
        accessorKey: "folder",
        header: ({ column }) => (
          <DataGridColumnHeader column={column} title="文件夹" />
        ),
        cell: ({ row }) => (
          <Badge variant="secondary" className="text-[10px] h-5 px-1.5 gap-1">
            <FolderIcon className="size-3" />
            {row.original.folder}
          </Badge>
        ),
        size: 140,
      },
      {
        accessorKey: "title",
        header: ({ column }) => (
          <DataGridColumnHeader column={column} title="标题" />
        ),
        cell: ({ row }) => (
          <span
            className="text-sm font-medium text-slate-800 cursor-pointer hover:underline"
            onClick={() => handleEdit(row.original)}
          >
            {row.original.title}
          </span>
        ),
      },
      {
        accessorKey: "content",
        header: ({ column }) => (
          <DataGridColumnHeader column={column} title="内容摘要" />
        ),
        cell: ({ row }) => (
          <span className="text-xs text-slate-500 line-clamp-1 max-w-[300px]">
            {row.original.content.slice(0, 80)}
          </span>
        ),
        enableSorting: false,
      },
      {
        accessorKey: "createdAt",
        header: ({ column }) => (
          <DataGridColumnHeader column={column} title="创建时间" />
        ),
        cell: ({ row }) => (
          <span className="text-xs text-slate-400">
            {formatDate(row.original.createdAt)}
          </span>
        ),
        size: 140,
      },
      {
        accessorKey: "updatedAt",
        header: ({ column }) => (
          <DataGridColumnHeader column={column} title="更新时间" />
        ),
        cell: ({ row }) => (
          <span className="text-xs text-slate-400">
            {formatDate(row.original.updatedAt)}
          </span>
        ),
        size: 140,
      },
      {
        id: "actions",
        header: () => null,
        cell: ({ row }) => {
          const doc = row.original
          return (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="icon-sm" className="ml-auto">
                  <MoreHorizontalIcon className="size-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-32">
                <DropdownMenuItem onClick={() => handleEdit(doc)}>
                  <PencilIcon className="size-3.5" />
                  编辑
                </DropdownMenuItem>
                <DropdownMenuItem
                  className="text-destructive"
                  onClick={() => {
                    setDeletingDoc(doc)
                    setDeleteConfirmOpen(true)
                  }}
                >
                  <Trash2Icon className="size-3.5" />
                  删除
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          )
        },
        size: 48,
        enableSorting: false,
        enableHiding: false,
      },
    ],
    []
  )

  const table = useReactTable({
    data: documents,
    columns,
    state: { sorting },
    onSortingChange: setSorting,
    getCoreRowModel: getCoreRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    initialState: { pagination: { pageSize: 20 } },
  })

  // Unique folders for the select dropdown (from fetched list + current docs)
  const allFolders = useMemo(() => {
    const set = new Set([...folders, ...documents.map((d) => d.folder)])
    return Array.from(set).sort()
  }, [folders, documents])

  return (
    <div className="flex flex-col gap-4">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-base font-semibold text-slate-900">文档库</h2>
          <p className="text-xs text-slate-400 mt-0.5">
            管理和浏览所有文档
          </p>
        </div>
        <Button size="sm" onClick={handleCreate}>
          <PlusIcon className="size-3.5" />
          新建文档
        </Button>
      </div>

      {/* Toolbar: folder filter */}
      <div className="flex items-center gap-2">
        <span className="text-xs text-slate-500">文件夹筛选:</span>
        <Select value={selectedFolder} onValueChange={setSelectedFolder}>
          <SelectTrigger className="w-44 h-7" size="sm">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="__all__">全部</SelectItem>
            {allFolders.map((f) => (
              <SelectItem key={f} value={f}>
                {f}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {/* Data Grid */}
      <DataGridContainer>
        <DataGrid
          table={table}
          recordCount={documents.length}
          isLoading={isLoading}
          loadingMode="skeleton"
          emptyMessage="暂无文档"
          tableLayout={{
            rowBorder: true,
            headerSticky: true,
            headerBackground: true,
          }}
        >
          <DataGridTable />
          <div className="border-t border-border px-3">
            <DataGridPagination />
          </div>
        </DataGrid>
      </DataGridContainer>

      {/* Create / Edit Dialog */}
      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="sm:max-w-4xl h-[80vh] flex flex-col p-0 gap-0 overflow-hidden">
          <DialogHeader className="px-6 pt-5 pb-3 border-b shrink-0">
            <DialogTitle>
              {editingDoc ? "编辑文档" : "新建文档"}
            </DialogTitle>
            <DialogDescription>
              {editingDoc
                ? "修改文档内容和元数据"
                : "填写文档信息创建新文档"}
            </DialogDescription>
          </DialogHeader>

          <div className="flex flex-col flex-1 min-h-0 overflow-hidden">
            <div className="flex items-center gap-3 px-6 py-3 border-b shrink-0">
              <div className="flex flex-col gap-1">
                <Label htmlFor="doc-folder" className="text-xs">
                  文件夹
                </Label>
                <Input
                  id="doc-folder"
                  value={formFolder}
                  onChange={(e) => setFormFolder(e.target.value)}
                  placeholder="如: 知识文档、参考代码"
                  className="h-7 w-40 text-sm"
                />
              </div>
              <div className="flex flex-col gap-1">
                <Label htmlFor="doc-title" className="text-xs">
                  标题
                </Label>
                <Input
                  id="doc-title"
                  value={formTitle}
                  onChange={(e) => setFormTitle(e.target.value)}
                  placeholder="文档标题"
                  className="h-7 w-60 text-sm"
                />
              </div>
            </div>

            <div className="flex-1 min-h-0 overflow-auto">
              <MDXEditor
                ref={mdxRef}
                markdown={formContent}
                onChange={setFormContent}
                className="h-full"
                plugins={[
                  headingsPlugin(),
                  listsPlugin(),
                  quotePlugin(),
                  thematicBreakPlugin(),
                  markdownShortcutPlugin(),
                  linkPlugin(),
                  tablePlugin(),
                  codeBlockPlugin(),
                  toolbarPlugin({
                    toolbarContents: () => (
                      <>
                        <BlockTypeSelect />
                        <BoldItalicUnderlineToggles />
                        <ListsToggle />
                        <CreateLink />
                        <CodeToggle />
                        <InsertThematicBreak />
                        <UndoRedo />
                      </>
                    ),
                  }),
                ]}
              />
            </div>
          </div>

          <DialogFooter className="px-6 py-3 border-t shrink-0">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setDialogOpen(false)}
            >
              取消
            </Button>
            <Button size="sm" onClick={handleSave} disabled={isSaving}>
              {isSaving ? "保存中..." : "保存"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Confirm Dialog */}
      <Dialog open={deleteConfirmOpen} onOpenChange={setDeleteConfirmOpen}>
        <DialogContent className="sm:max-w-sm">
          <DialogHeader>
            <DialogTitle>确认删除</DialogTitle>
            <DialogDescription>
              确定要删除文档「{deletingDoc?.title}」吗？此操作不可撤销。
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setDeleteConfirmOpen(false)}
            >
              取消
            </Button>
            <Button
              variant="destructive"
              size="sm"
              onClick={handleDeleteConfirm}
            >
              删除
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
