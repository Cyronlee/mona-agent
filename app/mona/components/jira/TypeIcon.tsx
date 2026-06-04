import { jiraType, jiraFont, type JiraType } from "./tokens";

export function TypeIcon({
  type,
  size = 16,
}: {
  type: JiraType;
  size?: number;
}) {
  const config = jiraType[type];
  return (
    <span
      aria-label={config.label}
      role="img"
      style={{
        display: "inline-flex",
        alignItems: "center",
        justifyContent: "center",
        width: size,
        height: size,
        borderRadius: 3,
        background: config.bg,
        color: "#FFFFFF",
        fontSize: Math.round(size * 0.65),
        fontWeight: 700,
        lineHeight: 1,
        fontFamily: jiraFont.sans,
        flexShrink: 0,
        userSelect: "none",
      }}
    >
      {config.letter}
    </span>
  );
}
