// Atlassian Design System-inspired tokens used by Jira-style surfaces.
// Kept as plain constants — no runtime cost, easy to override in tests.

export const jiraFont = {
  sans: 'Inter, "Charlie Sans", -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
  mono: 'ui-monospace, SFMono-Regular, "SF Mono", Menlo, monospace',
} as const;

export const jiraColor = {
  // Surfaces
  bg: "#F4F5F7",
  surface: "#FFFFFF",
  surfaceAlt: "#FAFBFC",
  surfaceHover: "#F4F5F7",
  surfaceSelected: "#E9F2FF",
  surfaceSelectedStrong: "#DEEBFF",
  // Borders
  border: "#DFE1E6",
  borderSubtle: "#EBECF0",
  borderStrong: "#C1C7D0",
  borderFocus: "#0052CC",
  // Text
  textPrimary: "#172B4D",
  textSecondary: "#5E6C84",
  textTertiary: "#7A869A",
  textInverse: "#FFFFFF",
  textLink: "#0052CC",
  // Brand accent (used for selected / focused)
  brand: "#0052CC",
  brandSoft: "#4C9AFF",
  // Status semantic
  success: "#00875A",
  danger: "#DE350B",
  warning: "#FFAB00",
} as const;

export type JiraStatus =
  | "todo"
  | "in-progress"
  | "in-review"
  | "done"
  | "blocked"
  | "paused"
  | string;

export const jiraStatus: Record<string, { bg: string; text: string; label: string }> = {
  todo: { bg: "#DFE1E6", text: "#42526E", label: "TO DO" },
  "in-progress": { bg: "#DEEBFF", text: "#0747A6", label: "IN PROGRESS" },
  "in-review": { bg: "#EAE6FF", text: "#403294", label: "IN REVIEW" },
  done: { bg: "#E3FCEF", text: "#006644", label: "DONE" },
  blocked: { bg: "#FFEBE6", text: "#BF2600", label: "BLOCKED" },
  paused: { bg: "#FFEBE6", text: "#BF2600", label: "PAUSED" },
  planned: { bg: "#DFE1E6", text: "#42526E", label: "PLANNED" },
  active: { bg: "#DEEBFF", text: "#0747A6", label: "ACTIVE" },
  archived: { bg: "#EAE6FF", text: "#403294", label: "ARCHIVED" },
};

export const jiraFallbackStatus = { bg: "#DFE1E6", text: "#42526E", label: "UNKNOWN" };

export function resolveJiraStatus(status?: string) {
  if (!status) return jiraFallbackStatus;
  return jiraStatus[status] ?? { ...jiraFallbackStatus, label: status.toUpperCase() };
}

export type JiraType = "feature" | "story" | "task" | "bug" | "epic";

export const jiraType: Record<JiraType, { bg: string; letter: string; label: string }> = {
  feature: { bg: "#00B8D9", letter: "F", label: "Feature" },
  story: { bg: "#36B37E", letter: "S", label: "Story" },
  task: { bg: "#4C9AFF", letter: "T", label: "Task" },
  bug: { bg: "#FF5630", letter: "B", label: "Bug" },
  epic: { bg: "#6554C0", letter: "E", label: "Epic" },
};

export const jiraPriority: Record<number, { color: string; label: string }> = {
  1: { color: "#FF5630", label: "Highest" },
  2: { color: "#FF8B00", label: "High" },
  3: { color: "#FFAB00", label: "Medium" },
  4: { color: "#4C9AFF", label: "Low" },
  5: { color: "#B3BAC5", label: "Lowest" },
};

export const jiraFallbackPriority = { color: "#B3BAC5", label: "None" };

export function resolveJiraPriority(priority?: number) {
  if (priority == null) return jiraFallbackPriority;
  return jiraPriority[priority] ?? jiraFallbackPriority;
}

export const jiraRadius = {
  sm: "3px",
  md: "4px",
  lg: "8px",
  xl: "12px",
} as const;
