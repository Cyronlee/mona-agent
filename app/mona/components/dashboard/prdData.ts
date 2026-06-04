import type { FeatureSummary } from "../../api/projects";

export type StoryStatus = "in-progress" | "todo";

export type FeatureRow = {
  name: string;
  count: number;
  expanded: boolean;
  items?: { num: string; priority: number; label: string; status?: StoryStatus }[];
};

export const PRD_NAV = [
  "Background & Vision",
  "Personas & Scenarios",
  "Architecture & Flow",
  "Feature Requirements",
  "Non-Functional Requirements",
];

export const FALLBACK_FEATURES: FeatureRow[] = [
  { name: "In-App Messaging", count: 3, expanded: false },
  {
    name: "Payment & Escrow (Core Trust Feature)",
    count: 4,
    expanded: false,
  },
  { name: "Request & Matching System", count: 3, expanded: false },
  {
    name: "The Global Marketplace Feed",
    count: 4,
    expanded: true,
    items: [
      { num: "037", priority: 1, label: "Explore Tab (Curated Feed)", status: "in-progress" as const },
      { num: "038", priority: 1, label: "Feed Filtering (Country & Category)", status: "in-progress" as const },
      { num: "026", priority: 2, label: "Item Detail Redirection (Interaction)", status: "todo" as const },
      { num: "025", priority: 1, label: "Keyword Search", status: "todo" as const },
    ],
  },
  { name: "User Authentication & Profile", count: 3, expanded: false },
  { name: "Navigation bar", count: 2, expanded: false },
  { name: "Sign Up", count: 3, expanded: false },
];

export function toPrdFeatures(api?: FeatureSummary[]): FeatureRow[] {
  if (!api) return FALLBACK_FEATURES;
  return api.map((f) => ({
    name: f.title,
    count: f.storyCount,
    expanded: false,
    items: undefined,
  }));
}

export type DesignStatus = "Done" | "WIP" | "Paused";

export type DesignFeature = {
  name: string;
  count: number;
  status: DesignStatus;
};

export const FALLBACK_DESIGN_FEATURES: DesignFeature[] = [
  { name: "In-App Messaging", count: 3, status: "Paused" },
  { name: "Payment & Escrow", count: 4, status: "Done" },
  { name: "Request & Matching System", count: 3, status: "Done" },
  { name: "The Global Marketplace Feed", count: 3, status: "Done" },
  { name: "User Authentication & Profile", count: 3, status: "Done" },
  { name: "Navigation bar", count: 2, status: "Done" },
  { name: "Sign Up", count: 3, status: "WIP" },
];

export function toDesignFeatures(api?: FeatureSummary[]): DesignFeature[] {
  if (!api) return FALLBACK_DESIGN_FEATURES;
  return api.map((f) => ({
    name: f.title,
    count: f.storyCount,
    status:
      f.status === "done" ? "Done" : f.status === "paused" ? "Paused" : "WIP",
  }));
}
