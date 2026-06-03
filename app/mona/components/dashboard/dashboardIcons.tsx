import { Icon } from "@iconify/react";

export function SearchIcon() {
  return <Icon icon="lucide:search" width={14} height={14} color="#717182" />;
}

export function BellIcon() {
  return <Icon icon="lucide:bell" width={14} height={14} color="#717182" />;
}

export function HelpIcon() {
  return <Icon icon="lucide:help-circle" width={14} height={14} color="#717182" />;
}

export function PanelToggleIcon({
  side,
  open,
}: {
  side: "left" | "right";
  open: boolean;
}) {
  const icon =
    side === "left"
      ? open
        ? "lucide:panel-left-open"
        : "lucide:panel-left-close"
      : open
        ? "lucide:panel-right-open"
        : "lucide:panel-right-close"

  return <Icon icon={icon} width={14} height={14} color="#717182" />;
}

export function ToolBoxIcon() {
  return <Icon icon="lucide:toolbox" width={14} height={14} color="#717182" />;
}

