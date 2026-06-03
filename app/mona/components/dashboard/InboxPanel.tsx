import { useState } from "react";
import svgPaths from "../../../assets/svgDashboard";
import type { AggregatedSuggestion } from "../../api/projects";
import { Svg12, Svg14, Svg16, pf } from "./icons";

type Suggestion = {
  id: number;
  tag: string;
  title: string;
  action: string;
};

const FALLBACK_SUGGESTIONS: Suggestion[] = [
  {
    id: 0,
    tag: "Sign Up",
    title:
      "Henry Howarth suggest to replace the old NPS prompt with the new 1–5 rating.",
    action: "Swap NPS prompt → 1–5 rating",
  },
  {
    id: 1,
    tag: "NPS prompt",
    title:
      "Henry Howarth suggest to help user to find the item more quickly.",
    action: "Add global search + filter",
  },
];

const MONA_NOTE = "Add a global search function, and a global filter.";

const TONE_OPTIONS = ["Neutral", "Friendly", "Playful"];

function toSuggestions(api?: AggregatedSuggestion[]): Suggestion[] {
  if (!api) return FALLBACK_SUGGESTIONS;
  return api.map((s, i) => ({
    id: i,
    tag: s.featureTitle,
    title: s.desc ?? s.title,
    action: s.title,
  }));
}

function SuggestionCard({
  suggestion,
  dismissed,
  onDismiss,
}: {
  suggestion: Suggestion;
  dismissed: boolean;
  onDismiss: () => void;
}) {
  if (dismissed) return null;
  return (
    <div
      className="mx-3 mb-2 p-3 rounded-[12px] flex flex-col gap-2"
      style={{
        background: "#fefdfc",
        border: "1px solid #dbe3ff",
        boxShadow:
          "0px -2px 4px 0px rgba(63,74,78,0.15), 0px -1px 3px 0px rgba(128,142,148,0.2)",
      }}
    >
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-1">
          <span
            className="px-2 py-0.5 rounded-[8px] text-[12px] text-[#002557] cursor-pointer"
            style={{
              background: "white",
              border: "1px solid rgba(0,0,0,0.1)",
              fontFamily: "Poppins, sans-serif",
              fontWeight: 600,
            }}
          >
            {suggestion.tag}
          </span>
        </div>
        <button onClick={onDismiss} className="hover:opacity-70">
          <Svg16>
            <path
              d="M12 4L4 12"
              stroke="#002557"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
            <path
              d="M4 4L12 12"
              stroke="#002557"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </Svg16>
        </button>
      </div>
      <p
        className="text-[12px] text-[#0a0a0a]"
        style={{ fontFamily: "Poppins, sans-serif" }}
      >
        {suggestion.title}
      </p>
      <div className="pt-1" style={{ borderTop: "1px dashed #EBC5A8" }}>
        <p
          className="text-[12px] text-[#717182] mb-1"
          style={{ fontFamily: "Poppins, sans-serif" }}
        >
          You may want me to:
        </p>
        <p
          className="text-[12px] text-[#0a0a0a] mb-2"
          style={{ fontFamily: "Poppins, sans-serif" }}
        >
          {suggestion.action}
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
            <Svg12>{pf("M10 3L4.5 8.5L2 6", "#FF7F26")}</Svg12>
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
        </div>
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
          <Svg12>{pf("M10 3L4.5 8.5L2 6", "#FF7F26")}</Svg12>
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
          <Svg16>
            <path d={svgPaths.p14780cf0} fill="#002557" />
          </Svg16>
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
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
          <path d={svgPaths.p1e43ddf2} fill="#FF7F26" />
        </svg>
      </div>
    </div>
  );
}

function CollapsedInbox() {
  return (
    <div
      className="flex flex-col items-center shrink-0"
      style={{
        width: 41,
        background: "#dfe3e8",
        borderRight: "1px solid rgba(0,0,0,0.1)",
        boxShadow: "2px 0px 4px 0px rgba(0,0,0,0.15)",
        height: "100%",
      }}
    >
      <div className="flex flex-col gap-2 items-center pt-2 px-2">
        <Svg16>
          <path d={svgPaths.p2f778600} fill="#1C1B1F" />
        </Svg16>

        <div className="flex items-center justify-center h-[37px] w-[17px]">
          <div className="-rotate-90 flex-none">
            <p
              className="text-[14px] text-[#0a0a0a] whitespace-nowrap"
              style={{ fontFamily: "Inter, sans-serif" }}
            >
              Inbox
            </p>
          </div>
        </div>

        <div
          className="flex items-center justify-center rounded-[8px] px-2"
          style={{ background: "#eceef2", height: 22, minWidth: 24 }}
        >
          <span
            className="text-[12px] text-[#030213]"
            style={{ fontFamily: "Inter, sans-serif", fontWeight: 500 }}
          >
            9
          </span>
        </div>
      </div>

      <div className="flex-1" />
    </div>
  );
}

function ExpandedInbox({
  suggestions,
}: {
  suggestions: Suggestion[];
}) {
  const [dismissed, setDismissed] = useState<number[]>([]);
  const dismiss = (id: number) =>
    setDismissed((prev) => (prev.includes(id) ? prev : [...prev, id]));

  return (
    <div
      className="flex h-full flex-col shrink-0 overflow-y-auto"
      style={{
        width: 220,
        background: "#dfe3e8",
        borderRight: "1px solid rgba(0,0,0,0.1)",
        height: "100%",
      }}
    >
      <div
        className="flex items-center justify-between px-4 shrink-0"
        style={{ height: 40, borderBottom: "1px solid rgba(0,0,0,0.1)" }}
      >
        <div className="flex items-center gap-1">
          <Svg16>
            <path d={svgPaths.p2f778600} fill="#1C1B1F" />
          </Svg16>
          <span
            className="text-[14px] text-[#0a0a0a]"
            style={{ fontFamily: "Inter, sans-serif" }}
          >
            Inbox
          </span>
          <span
            className="flex items-center justify-center rounded-[8px] px-2 text-[12px] text-[#030213]"
            style={{
              background: "#eceef2",
              height: 22,
              fontFamily: "Inter, sans-serif",
              fontWeight: 500,
            }}
          >
            9
          </span>
        </div>
      </div>


      <div className="px-4 pt-4 pb-1 shrink-0">
        <div className="flex items-center gap-1.5">
          <span
            className="text-[12px] text-[#0a0a0a]"
            style={{ fontFamily: "Poppins, sans-serif", fontWeight: 500 }}
          >
            Suggestions
          </span>
          <span
            className="text-[12px] text-[#717182]"
            style={{ fontFamily: "Poppins, sans-serif" }}
          >
            · 5
          </span>
        </div>
      </div>

      {suggestions.map((s) => (
        <SuggestionCard
          key={s.id}
          suggestion={s}
          dismissed={dismissed.includes(s.id)}
          onDismiss={() => dismiss(s.id)}
        />
      ))}

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
    </div>
  );
}

type InboxPanelProps = {
  collapsed: boolean;
  suggestions?: AggregatedSuggestion[];
};

export function InboxPanel({
  collapsed,
  suggestions,
}: InboxPanelProps) {
  if (collapsed) return <CollapsedInbox />;
  return (
    <ExpandedInbox suggestions={toSuggestions(suggestions)} />
  );
}
