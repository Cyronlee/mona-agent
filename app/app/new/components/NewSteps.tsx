"use client"

import { useEffect, useState } from "react"
import { MonkeySvg } from "@/mona/components/MonkeySvg"
import svgPaths1 from "@/assets/svgPaths1"
import { SetupStep as SetupStepBase, type SetupDraft } from "./setup/SetupStep"

const LOADING_MESSAGES = [
  "Analysing your project idea…",
  "Setting up your workspace…",
  "Connecting your integrations…",
  "Almost ready…",
]

export function IdeaStep({
  initialValue = "",
  onNext,
}: {
  initialValue?: string
  onNext: (value: string) => void
}) {
  const [value, setValue] = useState(initialValue)
  const canProceed = value.trim().length > 0

  return (
    <div className="relative flex flex-1 flex-col overflow-hidden">
      <div className="relative flex flex-1 flex-col items-center px-6 py-10">
        <div className="flex flex-col items-start" style={{ width: 800, gap: 80 }}>
          <div className="flex w-full flex-col items-center gap-2">
            <div style={{ transform: "scaleY(-1) rotate(180deg)" }}>
              <MonkeySvg paths={svgPaths1} />
            </div>
            <p
              className="whitespace-nowrap text-[24px] tracking-[0.07px] text-[#002557]"
              style={{ fontFamily: "'Poppins', sans-serif", fontWeight: 500 }}
            >
              Give Mona a starting point.
            </p>
            <p
              className="text-center text-[14px] tracking-[-0.15px] text-[#6b727e]"
              style={{ fontFamily: "'Poppins', sans-serif", fontWeight: 400, width: 635 }}
            >
              Just two steps to get started. Mona will keep an eye on things,
              listen to your needs, suggest ideas, and create agents to take
              care of the busywork for you.
            </p>
          </div>

          <div className="flex w-full flex-col gap-2">
            <label
              className="text-[16px] text-[#0a0a0a]"
              style={{ fontFamily: "'Poppins', sans-serif", fontWeight: 700 }}
            >
              What are we going to build?
            </label>
            <div
              className="relative w-full rounded-[8px]"
              style={{
                background: "rgba(255,255,255,0.7)",
                border: "1px solid rgba(0,0,0,0.1)",
                height: 48,
              }}
            >
              <input
                className="size-full rounded-[8px] bg-transparent px-[13px] py-[9px] text-[14px] tracking-[-0.15px] outline-none"
                style={{
                  fontFamily: "'Poppins', sans-serif",
                  fontWeight: 400,
                  color: value ? "#0a0a0a" : "#717182",
                }}
                placeholder="Enter project name, description or any ideas"
                value={value}
                onChange={(e) => setValue(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && canProceed && onNext(value)}
              />
            </div>
          </div>

          <div className="flex w-full justify-end">
            <button
              onClick={() => canProceed && onNext(value)}
              className="flex items-center gap-2 rounded-[8px] px-4 transition-opacity"
              style={{
                background: "#1e2340",
                height: 36,
                width: 98,
                opacity: canProceed ? 1 : 0.4,
                cursor: canProceed ? "pointer" : "not-allowed",
              }}
            >
              <span
                className="text-[14px] tracking-[-0.15px] text-white"
                style={{ fontFamily: "'Poppins', sans-serif", fontWeight: 500 }}
              >
                Next
              </span>
              <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
                <path
                  d="M2.91667 7H11.0833"
                  stroke="white"
                  strokeWidth="1.16667"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
                <path
                  d={svgPaths1.pf23dd00}
                  stroke="white"
                  strokeWidth="1.16667"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}

export function SetupStep({
  initialDraft,
  errorMessage,
  onBack,
  onStart,
}: {
  initialDraft: SetupDraft
  errorMessage?: string | null
  onBack: (draft: SetupDraft) => void
  onStart: (draft: SetupDraft) => void
}) {
  return (
    <SetupStepBase
      initialDraft={initialDraft}
      errorMessage={errorMessage}
      onBack={onBack}
      onStart={onStart}
    />
  )
}

export function LoadingStep({
}: {
  // Presentational step only. Creation/navigation is owned by NewFlow.
}) {
  const [msgIdx, setMsgIdx] = useState(0)

  useEffect(() => {
    const interval = setInterval(() => {
      setMsgIdx((i) => (i + 1) % LOADING_MESSAGES.length)
    }, 700)
    return () => clearInterval(interval)
  }, [])

  return (
    <div className="relative flex flex-1 flex-col overflow-hidden">
      <div className="relative flex flex-1 flex-col items-center justify-center gap-6 px-6">
        <div style={{ transform: "scaleY(-1) rotate(180deg)" }}>
          <MonkeySvg paths={svgPaths1} />
        </div>

        <p
          className="whitespace-nowrap text-[40px] tracking-[0.07px] text-[#002557]"
          style={{ fontFamily: "'Poppins', sans-serif", fontWeight: 500 }}
        >
          Loading design WIP
        </p>

        <p
          className="text-center text-[14px] text-[#6b727e]"
          style={{ fontFamily: "'Poppins', sans-serif", fontWeight: 400, width: 635 }}
        >
          Just two steps to get started. I&apos;ll keep an eye on things, listen
          to your needs, suggest ideas, and create agents to take care of the
          busywork for you.
        </p>

        <div className="mt-4 flex items-center gap-3">
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
  )
}

export type { SetupDraft }