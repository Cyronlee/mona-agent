import { useEffect, useRef, useState } from "react";
import { MonkeySvg } from "./MonkeySvg";
import svgPaths3 from "../../assets/svgPaths1";
import { ApiError, type ProjectSummary } from "../api/projects";

const imgBgFlipped = "/mona/bg.png";

const LOADING_MESSAGES = [
  "Analysing your project idea…",
  "Setting up your workspace…",
  "Connecting your integrations…",
  "Almost ready…",
];

type Screen3Props = {
  draft: { title: string; description: string };
  onDone: (slug: string) => void | Promise<void>;
  onFailure: (message: string) => void;
  createProjectFn: (input: { title: string; desc?: string }) => Promise<ProjectSummary>;
};

export function Screen3({ draft, onDone, onFailure, createProjectFn }: Screen3Props) {
  const [msgIdx, setMsgIdx] = useState(0);
  const startedRef = useRef(false);

  useEffect(() => {
    const interval = setInterval(() => {
      setMsgIdx((i) => (i + 1) % LOADING_MESSAGES.length);
    }, 700);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    if (startedRef.current) return;
    startedRef.current = true;
    let cancelled = false;
    (async () => {
      try {
        const project = await createProjectFn({
          title: draft.title,
          desc: draft.description || undefined,
        });
        if (cancelled) return;
        await onDone(project.slug);
      } catch (err) {
        if (cancelled) return;
        const message =
          err instanceof ApiError
            ? err.message
            : err instanceof Error
              ? err.message
              : "Failed to create project";
        onFailure(message);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [draft.title, draft.description, createProjectFn, onDone, onFailure]);

  return (
    <div className="relative flex flex-col overflow-hidden" style={{ background: "#f5f6f8", flex: 1 }}>
      <div
        className="absolute inset-0 pointer-events-none"
        style={{
          backgroundImage: `url(${imgBgFlipped})`,
          backgroundRepeat: "repeat",
          transform: "rotate(180deg)",
        }}
      />

      <div className="relative flex flex-col items-center justify-center flex-1 gap-6 px-6">
        <div style={{ transform: "scaleY(-1) rotate(180deg)" }}>
          <MonkeySvg paths={svgPaths3} />
        </div>

        <p
          className="text-[40px] text-[#002557] tracking-[0.07px] whitespace-nowrap"
          style={{ fontFamily: "'Poppins', sans-serif", fontWeight: 500 }}
        >
          Loading design WIP
        </p>

        <p
          className="text-[14px] text-[#6b727e] text-center"
          style={{ fontFamily: "'Poppins', sans-serif", fontWeight: 400, width: 635 }}
        >
          Just two steps to get started. I'll keep an eye on things, listen to your needs, suggest ideas, and create agents to take care of the busywork for you.
        </p>

        <div className="flex items-center gap-3 mt-4">
          <div className="flex gap-1.5">
            {[0, 1, 2].map((i) => (
              <div
                key={i}
                className="rounded-full"
                style={{
                  width: 8,
                  height: 8,
                  background: "#002557",
                  opacity: msgIdx % 3 === i ? 1 : 0.25,
                  transition: "opacity 0.3s",
                }}
              />
            ))}
          </div>
          <span
            className="text-[13px] text-[#6b727e]"
            style={{ fontFamily: "'Poppins', sans-serif", fontWeight: 400, minWidth: 220 }}
          >
            {LOADING_MESSAGES[msgIdx % LOADING_MESSAGES.length]}
          </span>
        </div>
      </div>
    </div>
  );
}
