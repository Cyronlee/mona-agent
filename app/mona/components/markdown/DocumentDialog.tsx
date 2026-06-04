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
import { FrontmatterPanel } from "./FrontmatterPanel";
import {
  getFeatureDetail,
  getStoryDocument,
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
    }
  | {
      kind: "story";
      projectSlug: string;
      featureSlug: string;
      storySlug: string;
      title: string;
      open: boolean;
      onOpenChange: (open: boolean) => void;
    };

const cache = new Map<string, FeatureDetail | StoryDocument>();

function FeatureDocumentBody({
  projectSlug,
  featureSlug,
}: {
  projectSlug: string;
  featureSlug: string;
}) {
  const key = `feature:${projectSlug}:${featureSlug}`;
  const [data, setData] = useState<FeatureDetail | null>(
    () => (cache.get(key) as FeatureDetail | undefined) ?? null,
  );
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (data) return;
    let cancelled = false;
    getFeatureDetail(projectSlug, featureSlug)
      .then((d) => {
        if (cancelled) return;
        cache.set(key, d);
        setData(d);
      })
      .catch((e: Error) => {
        if (cancelled) return;
        setError(e.message);
      });
    return () => {
      cancelled = true;
    };
  }, [key, projectSlug, featureSlug, data]);

  if (error) return <ErrorState message={error} />;
  if (!data) return <LoadingState />;
  return <ReadyBody data={data} />;
}

function StoryDocumentBody({
  projectSlug,
  featureSlug,
  storySlug,
}: {
  projectSlug: string;
  featureSlug: string;
  storySlug: string;
}) {
  const key = `story:${projectSlug}:${featureSlug}:${storySlug}`;
  const [data, setData] = useState<StoryDocument | null>(
    () => (cache.get(key) as StoryDocument | undefined) ?? null,
  );
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (data) return;
    let cancelled = false;
    getStoryDocument(projectSlug, featureSlug, storySlug)
      .then((d) => {
        if (cancelled) return;
        cache.set(key, d);
        setData(d);
      })
      .catch((e: Error) => {
        if (cancelled) return;
        setError(e.message);
      });
    return () => {
      cancelled = true;
    };
  }, [key, projectSlug, featureSlug, storySlug, data]);

  if (error) return <ErrorState message={error} />;
  if (!data) return <LoadingState />;
  return <ReadyBody data={data} />;
}

function ReadyBody({ data }: { data: FeatureDetail | StoryDocument }) {
  if ("index" in data) {
    const frontmatter = {
      desc: data.index?.desc,
      status: data.index?.status,
      goals: data.index?.goals,
      updatedAt: data.index?.updatedAt,
    };
    return (
      <>
        <DocumentContent markdown={data.index?.content ?? null} />
        <DocumentSidePanel fields={frontmatter} />
      </>
    );
  }
  const frontmatter = {
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
      <DocumentSidePanel fields={frontmatter} />
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
}: {
  fields: Record<string, import("./FrontmatterPanel").FrontmatterValue>;
}) {
  return (
    <div className="w-[260px] shrink-0 border-l border-[rgba(0,0,0,0.08)] bg-[#fafafa]">
      <FrontmatterPanel fields={fields} className="h-full" />
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
            />
          ) : (
            <StoryDocumentBody
              key={`story:${props.projectSlug}:${props.featureSlug}:${props.storySlug}`}
              projectSlug={props.projectSlug}
              featureSlug={props.featureSlug}
              storySlug={props.storySlug}
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
