"use client";

import { useState, useCallback, useRef } from "react";
import { Icon } from "@iconify/react";
import { updateSuggestionFrontmatter } from "../../api/projects";
import { DocumentDialog } from "../markdown/DocumentDialog";
import type { AggregatedSuggestion } from "../../api/projects";

type Suggestion = {
  id: number;
  slug: string;
  featureSlug: string;
  tag: string;
  title: string;
  action: string;
  status?: string;
};

const FALLBACK_SUGGESTIONS: Suggestion[] = [
  {
    id: 0,
    slug: "replace-nps-prompt",
    featureSlug: "sign-up",
    tag: "Sign Up",
    title:
      "Henry Howarth suggest to replace the old NPS prompt with the new 1–5 rating.",
    action: "Swap NPS prompt → 1–5 rating",
  },
  {
    id: 1,
    slug: "add-global-search",
    featureSlug: "nps-prompt",
    tag: "NPS prompt",
    title:
      "Henry Howarth suggest to help user to find the item more quickly.",
    action: "Add global search + filter",
  },
];

const MONA_NOTE = "Add a global search function, and a global filter.";

const TONE_OPTIONS = ["Neutral", "Friendly", "Playful"];

function toSuggestions(api: AggregatedSuggestion[]): Suggestion[] {
  return api.map((s, i) => ({
    id: i,
    slug: s.slug,
    featureSlug: s.featureSlug,
    tag: s.featureTitle,
    title: s.desc ?? s.title,
    action: s.title,
    status: s.status,
  }));
}

function SuggestionCard({
  suggestion,
  dismissed,
  onDismiss,
  onYes,
  onBlocked,
  onPreview,
  yesLoading,
  blockedLoading,
}: {
  suggestion: Suggestion;
  dismissed: boolean;
  onDismiss: () => void;
  onYes: () => void;
  onBlocked: () => void;
  onPreview: () => void;
  yesLoading: boolean;
  blockedLoading: boolean;
}) {
  if (dismissed) return null;
  const resolved = suggestion.status === "accepted" || suggestion.status === "blocked";

  return (
    <div
      className="mx-3 mb-2 p-3 rounded-[12px] flex flex-col gap-2 transition-all duration-200"
      style={{
        background: "#fefdfc",
        border: "1px solid #dbe3ff",
        boxShadow:
          "0px -2px 4px 0px rgba(63,74,78,0.15), 0px -1px 3px 0px rgba(128,142,148,0.2)",
        opacity: resolved ? 0.6 : 1,
      }}
    >
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-1 min-w-0">
          <span
            className="px-2 py-0.5 rounded-[8px] text-[12px] text-[#002557] shrink-0"
            style={{
              background: "white",
              border: "1px solid rgba(0,0,0,0.1)",
              fontFamily: "Poppins, sans-serif",
              fontWeight: 600,
            }}
          >
            {suggestion.tag}
          </span>
          {resolved && (
            <span className="text-[11px] text-[#717182] truncate" style={{ fontFamily: "Poppins, sans-serif" }}>
              {suggestion.status === "accepted" ? "Accepted" : "Blocked"}
            </span>
          )}
        </div>
        <button
          onClick={onDismiss}
          className="hover:opacity-70 transition-opacity shrink-0"
          aria-label="Dismiss suggestion"
        >
          <Icon icon="lucide:x" width={16} height={16} color="#002557" />
        </button>
      </div>

      <button
        onClick={onPreview}
        className="text-left group cursor-pointer"
        aria-label="Preview suggestion details"
      >
        <p
          className="text-[12px] text-[#0a0a0a] group-hover:text-[#002557] transition-colors"
          style={{ fontFamily: "Poppins, sans-serif" }}
        >
          {suggestion.title}
        </p>
      </button>

      <div className="pt-1" style={{ borderTop: "1px dashed #EBC5A8" }}>
        <p
          className="text-[12px] text-[#717182] mb-1"
          style={{ fontFamily: "Poppins, sans-serif" }}
        >
          You may want me to:
        </p>
        <button
          onClick={onPreview}
          className="text-left w-full group cursor-pointer"
          aria-label="Preview action details"
        >
          <p
            className="text-[12px] text-[#0a0a0a] mb-2 group-hover:text-[#002557] transition-colors"
            style={{ fontFamily: "Poppins, sans-serif" }}
          >
            {suggestion.action}
          </p>
        </button>

        {!resolved && (
          <div className="flex gap-1.5">
            <button
              onClick={onYes}
              disabled={yesLoading}
              className="flex items-center gap-1 px-2 rounded-[4px] text-[12px] text-white transition-all duration-150 active:scale-95 disabled:opacity-60 disabled:cursor-not-allowed"
              style={{
                background: "#002557",
                height: 28,
                fontFamily: "Poppins, sans-serif",
                fontWeight: 500,
              }}
            >
              {yesLoading ? (
                <Icon icon="lucide:loader-2" width={12} height={12} className="animate-spin" color="#FF7F26" />
              ) : (
                <Icon icon="lucide:check" width={12} height={12} color="#FF7F26" />
              )}
              Yes
            </button>
            <button
              onClick={onBlocked}
              disabled={blockedLoading}
              className="flex items-center px-2 rounded-[4px] text-[12px] text-[#002557] transition-all duration-150 active:scale-95 disabled:opacity-60 disabled:cursor-not-allowed"
              style={{
                background: "white",
                height: 28,
                border: "1px solid rgba(0,37,87,0.6)",
                fontFamily: "Poppins, sans-serif",
                fontWeight: 500,
              }}
            >
              {blockedLoading ? (
                <Icon icon="lucide:loader-2" width={12} height={12} className="animate-spin" color="#002557" />
              ) : (
                <Icon icon="lucide:ban" width={12} height={12} color="#002557" />
              )}
              Blocked
            </button>
          </div>
        )}
      </div>
    </div>
  );
}

function MonaNoteCard() {
  return (
    <div
      className="mx-3 mb-2 p-3 rounded-[12px] flex flex-col gap-2"
      style={{ background: "#fefdfc", border: "1px solid #dbe3ff" }}
    >
      <p
        className="text-[12px] text-[#717182]"
        style={{ fontFamily: "Poppins, sans-serif" }}
      >
        You may want to:
      </p>
      <p
        className="text-[12px] text-[#0a0a0a]"
        style={{ fontFamily: "Poppins, sans-serif" }}
      >
        {MONA_NOTE}
      </p>
      <div className="flex gap-1.5">
        <button
          className="flex items-center gap-1 px-2 rounded-[4px] text-[12px] text-white"
          style={{
            background: "#002557",
            height: 28,
            fontFamily: "Poppins, sans-serif",
            fontWeight: 500,
          }}
        >
          <Icon icon="lucide:check" width={12} height={12} color="#FF7F26" />
          Yes
        </button>
        <button
          className="flex items-center px-2 rounded-[4px] text-[12px] text-[#002557]"
          style={{
            background: "white",
            height: 28,
            border: "1px solid rgba(0,37,87,0.6)",
            fontFamily: "Poppins, sans-serif",
            fontWeight: 500,
          }}
        >
          Blocked
        </button>
        <button
          className="flex items-center justify-center rounded-[4px]"
          style={{
            background: "white",
            width: 28,
            height: 28,
            border: "1px solid rgba(0,0,0,0.1)",
          }}
        >
          <Icon icon="lucide:more-horizontal" width={16} height={16} color="#002557" />
        </button>
      </div>
    </div>
  );
}

function QuestionCard() {
  return (
    <div
      className="mx-3 mb-3 p-3 rounded-[12px] flex flex-col gap-2"
      style={{ background: "#fefdfc", border: "1px solid #dbe3ff" }}
    >
      <p
        className="text-[12px] text-[#0a0a0a]"
        style={{ fontFamily: "Poppins, sans-serif" }}
      >
        What tone should the UX writing adopt?
      </p>
      <div className="flex gap-1.5 flex-wrap">
        {TONE_OPTIONS.map((opt) => (
          <span
            key={opt}
            className="px-2 py-0.5 rounded-full text-[12px] text-[#0a0a0a] cursor-pointer hover:bg-gray-100"
            style={{
              border: "1px solid rgba(0,0,0,0.15)",
              fontFamily: "Poppins, sans-serif",
            }}
          >
            {opt}
          </span>
        ))}
      </div>
      <input
        className="w-full text-[12px] text-[#717182] rounded-[4px] px-2 outline-none"
        style={{
          height: 28,
          border: "1px solid rgba(0,0,0,0.1)",
          fontFamily: "Poppins, sans-serif",
        }}
        placeholder="Type your answer..."
      />
    </div>
  );
}

function MonkeyAvatar() {
  return (
    <div className="p-3">
      <div
        className="flex items-center justify-center rounded-full cursor-pointer hover:opacity-90"
        style={{ width: 36, height: 36, background: "#002557" }}
      >
        <Icon icon="lucide:bot" width={20} height={20} color="#FF7F26" />
      </div>
    </div>
  );
}

function CollapsedInbox({
  count,
  onToggle,
}: {
  count: number;
  onToggle: () => void;
}) {
  return (
    <div
      className="flex items-center shrink-0 px-4"
      style={{
        height: 40,
        background: "#dfe3e8",
        borderBottom: "1px solid rgba(0,0,0,0.1)",
      }}
    >
      <div className="flex items-center gap-1">
        <Icon icon="lucide:inbox" width={16} height={16} color="#1C1B1F" />
        <span
          className="text-[14px] text-[#0a0a0a]"
          style={{ fontFamily: "Inter, sans-serif" }}
        >
          Inbox
        </span>
        {count > 0 && (
          <span
            className="flex items-center justify-center rounded-[8px] px-2 text-[12px] text-[#030213]"
            style={{
              background: "#eceef2",
              height: 22,
              fontFamily: "Inter, sans-serif",
              fontWeight: 500,
            }}
          >
            {count}
          </span>
        )}
      </div>
      <div className="flex-1" />
      <button
        onClick={onToggle}
        className="flex items-center justify-center rounded-[4px] hover:bg-black/5 transition-colors"
        style={{ width: 24, height: 24 }}
        aria-label="Expand inbox"
      >
        <Icon icon="lucide:chevron-down" width={16} height={16} color="#1C1B1F" />
      </button>
    </div>
  );
}

type SuggestionLoading = {
  yes: boolean;
  blocked: boolean;
};

function ExpandedInbox({
  suggestions: rawSuggestions,
  projectSlug,
  suggestionsLoading,
  onToggle,
}: {
  suggestions: Suggestion[];
  projectSlug: string;
  suggestionsLoading: boolean;
  onToggle: () => void;
}) {
  const [dismissed, setDismissed] = useState<Set<number>>(new Set());
  const [loading, setLoading] = useState<Map<number, SuggestionLoading>>(new Map());
  const [error, setError] = useState<string | null>(null);
  const errorTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const [previewSuggestion, setPreviewSuggestion] = useState<Suggestion | null>(null);

  const showError = useCallback((msg: string) => {
    setError(msg);
    if (errorTimerRef.current) clearTimeout(errorTimerRef.current);
    errorTimerRef.current = setTimeout(() => setError(null), 3000);
  }, []);

  const dismiss = useCallback((id: number) => {
    setDismissed((prev) => {
      const next = new Set(prev);
      next.add(id);
      return next;
    });
  }, []);

  const updateStatus = useCallback(
    async (suggestion: Suggestion, status: string, loadingKey: "yes" | "blocked") => {
      const id = suggestion.id;
      setLoading((prev) => {
        const next = new Map(prev);
        next.set(id, { ...(next.get(id) ?? { yes: false, blocked: false }), [loadingKey]: true });
        return next;
      });

      try {
        await updateSuggestionFrontmatter(
          projectSlug,
          suggestion.featureSlug,
          suggestion.slug,
          { status },
        );
        dismiss(id);
      } catch {
        showError(`Failed to mark as ${status}`);
      } finally {
        setLoading((prev) => {
          const next = new Map(prev);
          next.delete(id);
          return next;
        });
      }
    },
    [dismiss, showError, projectSlug],
  );

  const suggestions = rawSuggestions;

  return (
    <div
      className="flex h-full flex-col shrink-0 overflow-y-auto"
      style={{
        background: "#dfe3e8",
        height: "100%",
      }}
    >
      <div
        className="flex items-center justify-between px-4 shrink-0"
        style={{ height: 40, borderBottom: "1px solid rgba(0,0,0,0.1)" }}
      >
        <div className="flex items-center gap-1">
          <Icon icon="lucide:inbox" width={16} height={16} color="#1C1B1F" />
          <span
            className="text-[14px] text-[#0a0a0a]"
            style={{ fontFamily: "Inter, sans-serif" }}
          >
            Inbox
          </span>
          {suggestions.length > 0 && (
            <span
              className="flex items-center justify-center rounded-[8px] px-2 text-[12px] text-[#030213]"
              style={{
                background: "#eceef2",
                height: 22,
                fontFamily: "Inter, sans-serif",
                fontWeight: 500,
              }}
            >
              {suggestions.length}
            </span>
          )}
        </div>
        <button
          onClick={onToggle}
          className="flex items-center justify-center rounded-[4px] hover:bg-black/5 transition-colors"
          style={{ width: 24, height: 24 }}
          aria-label="Collapse inbox"
        >
          <Icon icon="lucide:chevron-up" width={16} height={16} color="#1C1B1F" />
        </button>
      </div>

      {error && (
        <div
          className="mx-3 mt-2 px-3 py-2 rounded-[8px] text-[11px] text-white animate-in fade-in slide-in-from-top-1 duration-200"
          style={{ background: "#d4183d", fontFamily: "Poppins, sans-serif" }}
        >
          {error}
        </div>
      )}

      <div className="px-4 pt-4 pb-1 shrink-0">
        <div className="flex items-center gap-1.5">
          <span
            className="text-[12px] text-[#0a0a0a]"
            style={{ fontFamily: "Poppins, sans-serif", fontWeight: 500 }}
          >
            Suggestions
          </span>
          {suggestions.length > 0 && (
            <span
              className="text-[12px] text-[#717182]"
              style={{ fontFamily: "Poppins, sans-serif" }}
            >
              · {suggestions.length}
            </span>
          )}
        </div>
      </div>

      {suggestionsLoading ? (
        <div className="flex items-center justify-center gap-2 py-6 text-[12px] text-[#717182]" style={{ fontFamily: "Poppins, sans-serif" }}>
          <Icon icon="lucide:loader-2" width={12} height={12} className="animate-spin" />
          Loading…
        </div>
      ) : suggestions.length === 0 ? (
        <div className="px-6 py-6 text-[12px] text-[#717182] text-center" style={{ fontFamily: "Poppins, sans-serif" }}>
          No suggestions yet
        </div>
      ) : (
        suggestions.map((s) => {
          const l = loading.get(s.id);
          return (
            <SuggestionCard
              key={s.id}
              suggestion={s}
              dismissed={dismissed.has(s.id)}
              onDismiss={() => {
                if (s.featureSlug) {
                  updateStatus(s, "dismissed", "yes");
                } else {
                  dismiss(s.id);
                }
              }}
              onYes={() => {
                if (s.featureSlug) {
                  updateStatus(s, "accepted", "yes");
                } else {
                  dismiss(s.id);
                }
              }}
              onBlocked={() => {
                if (s.featureSlug) {
                  updateStatus(s, "blocked", "blocked");
                } else {
                  dismiss(s.id);
                }
              }}
              onPreview={() => s.featureSlug ? setPreviewSuggestion(s) : null}
              yesLoading={l?.yes ?? false}
              blockedLoading={l?.blocked ?? false}
            />
          );
        })
      )}

      <MonaNoteCard />

      <div className="px-4 pt-2 pb-1 shrink-0">
        <div className="flex items-center gap-1.5">
          <span
            className="text-[12px] text-[#0a0a0a]"
            style={{ fontFamily: "Poppins, sans-serif", fontWeight: 500 }}
          >
            Questions
          </span>
          <span
            className="text-[12px] text-[#717182]"
            style={{ fontFamily: "Poppins, sans-serif" }}
          >
            · 4
          </span>
        </div>
      </div>

      <QuestionCard />

      <div className="flex-1" />
      <MonkeyAvatar />

      {previewSuggestion && (
        <DocumentDialog
          kind="suggestion"
          projectSlug={projectSlug}
          featureSlug={previewSuggestion.featureSlug}
          suggestionSlug={previewSuggestion.slug}
          title={previewSuggestion.action}
          open
          onOpenChange={(o) => {
            if (!o) setPreviewSuggestion(null);
          }}
        />
      )}
    </div>
  );
}

type InboxPanelProps = {
  collapsed: boolean;
  onToggle: () => void;
  projectSlug: string;
  suggestions: AggregatedSuggestion[];
  suggestionsLoading?: boolean;
};

export function InboxPanel({
  collapsed,
  onToggle,
  projectSlug,
  suggestions,
  suggestionsLoading = true,
}: InboxPanelProps) {
  if (collapsed) return <CollapsedInbox count={suggestions.length} onToggle={onToggle} />;
  return (
    <ExpandedInbox
      key={projectSlug}
      projectSlug={projectSlug}
      suggestions={toSuggestions(suggestions)}
      suggestionsLoading={suggestionsLoading}
      onToggle={onToggle}
    />
  );
}
