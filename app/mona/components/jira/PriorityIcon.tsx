import { Icon } from "@iconify/react";
import { resolveJiraPriority } from "./tokens";

export function PriorityIcon({
  priority,
  showLabel = false,
}: {
  priority?: number;
  showLabel?: boolean;
}) {
  const config = resolveJiraPriority(priority);
  return (
    <span
      title={`${config.label} priority`}
      style={{
        display: "inline-flex",
        alignItems: "center",
        gap: 4,
        color: config.color,
        fontSize: 12,
        fontWeight: 500,
        lineHeight: "16px",
      }}
    >
      <Icon icon="lucide:chevrons-up" width={14} height={14} />
      {showLabel && <span>{config.label}</span>}
    </span>
  );
}
