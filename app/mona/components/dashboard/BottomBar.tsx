function AgentStatusDot({
  color,
  label,
  initials,
}: {
  color: string;
  label: string;
  initials: string;
}) {
  return (
    <div className="flex items-center gap-1.5" title={label}>
      <div
        className="relative flex items-center justify-center rounded-full text-[8px] text-white"
        style={{
          width: 16,
          height: 16,
          background: color,
          fontFamily: "Poppins, sans-serif",
          fontWeight: 600,
        }}
      >
        {initials}
        <span
          className="absolute -bottom-[1px] -right-[1px] rounded-full border border-[#f8fafc]"
          style={{
            width: 6,
            height: 6,
            background:
              label === "Busy"
                ? "#facc15"
                : label === "Online"
                  ? "#4ade80"
                  : "#94a3b8",
          }}
        />
      </div>
    </div>
  );
}

const AGENTS = [
  { color: "#7c3aed", label: "Online", initials: "O" },
  { color: "#2563eb", label: "Busy", initials: "P" },
  { color: "#0f766e", label: "Idle", initials: "B" },
];

export function BottomBar() {
  return (
    <footer
      className="fixed inset-x-0 bottom-0 z-20 flex items-center justify-between px-3"
      style={{
        height: 28,
        borderTop: "1px solid rgba(0,0,0,0.08)",
        background: "#f8fafc",
      }}
    >
      <span
        className="text-[10px] text-[#717182]"
        style={{ fontFamily: "Inter, sans-serif" }}
      >
        Last sync: 2 mins ago
      </span>
      <div className="flex items-center gap-1.5">
        {AGENTS.map((agent) => (
          <AgentStatusDot key={agent.label} {...agent} />
        ))}
      </div>
    </footer>
  );
}
