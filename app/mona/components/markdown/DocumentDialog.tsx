"use client";

import { useEffect, useState } from "react";
import { Icon } from "@iconify/react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogBody,
} from "@/components/ui/dialog";
import { MarkdownViewer } from "./MarkdownViewer";
import {
  FrontmatterPanel,
  type FrontmatterValue,
  type FrontmatterChange,
} from "./FrontmatterPanel";
import {
  getFeatureDetail,
  getStoryDocument,
  updateFeatureFrontmatter,
  updateStoryFrontmatterPatch,
  type FeatureFrontmatterPatch,
  type StoryFrontmatterPatch,
} from "../../api/projects";
import type {
  FeatureDetail,
  StoryDocument,
} from "../../api/projects";

export type DocumentDialogProps =
  | {
      kind: "feature";
      projectSlug: string;
      featureSlug: string;
      title: string;
      open: boolean;
      onOpenChange: (open: boolean) => void;
      onUpdated?: (data: FeatureDetail) => void;
    }
  | {
      kind: "story";
      projectSlug: string;
      featureSlug: string;
      storySlug: string;
      title: string;
      open: boolean;
      onOpenChange: (open: boolean) => void;
      onUpdated?: (data: StoryDocument) => void;
    };

const cache = new Map<string, FeatureDetail | StoryDocument>();

function FeatureDocumentBody({
  projectSlug,
  featureSlug,
  onUpdated,
}: {
  projectSlug: string;
  featureSlug: string;
  onUpdated?: (data: FeatureDetail) => void;
}) {
  const key = `feature:${projectSlug}:${featureSlug}`;
  const [data, setData] = useState<FeatureDetail | null>(
    () => (cache.get(key) as FeatureDetail | undefined) ?? null,
  );
  const [error, setError] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});

  useEffect(() => {
    if (data) return;
    let cancelled = false;
    getFeatureDetail(projectSlug, featureSlug)
      .then((d) => {
        if (cancelled) return;
        cache.set(key, d);
        setData(d);
        onUpdated?.(d);
      })
      .catch((e: Error) => {
        if (cancelled) return;
        setError(e.message);
      });
    return () => {
      cancelled = true;
    };
  }, [key, projectSlug, featureSlug, data, onUpdated]);

  if (error) return <ErrorState message={error} />;
  if (!data) return <LoadingState />;

  const handleChange = (change: FrontmatterChange) => {
    setSaving(true);
    setFieldErrors((prev) => {
      const next = { ...prev };
      delete next[change.key];
      return next;
    });
    const patch: FeatureFrontmatterPatch = {
      [change.key]: change.value as never,
    };
    updateFeatureFrontmatter(projectSlug, featureSlug, patch)
      .then((d) => {
        cache.set(`feature:${projectSlug}:${featureSlug}`, d);
        setData(d);
        setSaving(false);
        onUpdated?.(d);
      })
      .catch((e: Error) => {
        setSaving(false);
        setFieldErrors((prev) => ({ ...prev, [change.key]: e.message }));
      });
  };

  const frontmatter: Record<string, FrontmatterValue> = {
    desc: data.index?.desc,
    status: data.index?.status,
    goals: data.index?.goals,
    updatedAt: data.index?.updatedAt,
  };

  return (
    <>
      <DocumentContent markdown={data.index?.content ?? null} />
      <DocumentSidePanel
        fields={frontmatter}
        onChange={handleChange}
        saving={saving}
        errors={fieldErrors}
      />
    </>
  );
}

function StoryDocumentBody({
  projectSlug,
  featureSlug,
  storySlug,
  onUpdated,
}: {
  projectSlug: string;
  featureSlug: string;
  storySlug: string;
  onUpdated?: (data: StoryDocument) => void;
}) {
  const key = `story:${projectSlug}:${featureSlug}:${storySlug}`;
  const [data, setData] = useState<StoryDocument | null>(
    () => (cache.get(key) as StoryDocument | undefined) ?? null,
  );
  const [error, setError] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});

  useEffect(() => {
    if (data) return;
    let cancelled = false;
    getStoryDocument(projectSlug, featureSlug, storySlug)
      .then((d) => {
        if (cancelled) return;
        cache.set(key, d);
        setData(d);
        onUpdated?.(d);
      })
      .catch((e: Error) => {
        if (cancelled) return;
        setError(e.message);
      });
    return () => {
      cancelled = true;
    };
  }, [key, projectSlug, featureSlug, storySlug, data, onUpdated]);

  if (error) return <ErrorState message={error} />;
  if (!data) return <LoadingState />;

  const handleChange = (change: FrontmatterChange) => {
    setSaving(true);
    setFieldErrors((prev) => {
      const next = { ...prev };
      delete next[change.key];
      return next;
    });
    const patch: StoryFrontmatterPatch = {
      [change.key]: change.value as never,
    };
    updateStoryFrontmatterPatch(projectSlug, featureSlug, storySlug, patch)
      .then((d) => {
        cache.set(`story:${projectSlug}:${featureSlug}:${storySlug}`, d);
        setData(d);
        setSaving(false);
        onUpdated?.(d);
      })
      .catch((e: Error) => {
        setSaving(false);
        setFieldErrors((prev) => ({ ...prev, [change.key]: e.message }));
      });
  };

  const frontmatter: Record<string, FrontmatterValue> = {
    desc: data.desc,
    status: data.status,
    priority: data.priority,
    order: data.order,
    assignee: data.assignee,
    updatedAt: data.updatedAt,
  };

  return (
    <>
      <DocumentContent markdown={data.content} />
      <DocumentSidePanel
        fields={frontmatter}
        onChange={handleChange}
        saving={saving}
        errors={fieldErrors}
      />
    </>
  );
}

function DocumentContent({ markdown }: { markdown: string | null }) {
  if (!markdown) {
    return (
      <div className="flex-1 min-w-0 overflow-y-auto px-6 py-5 bg-white">
        <EmptyState />
      </div>
    );
  }
  return (
    <div className="flex-1 min-w-0 overflow-y-auto px-6 py-5 bg-white">
      <MarkdownViewer markdown={markdown} />
    </div>
  );
}

function DocumentSidePanel({
  fields,
  onChange,
  saving,
  errors,
}: {
  fields: Record<string, FrontmatterValue>;
  onChange: (change: FrontmatterChange) => void;
  saving: boolean;
  errors: Record<string, string>;
}) {
  return (
    <div className="w-[280px] shrink-0 border-l border-[rgba(0,0,0,0.08)] bg-[#fafafa]">
      <FrontmatterPanel
        fields={fields}
        className="h-full"
        onChange={onChange}
        saving={saving}
        errors={errors}
      />
    </div>
  );
}

export function DocumentDialog(props: DocumentDialogProps) {
  const { open, onOpenChange } = props;
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{props.title}</DialogTitle>
        </DialogHeader>
        <DialogBody>
          {props.kind === "feature" ? (
            <FeatureDocumentBody
              key={`feature:${props.projectSlug}:${props.featureSlug}`}
              projectSlug={props.projectSlug}
              featureSlug={props.featureSlug}
              onUpdated={props.onUpdated}
            />
          ) : (
            <StoryDocumentBody
              key={`story:${props.projectSlug}:${props.featureSlug}:${props.storySlug}`}
              projectSlug={props.projectSlug}
              featureSlug={props.featureSlug}
              storySlug={props.storySlug}
              onUpdated={props.onUpdated}
            />
          )}
        </DialogBody>
      </DialogContent>
    </Dialog>
  );
}

function LoadingState() {
  return (
    <div
      className="flex-1 min-w-0 flex items-center gap-2 px-6 py-5 text-[13px] text-[#717182] bg-white"
      style={{ fontFamily: "Poppins, sans-serif" }}
    >
      <Icon
        icon="lucide:loader-2"
        width={14}
        height={14}
        className="animate-spin"
      />
      Loading…
    </div>
  );
}

function ErrorState({ message }: { message: string }) {
  return (
    <div
      className="flex-1 min-w-0 flex flex-col gap-1 px-6 py-5 text-[13px] text-[#d4183d] bg-white"
      style={{ fontFamily: "Poppins, sans-serif" }}
    >
      <span style={{ fontWeight: 500 }}>Failed to load document</span>
      <span className="text-[#717182]">{message}</span>
    </div>
  );
}

function EmptyState() {
  return (
    <div
      className="text-[13px] text-[#a1a1aa] italic"
      style={{ fontFamily: "Poppins, sans-serif" }}
    >
      No content available.
    </div>
  );
}
