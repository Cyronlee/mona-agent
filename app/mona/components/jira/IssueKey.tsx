import { jiraFont } from "./tokens";

export function IssueKey({
  prefix,
  index,
  className,
}: {
  prefix: string;
  index: number;
  className?: string;
}) {
  return (
    <span
      className={className}
      style={{
        fontFamily: jiraFont.mono,
        fontSize: 11,
        color: "#5E6C84",
        fontWeight: 500,
        letterSpacing: 0.2,
        flexShrink: 0,
        userSelect: "none",
      }}
    >
      {prefix}-{String(index + 1).padStart(3, "0")}
    </span>
  );
}
