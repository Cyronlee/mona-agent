"use client";

import { useChat } from "@ai-sdk/react";
import { DefaultChatTransport, type UIMessage } from "ai";
import * as Popover from "@radix-ui/react-popover";
import { Command, CommandEmpty, CommandInput, CommandItem, CommandList } from "cmdk";
import { Icon } from "@iconify/react";
import { useCallback, useEffect, useId, useMemo, useRef, useState } from "react";
import {
  deleteSession,
  getSession,
  listSessions,
  type ChatMessage,
  type ChatSession,
} from "../../api/chat";
import { MarkdownViewer } from "../markdown/MarkdownViewer";

type ChatPanelProps = {
  projectSlug?: string;
  collapsed?: boolean;
  onToggleExpand?: () => void;
  autoPrompt?: string | null;
};

type PersistedToolCall = {
  toolCallId: string;
  toolName: string;
  args: unknown;
  result: unknown;
  providerMetadata?: unknown;
};

type ChatMessageMetadata = {
  sessionId?: string;
  projectSlug?: string;
};

type ChatUIMessage = UIMessage<ChatMessageMetadata>;

function persistedToUIMessages(messages: ChatMessage[]): ChatUIMessage[] {
  return messages.map((m) => {
    if (m.role === "user") {
      return {
        id: m.id,
        role: "user",
        parts: [{ type: "text", text: m.content }],
      };
    }
    const parts: ChatUIMessage["parts"] = [];
    if (m.content) {
      parts.push({ type: "text", text: m.content });
    }
    if (m.toolCallsJson) {
      try {
        const tcs = JSON.parse(m.toolCallsJson) as PersistedToolCall[];
        for (const tc of tcs) {
          parts.push({
            type: "dynamic-tool",
            toolName: tc.toolName,
            toolCallId: tc.toolCallId,
            state: "output-available",
            input: tc.args,
            output: tc.result,
            ...(tc.providerMetadata
              ? { providerMetadata: tc.providerMetadata as never }
              : {}),
          });
        }
      } catch {
        // ignore malformed tool call payload
      }
    }
    return { id: m.id, role: "assistant", parts };
  });
}

function formatRelativeTime(iso: string): string {
  const then = new Date(iso).getTime();
  if (Number.isNaN(then)) return "";
  const now = Date.now();
  const diffSec = Math.max(0, Math.floor((now - then) / 1000));
  if (diffSec < 45) return "just now";
  if (diffSec < 90) return "1m ago";
  const diffMin = Math.floor(diffSec / 60);
  if (diffMin < 60) return `${diffMin}m ago`;
  const diffHour = Math.floor(diffMin / 60);
  if (diffHour < 24) return `${diffHour}h ago`;
  const diffDay = Math.floor(diffHour / 24);
  if (diffDay < 7) return `${diffDay}d ago`;
  return new Date(iso).toLocaleDateString();
}

export function ChatPanel({
  projectSlug = "acme-feedback",
  collapsed = false,
  onToggleExpand,
  autoPrompt = null,
}: ChatPanelProps) {
  const chatInstanceId = useId();
  const [input, setInput] = useState("");
  const [sessions, setSessions] = useState<ChatSession[]>([]);
  // The id the user has explicitly selected from the dropdown. Null means
  // we're in "New conversation" mode (or, after the first message, the
  // backend-stamped id is in effect — see `derivedSessionId`).
  const [explicitSessionId, setExplicitSessionId] = useState<string | null>(null);
  const [activeTitle, setActiveTitle] = useState<string>("New conversation");
  const [popoverOpen, setPopoverOpen] = useState(false);
  const [search, setSearch] = useState("");
  const [loadingSessionId, setLoadingSessionId] = useState<string | null>(null);
  const [pendingDeleteId, setPendingDeleteId] = useState<string | null>(null);
  const [sessionsLoaded, setSessionsLoaded] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const autoPromptSentRef = useRef<Set<string>>(new Set());

  // Ref mirror of the active session id. The transport's body resolver
  // (captured in a useMemo below) reads from this ref at request time so
  // it always sees the latest value without forcing the chat to recreate.
  const activeSessionIdRef = useRef<string | null>(null);

  const {
    messages,
    sendMessage,
    status,
    stop,
    error,
    setMessages,
  } = useChat<ChatUIMessage>({
    id: chatInstanceId,
    transport: useMemo(
      () =>
        // The body resolver runs at request time (not during render), so
        // the closure can safely read the ref.
        // eslint-disable-next-line react-hooks/refs
        new DefaultChatTransport({
          api: `/api/projects/${projectSlug}/chat`,
          body: () => ({ sessionId: activeSessionIdRef.current ?? undefined }),
        }),
      [projectSlug],
    ),
  });

  // After the first message of a new conversation the backend creates a
  // session and stamps the assistant response's metadata with its id. Derive
  // the effective active id from the message history so the new conversation
  // automatically becomes "active" without recreating the chat.
  // NOTE: messageMetadata from the stream is attached to the assistant message
  // (not the user message), so we search all roles.
  const derivedSessionId = useMemo<string | null>(() => {
    for (let i = messages.length - 1; i >= 0; i--) {
      const sessionId = messages[i].metadata?.sessionId;
      if (sessionId) return sessionId;
    }
    return null;
  }, [messages]);
  const activeSessionId = explicitSessionId ?? derivedSessionId;

  // Keep the ref in sync with the effective active session id. Writing to
  // a ref is the canonical "push state to a non-React subscriber" pattern
  // and does not trigger a re-render.
  useEffect(() => {
    activeSessionIdRef.current = activeSessionId;
  }, [activeSessionId]);

  const isStreaming = status === "submitted" || status === "streaming";

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, status]);

  // Track the most recent in-flight load request so out-of-order responses
  // don't clobber a newer selection.
  const loadRequestRef = useRef(0);

  const isFirstStatusRef = useRef(true);
  useEffect(() => {
    // Load sessions on initial mount, then auto-select the most recent one
    // if it exists; otherwise start with a fresh conversation.
    let cancelled = false;
    (async () => {
      try {
        const list = await listSessions(projectSlug);
        if (cancelled) return;
        setSessions(list);
        if (list.length > 0) {
          const latest = list[0];
          const requestId = ++loadRequestRef.current;
          setLoadingSessionId(latest.id);
          try {
            const detail = await getSession(projectSlug, latest.id);
            if (loadRequestRef.current !== requestId) return;
            setMessages(persistedToUIMessages(detail.messages));
            setExplicitSessionId(latest.id);
            setActiveTitle(detail.title);
          } catch (err) {
            if (loadRequestRef.current === requestId) {
              console.error("Failed to load latest session", err);
            }
          } finally {
            if (loadRequestRef.current === requestId) {
              setLoadingSessionId(null);
            }
          }
        }
      } catch (err) {
        if (!cancelled) console.error("Failed to load sessions on mount", err);
      } finally {
        if (!cancelled) setSessionsLoaded(true);
      }
    })();
    return () => {
      cancelled = true;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [projectSlug]);

  useEffect(() => {
    if (isFirstStatusRef.current) {
      isFirstStatusRef.current = false;
      return;
    }
    if (isStreaming) return;
    let cancelled = false;
    (async () => {
      try {
        const list = await listSessions(projectSlug);
        if (cancelled) return;
        setSessions(list);
        // After the server has finalized the turn it may have rewritten the
        // session title (e.g. first turn of a new conversation). Reflect the
        // canonical title in the trigger label.
        const currentActive = activeSessionIdRef.current;
        if (currentActive) {
          const found = list.find((s) => s.id === currentActive);
          if (found) setActiveTitle(found.title);
        }
      } catch (err) {
        if (!cancelled) console.error("Failed to refresh sessions", err);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [isStreaming, projectSlug]);

  useEffect(() => {
    if (!autoPrompt) return;
    if (collapsed) return;
    if (!sessionsLoaded) return;
    if (sessions.length > 0) return;
    if (messages.length > 0) return;
    if (isStreaming) return;

    const marker = `${projectSlug}:${autoPrompt}`;
    if (autoPromptSentRef.current.has(marker)) return;

    autoPromptSentRef.current.add(marker);
    sendMessage({ text: autoPrompt });
  }, [
    autoPrompt,
    collapsed,
    isStreaming,
    messages.length,
    projectSlug,
    sendMessage,
    sessions.length,
    sessionsLoaded,
  ]);

  const handleNewSession = useCallback(() => {
    setMessages([]);
    setExplicitSessionId(null);
    setActiveTitle("New conversation");
    setPopoverOpen(false);
    setSearch("");
  }, [setMessages]);

  const handleSelectSession = useCallback(
    async (sessionId: string) => {
      if (sessionId === explicitSessionId) {
        setPopoverOpen(false);
        return;
      }
      const requestId = ++loadRequestRef.current;
      setLoadingSessionId(sessionId);
      try {
        const detail = await getSession(projectSlug, sessionId);
        if (loadRequestRef.current !== requestId) return;
        setMessages(persistedToUIMessages(detail.messages));
        setExplicitSessionId(sessionId);
        setActiveTitle(detail.title);
        setPopoverOpen(false);
        setSearch("");
      } catch (err) {
        if (loadRequestRef.current !== requestId) return;
        console.error("Failed to load session", err);
      } finally {
        if (loadRequestRef.current === requestId) {
          setLoadingSessionId(null);
        }
      }
    },
    [explicitSessionId, projectSlug, setMessages],
  );

  const handleDeleteSession = useCallback(
    async (sessionId: string) => {
      if (pendingDeleteId) return;
      setPendingDeleteId(sessionId);
      try {
        await deleteSession(projectSlug, sessionId);
        setSessions((prev) => prev.filter((s) => s.id !== sessionId));
        if (sessionId === activeSessionId) {
          handleNewSession();
        }
      } catch (err) {
        console.error("Failed to delete session", err);
      } finally {
        setPendingDeleteId(null);
      }
    },
    [activeSessionId, handleNewSession, pendingDeleteId, projectSlug],
  );

  const submit = () => {
    const text = input.trim();
    if (!text || isStreaming) return;
    setInput("");
    sendMessage({ text });
  };

  const handleFormSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    submit();
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.nativeEvent.isComposing) return;
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      submit();
    }
  };

  const filteredSessions = useMemo(() => {
    const q = search.trim().toLowerCase();
    if (!q) return sessions;
    return sessions.filter((s) => s.title.toLowerCase().includes(q));
  }, [sessions, search]);

  const triggerLabel = activeSessionId ? activeTitle : "Chat with Mona";

  if (collapsed) {
    return (
      <div
        className="flex items-center shrink-0 px-4"
        style={{
          height: 40,
          background: "white",
        }}
      >
        <div className="flex items-center gap-1">
          <Icon icon="lucide:sparkles" width={16} height={16} color="#717182" />
          <span
            className="text-[14px] text-[#0a0a0a]"
            style={{ fontFamily: "Inter, sans-serif" }}
          >
            Chat
          </span>
        </div>
        <div className="flex-1" />
        <button
          onClick={onToggleExpand}
          className="flex items-center justify-center rounded-[4px] hover:bg-black/5 transition-colors"
          style={{ width: 24, height: 24 }}
          aria-label="Expand chat"
        >
          <Icon icon="lucide:chevron-up" width={16} height={16} color="#1C1B1F" />
        </button>
      </div>
    );
  }

  return (
    <div className="flex h-full flex-col">
      <div
        className="flex items-center justify-between shrink-0 px-4"
        style={{
          height: 40,
          background: "white",
        }}
      >
        <div className="flex items-center gap-1">
          <Icon icon="lucide:sparkles" width={16} height={16} color="#717182" />
          <span
            className="text-[14px] text-[#0a0a0a]"
            style={{ fontFamily: "Inter, sans-serif" }}
          >
            Chat
          </span>
        </div>
        <button
          onClick={onToggleExpand}
          className="flex items-center justify-center rounded-[4px] hover:bg-black/5 transition-colors"
          style={{ width: 24, height: 24 }}
          aria-label="Collapse chat"
        >
          <Icon icon="lucide:chevron-down" width={16} height={16} color="#1C1B1F" />
        </button>
      </div>
      <div
        className="flex items-center justify-between shrink-0 pl-3 pr-2"
        style={{
          height: 40,
          borderBottom: "1px solid rgba(0,0,0,0.06)",
        }}
      >
        <Popover.Root open={popoverOpen} onOpenChange={setPopoverOpen}>
          <Popover.Trigger asChild>
            <button
              type="button"
              className="group flex items-center gap-1.5 rounded-[6px] px-1.5 py-1 text-left transition-colors hover:bg-gray-50 focus:outline-none focus-visible:ring-2 focus-visible:ring-[#1e2340]/30"
              aria-haspopup="listbox"
              aria-expanded={popoverOpen}
              aria-label="Select conversation"
            >
              <span
                className="rounded-full shrink-0"
                style={{
                  width: 6,
                  height: 6,
                  background: isStreaming ? "#facc15" : "#4ade80",
                }}
              />
              <span
                className="truncate text-[12px] text-[#0a0a0a] max-w-[180px]"
                style={{ fontFamily: "Poppins, sans-serif", fontWeight: 600 }}
                title={triggerLabel}
              >
                {triggerLabel}
              </span>
              <Icon
                icon="lucide:chevrons-up-down"
                width={12}
                height={12}
                color="#717182"
              />
            </button>
          </Popover.Trigger>
          <Popover.Portal>
            <Popover.Content
              align="start"
              sideOffset={6}
              className="z-50 outline-none"
              style={{
                width: 320,
                background: "white",
                border: "1px solid rgba(0,0,0,0.08)",
                borderRadius: 12,
                boxShadow:
                  "0 8px 24px rgba(0,0,0,0.10), 0 2px 6px rgba(0,0,0,0.06)",
                overflow: "hidden",
              }}
            >
              <Command
                label="Conversations"
                shouldFilter={false}
                className="flex flex-col"
              >
                <div
                  className="flex items-center gap-2 px-3"
                  style={{
                    height: 40,
                    borderBottom: "1px solid rgba(0,0,0,0.06)",
                  }}
                >
                  <Icon
                    icon="lucide:search"
                    width={14}
                    height={14}
                    color="#717182"
                  />
                  <CommandInput
                    value={search}
                    onValueChange={setSearch}
                    placeholder="Search conversations…"
                    className="flex-1 bg-transparent text-[12px] text-[#0a0a0a] placeholder:text-[#717182] outline-none"
                    style={{ fontFamily: "Inter, sans-serif" }}
                  />
                  {search && (
                    <button
                      type="button"
                      onClick={() => setSearch("")}
                      className="flex items-center justify-center rounded-[4px] hover:bg-gray-100"
                      aria-label="Clear search"
                    >
                      <Icon
                        icon="lucide:x"
                        width={12}
                        height={12}
                        color="#717182"
                      />
                    </button>
                  )}
                </div>
                <CommandList
                  className="overflow-y-auto py-1"
                  style={{ maxHeight: 320 }}
                >
                  <SessionRow
                    label="New conversation"
                    icon="lucide:plus"
                    onSelect={handleNewSession}
                    active={!activeSessionId}
                  />
                  <div
                    style={{
                      height: 1,
                      background: "rgba(0,0,0,0.06)",
                      margin: "4px 6px",
                    }}
                  />
                  {filteredSessions.length === 0 ? (
                    <CommandEmpty className="px-3 py-6 text-center text-[12px] text-[#717182]">
                      {search ? "No matches" : "No conversations yet"}
                    </CommandEmpty>
                  ) : (
                    filteredSessions.map((s) => (
                      <SessionRow
                        key={s.id}
                        session={s}
                        active={s.id === activeSessionId}
                        loading={loadingSessionId === s.id}
                        pendingDelete={pendingDeleteId === s.id}
                        onSelect={() => handleSelectSession(s.id)}
                        onDelete={() => handleDeleteSession(s.id)}
                      />
                    ))
                  )}
                </CommandList>
              </Command>
            </Popover.Content>
          </Popover.Portal>
        </Popover.Root>
        <div className="flex items-center gap-1">
          <button
            onClick={handleNewSession}
            className="flex items-center justify-center rounded-[8px] hover:bg-gray-50 text-[#717182] hover:text-[#0a0a0a] text-[11px] px-2 h-6 transition-colors"
            style={{ fontFamily: "Inter, sans-serif", fontWeight: 500 }}
            title="Start a new conversation"
          >
            <Icon icon="lucide:plus" width={12} height={12} className="mr-1" />
            New
          </button>
        </div>
      </div>

      <div
        className="flex-1 overflow-y-auto px-3 py-3 flex flex-col gap-3"
        style={{ background: "#fcfcfd" }}
      >
        {messages.length === 0 && (
          <div className="flex flex-col items-center justify-center flex-1 text-center gap-2 py-8">
            <p
              className="text-[13px] text-[#0a0a0a]"
              style={{ fontFamily: "Poppins, sans-serif", fontWeight: 500 }}
            >
              Ask Mona to take care of it.
            </p>
            <p
              className="text-[11px] text-[#717182] leading-relaxed max-w-[260px]"
              style={{ fontFamily: "Inter, sans-serif" }}
            >
              Mona can read, write, or edit project files and run shell commands
              in the workspace.
            </p>
          </div>
        )}
        {messages.map((message) => (
          <MessageBubble key={message.id} message={message} />
        ))}
        {isStreaming && messages[messages.length - 1]?.role === "user" && (
          <div className="flex items-center gap-2 text-[11px] text-[#717182] pl-1">
            <span className="flex gap-0.5">
              <span
                className="rounded-full bg-[#717182] animate-bounce"
                style={{ width: 4, height: 4, animationDelay: "0ms" }}
              />
              <span
                className="rounded-full bg-[#717182] animate-bounce"
                style={{ width: 4, height: 4, animationDelay: "150ms" }}
              />
              <span
                className="rounded-full bg-[#717182] animate-bounce"
                style={{ width: 4, height: 4, animationDelay: "300ms" }}
              />
            </span>
            <span style={{ fontFamily: "Inter, sans-serif" }}>
              Mona is thinking…
            </span>
          </div>
        )}
        {error && (
          <div
            className="rounded-[10px] px-3 py-2 text-[11px]"
            style={{
              background: "#fef2f2",
              border: "1px solid #fecaca",
              color: "#b91c1c",
              fontFamily: "Inter, sans-serif",
            }}
          >
            {error.message}
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>

      <form
        onSubmit={handleFormSubmit}
        className="shrink-0 p-3"
        style={{
          borderTop: "1px solid rgba(0,0,0,0.06)",
          background: "white",
        }}
      >
        <div
          className="flex flex-col gap-2 rounded-[12px] p-2"
          style={{
            border: "1px solid rgba(0,0,0,0.08)",
            background: "#f8fafc",
          }}
        >
          <textarea
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Ask Mona to read, write, or run something…"
            rows={2}
            disabled={isStreaming}
            className="w-full resize-none bg-transparent text-[12px] text-[#0a0a0a] placeholder:text-[#717182] outline-none px-1 disabled:opacity-60"
            style={{
              fontFamily: "Inter, sans-serif",
              minHeight: 36,
              maxHeight: 140,
            }}
          />
          <div className="flex items-center justify-end gap-2">
            {isStreaming ? (
              <button
                type="button"
                onClick={() => stop()}
                className="flex items-center gap-1 px-3 rounded-[8px] text-white text-[11px] transition-colors hover:opacity-90"
                style={{
                  height: 26,
                  background: "#0a0a0a",
                  fontFamily: "Poppins, sans-serif",
                  fontWeight: 500,
                }}
              >
                Stop
              </button>
            ) : (
              <button
                type="submit"
                disabled={!input.trim()}
                className="flex items-center gap-1 px-3 rounded-[8px] text-white text-[11px] transition-opacity disabled:opacity-40"
                style={{
                  height: 26,
                  background: "#1e2340",
                  fontFamily: "Poppins, sans-serif",
                  fontWeight: 500,
                  cursor: input.trim() ? "pointer" : "not-allowed",
                }}
              >
                Send
              </button>
            )}
          </div>
        </div>
      </form>
    </div>
  );
}

type SessionRowProps = {
  label?: string;
  icon?: string;
  session?: ChatSession;
  active: boolean;
  loading?: boolean;
  pendingDelete?: boolean;
  onSelect: () => void;
  onDelete?: () => void;
};

function SessionRow({
  label,
  icon,
  session,
  active,
  loading,
  pendingDelete,
  onSelect,
  onDelete,
}: SessionRowProps) {
  const title = label ?? session?.title ?? "Untitled";
  const subtitle = session ? formatRelativeTime(session.updatedAt) : "";
  return (
    <CommandItem
      value={session?.id ?? label ?? "new"}
      onSelect={onSelect}
      className="group relative mx-1 flex items-center gap-2 rounded-[6px] px-2 py-1.5 cursor-pointer data-[selected=true]:bg-[#f1f5f9] data-[selected=true]:outline-none"
      style={{
        height: 40,
        fontFamily: "Inter, sans-serif",
      }}
    >
      {loading ? (
        <Icon
          icon="lucide:loader-circle"
          width={14}
          height={14}
          color="#717182"
          className="animate-spin shrink-0"
        />
      ) : icon ? (
        <Icon
          icon={icon}
          width={14}
          height={14}
          color={active ? "#1e2340" : "#0a0a0a"}
          className="shrink-0"
        />
      ) : (
        <Icon
          icon="lucide:message-square"
          width={14}
          height={14}
          color={active ? "#1e2340" : "#717182"}
          className="shrink-0"
        />
      )}
      <div className="flex min-w-0 flex-1 flex-col">
        <span
          className="truncate text-[12px]"
          style={{
            color: "#0a0a0a",
            fontWeight: active ? 600 : 400,
          }}
        >
          {title}
        </span>
        {subtitle && (
          <span
            className="truncate text-[10px] text-[#717182]"
            style={{ fontFamily: "Inter, sans-serif" }}
          >
            {subtitle}
          </span>
        )}
      </div>
      {active && !icon && (
        <Icon
          icon="lucide:check"
          width={12}
          height={12}
          color="#1e2340"
          className="shrink-0"
        />
      )}
      {onDelete && !loading && (
        <button
          type="button"
          onClick={(e) => {
            e.preventDefault();
            e.stopPropagation();
            onDelete();
          }}
          disabled={pendingDelete}
          aria-label={`Delete conversation ${title}`}
          className="ml-1 flex h-5 w-5 items-center justify-center rounded-[4px] text-[#717182] opacity-0 transition-opacity hover:bg-red-50 hover:text-red-600 group-hover:opacity-100 data-[disabled=true]:opacity-50 data-[disabled=true]:cursor-not-allowed"
          data-disabled={pendingDelete ? "true" : "false"}
        >
          {pendingDelete ? (
            <Icon
              icon="lucide:loader-circle"
              width={11}
              height={11}
              className="animate-spin"
            />
          ) : (
            <Icon icon="lucide:x" width={11} height={11} />
          )}
        </button>
      )}
    </CommandItem>
  );
}

type BubbleMessage = {
  id: string;
  role: "user" | "assistant" | "system";
  parts: Array<Record<string, unknown>>;
};

function MessageBubble({ message }: { message: BubbleMessage }) {
  const isUser = message.role === "user";
  if (!isUser) {
    return (
      <div className="text-[12px] leading-relaxed">
        {message.parts.map((part, i) => (
          <MessagePart key={i} part={part} isAssistant />
        ))}
      </div>
    );
  }
  return (
    <div className="flex items-end self-end">
      <div
        className="rounded-[12px] px-3 py-2 text-[12px] leading-relaxed"
        style={{
          background: "#1e2340",
          color: "white",
          fontFamily: "Inter, sans-serif",
        }}
      >
        {message.parts.map((part, i) => (
          <MessagePart key={i} part={part} />
        ))}
      </div>
    </div>
  );
}

function MessagePart({ part, isAssistant }: { part: Record<string, unknown>; isAssistant?: boolean }) {
  const type = part.type as string;

  if (type === "text") {
    const text = (part.text as string | undefined) ?? "";
    if (!text) return null;
    if (isAssistant) {
      return <MarkdownViewer markdown={text} />;
    }
    return <span className="whitespace-pre-wrap break-words">{text}</span>;
  }

  if (type === "reasoning") {
    const text = (part.text as string | undefined) ?? "";
    return (
      <details className="mt-2 w-fit text-[11px] rounded-[8px] bg-white border border-[#e2e8f0] shadow-sm transition-all group overflow-hidden">
        <summary className="cursor-pointer flex items-center gap-1.5 px-3 py-2 text-[#475569] hover:bg-slate-50 transition-colors list-none select-none outline-none [&::-webkit-details-marker]:hidden">
          <Icon icon="lucide:brain-circuit" width={12} height={12} className="text-[#8b5cf6]" />
          <span className="font-medium text-[10px] text-[#0f172a]">Reasoning</span>
          <Icon icon="lucide:chevron-right" width={12} height={12} className="ml-auto opacity-50 transition-transform group-open:rotate-90" />
        </summary>
        <div
          className="border-t border-[#e2e8f0] bg-[#f8fafc] px-3 py-2 whitespace-pre-wrap break-words italic text-[11px] max-h-[250px] overflow-y-auto"
          style={{ color: "#475569", fontFamily: "Inter, sans-serif" }}
        >
          {text}
        </div>
      </details>
    );
  }

  if (type === "step-start") {
    return null;
  }

  if (
    type === "dynamic-tool" ||
    (typeof type === "string" && type.startsWith("tool-"))
  ) {
    const toolName =
      type === "dynamic-tool"
        ? ((part.toolName as string | undefined) ?? "tool")
        : type.replace("tool-", "");
    const state = part.state as string | undefined;
    const input = part.input;
    const output = part.output;
    const errorText = part.errorText as string | undefined;
    const isInputStreaming = state === "input-streaming";
    const isOutputAvailable = state === "output-available";
    const isOutputError = state === "output-error";
    return (
      <details
        className="mt-2 w-fit text-[11px] rounded-[8px] overflow-hidden bg-white border border-[#e2e8f0] shadow-sm transition-all group"
        style={{ fontFamily: "Inter, sans-serif" }}
      >
        <summary className="cursor-pointer flex items-center gap-1.5 px-3 py-2 text-[#475569] hover:bg-slate-50 transition-colors list-none select-none outline-none [&::-webkit-details-marker]:hidden">
          {isInputStreaming ? (
            <Icon icon="lucide:loader-circle" width={12} height={12} className="animate-spin text-[#3b82f6]" />
          ) : isOutputError ? (
            <Icon icon="lucide:x-circle" width={12} height={12} className="text-[#ef4444]" />
          ) : isOutputAvailable ? (
            <Icon icon="lucide:check-circle" width={12} height={12} className="text-[#10b981]" />
          ) : (
            <Icon icon="lucide:wrench" width={12} height={12} className="text-[#64748b]" />
          )}
          <span className="font-mono text-[10px] font-medium text-[#0f172a]">{toolName}</span>
          <Icon icon="lucide:chevron-right" width={12} height={12} className="ml-auto opacity-50 transition-transform group-open:rotate-90" />
        </summary>
        <div className="border-t border-[#e2e8f0] bg-[#f8fafc] px-3 py-2 grid grid-cols-[auto_1fr] gap-x-3 gap-y-2 text-[10px]">
          <span className="text-[#64748b] font-medium uppercase tracking-wider text-[9px] mt-0.5">Input</span>
          <pre
            className="whitespace-pre-wrap break-words text-[#0f172a] overflow-x-auto"
            style={{ fontFamily: "ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace" }}
          >
            {input === undefined ? "" : JSON.stringify(input, null, 2)}
          </pre>
          {(isOutputAvailable || isOutputError) && (
            <>
              <span className="text-[#64748b] font-medium uppercase tracking-wider text-[9px] mt-0.5">
                {isOutputError ? "Error" : "Output"}
              </span>
              <pre
                className="whitespace-pre-wrap break-words text-[#0f172a] overflow-x-auto max-h-[300px] overflow-y-auto"
                style={{
                  fontFamily: "ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace",
                }}
              >
                {isOutputError
                  ? (errorText ?? "")
                  : output === undefined
                    ? ""
                    : JSON.stringify(output, null, 2)}
              </pre>
            </>
          )}
        </div>
      </details>
    );
  }

  return null;
}
