"use client";

import { useChat } from "@ai-sdk/react";
import { DefaultChatTransport } from "ai";
import { useEffect, useRef, useState } from "react";

type ChatPanelProps = {
  projectSlug?: string;
};

function newChatKey() {
  return `chat-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
}

export function ChatPanel({ projectSlug = "acme-feedback" }: ChatPanelProps) {
  const [chatKey, setChatKey] = useState(() => newChatKey());
  const [input, setInput] = useState("");
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const { messages, sendMessage, status, stop, error, setMessages } = useChat({
    id: chatKey,
    transport: new DefaultChatTransport({
      api: `/api/projects/${projectSlug}/chat`,
    }),
  });

  const isStreaming = status === "submitted" || status === "streaming";

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, status]);

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
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      submit();
    }
  };

  const handleNewSession = () => {
    setMessages([]);
    setChatKey(newChatKey());
  };

  return (
    <div className="flex h-full flex-col">
      <div
        className="flex items-center justify-between shrink-0 pl-4 pr-3"
        style={{
          height: 40,
          borderBottom: "1px solid rgba(0,0,0,0.06)",
        }}
      >
        <div className="flex items-center gap-2">
          <span
            className="rounded-full"
            style={{
              width: 6,
              height: 6,
              background: isStreaming ? "#facc15" : "#4ade80",
            }}
          />
          <span
            className="text-[12px] text-[#0a0a0a]"
            style={{ fontFamily: "Poppins, sans-serif", fontWeight: 600 }}
          >
            Chat with Mona
          </span>
        </div>
        <button
          onClick={handleNewSession}
          className="flex items-center justify-center rounded-[8px] hover:bg-gray-50 text-[#717182] hover:text-[#0a0a0a] text-[11px] px-2 h-6 transition-colors"
          style={{ fontFamily: "Inter, sans-serif", fontWeight: 500 }}
        >
          + New session
        </button>
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

type BubbleMessage = {
  id: string;
  role: "user" | "assistant" | "system";
  parts: Array<Record<string, unknown>>;
};

function MessageBubble({ message }: { message: BubbleMessage }) {
  const isUser = message.role === "user";
  return (
    <div
      className={`flex flex-col gap-1 ${isUser ? "items-end" : "items-start"}`}
    >
      <div
        className="text-[10px] text-[#717182] uppercase tracking-wide"
        style={{ fontFamily: "Inter, sans-serif", fontWeight: 600 }}
      >
        {isUser ? "You" : "Mona"}
      </div>
      <div
        className="max-w-full rounded-[12px] px-3 py-2 text-[12px] leading-relaxed"
        style={
          isUser
            ? {
                background: "#1e2340",
                color: "white",
                fontFamily: "Inter, sans-serif",
              }
            : {
                background: "white",
                border: "1px solid rgba(0,0,0,0.06)",
                color: "#0a0a0a",
                fontFamily: "Inter, sans-serif",
              }
        }
      >
        {message.parts.map((part, i) => (
          <MessagePart key={i} part={part} />
        ))}
      </div>
    </div>
  );
}

function MessagePart({ part }: { part: Record<string, unknown> }) {
  const type = part.type as string;

  if (type === "text") {
    const text = (part.text as string | undefined) ?? "";
    if (!text) return null;
    return <span className="whitespace-pre-wrap break-words">{text}</span>;
  }

  if (type === "reasoning") {
    const text = (part.text as string | undefined) ?? "";
    return (
      <details className="mt-1 text-[11px]">
        <summary
          className="cursor-pointer text-[#717182] hover:text-[#0a0a0a] list-none"
          style={{ fontFamily: "Inter, sans-serif" }}
        >
          Reasoning
        </summary>
        <div
          className="mt-1 whitespace-pre-wrap break-words italic"
          style={{ color: "#4b5563", fontFamily: "Inter, sans-serif" }}
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
        className="mt-1 text-[11px] rounded-md px-2 py-1"
        style={{
          background: "rgba(0,0,0,0.03)",
          border: "1px solid rgba(0,0,0,0.06)",
          fontFamily: "Inter, sans-serif",
        }}
      >
        <summary className="cursor-pointer flex items-center gap-1.5 text-[#0a0a0a] list-none">
          <span style={{ fontSize: 10 }}>⚙</span>
          <span style={{ fontWeight: 500 }}>{toolName}</span>
          {isInputStreaming && <span className="text-[#717182]">…</span>}
          {isOutputAvailable && <span className="text-green-600">✓</span>}
          {isOutputError && <span className="text-red-600">✗</span>}
        </summary>
        <div className="mt-1.5 grid grid-cols-[60px_1fr] gap-x-2 gap-y-1 text-[10px]">
          <span className="text-[#717182]">Input</span>
          <pre
            className="whitespace-pre-wrap break-words text-[#0a0a0a]"
            style={{ fontFamily: "ui-monospace, SFMono-Regular, monospace" }}
          >
            {input === undefined ? "" : JSON.stringify(input, null, 2)}
          </pre>
          {(isOutputAvailable || isOutputError) && (
            <>
              <span className="text-[#717182]">
                {isOutputError ? "Error" : "Output"}
              </span>
              <pre
                className="whitespace-pre-wrap break-words text-[#0a0a0a]"
                style={{
                  fontFamily: "ui-monospace, SFMono-Regular, monospace",
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
