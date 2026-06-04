import { resolveJiraStatus, jiraFont } from "./tokens";

export function StatusPill({
  status,
  size = "md",
}: {
  status?: string;
  size?: "sm" | "md";
}) {
  const config = resolveJiraStatus(status);
  const isSm = size === "sm";
  return (
    <span
      style={{
        display: "inline-flex",
        alignItems: "center",
        gap: 4,
        padding: isSm ? "1px 6px" : "2px 8px",
        borderRadius: 3,
        background: config.bg,
        color: config.text,
        fontSize: isSm ? 10 : 11,
        fontWeight: 700,
        letterSpacing: 0.3,
        textTransform: "uppercase",
        whiteSpace: "nowrap",
        lineHeight: isSm ? "14px" : "16px",
        fontFamily: jiraFont.sans,
      }}
    >
      <span
        style={{
          width: 6,
          height: 6,
          borderRadius: "50%",
          background: config.text,
          opacity: 0.6,
          flexShrink: 0,
        }}
      />
      {config.label}
    </span>
  );
}
