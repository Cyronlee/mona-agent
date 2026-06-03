import svgPaths1 from "@/assets/svgPaths1"

const POPPINS = { fontFamily: "'Poppins', sans-serif" } as const

function BackIcon() {
  return (
    <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
      <path
        d="M11.0833 7H2.91667"
        stroke="#6b727e"
        strokeWidth="1.16667"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path
        d="M7 11.0833L2.91667 7L7 2.91667"
        stroke="#6b727e"
        strokeWidth="1.16667"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  )
}

function ArrowRight() {
  return (
    <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
      <path
        d="M2.91667 7H11.0833"
        stroke="#FF7F26"
        strokeWidth="1.16667"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path
        d={svgPaths1.pf23dd00}
        stroke="#FF7F26"
        strokeWidth="1.16667"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  )
}

export function ActionBar({
  onBack,
  onStart,
}: {
  onBack: () => void
  onStart: () => void
}) {
  return (
    <div
      className="flex w-full items-center justify-between"
      style={{ maxWidth: 861 }}
    >
      <button
        onClick={onBack}
        className="flex cursor-pointer items-center gap-2 rounded-[8px] px-4 transition-opacity hover:opacity-70"
        style={{
          background: "transparent",
          border: "1px solid rgba(0,0,0,0.12)",
          height: 38,
        }}
      >
        <BackIcon />
        <span
          className="text-[14px] tracking-[-0.15px] text-[#6b727e]"
          style={{ ...POPPINS, fontWeight: 500 }}
        >
          Back
        </span>
      </button>

      <button
        onClick={onStart}
        className="flex cursor-pointer items-center gap-2 rounded-[8px] px-4 transition-opacity hover:opacity-90"
        style={{
          background: "#002557",
          border: "1px solid #ff7f26",
          height: 38,
          minWidth: 139,
        }}
      >
        <span
          className="text-[14px] tracking-[-0.15px] text-[#ff7f26]"
          style={{ ...POPPINS, fontWeight: 700 }}
        >
          Start project
        </span>
        <ArrowRight />
      </button>
    </div>
  )
}