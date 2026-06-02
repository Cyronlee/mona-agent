import type { ReactNode } from "react";
import {
  ConfluenceIcon,
  FigmaIcon,
  GmailIcon,
  GoogleChatIcon,
  GoogleDriveIcon,
  OutlookIcon,
  UXPilotIcon,
  ZoomIcon,
} from "./icons";

export type AppItem = {
  id: string;
  name: string;
  icon: ReactNode;
};

export const MEETING_APPS: AppItem[] = [
  { id: "zoom", name: "Zoom", icon: <ZoomIcon /> },
  { id: "outlook", name: "Outlook", icon: <OutlookIcon /> },
];

export const MAIL_APPS: AppItem[] = [
  { id: "gmail", name: "Gmail", icon: <GmailIcon /> },
  { id: "googlechat", name: "Google Chat", icon: <GoogleChatIcon /> },
];

export const DOC_APPS: AppItem[] = [
  { id: "googledrive", name: "Google Drive", icon: <GoogleDriveIcon /> },
  { id: "confluence", name: "Confluence", icon: <ConfluenceIcon /> },
];

export const DESIGN_APPS: AppItem[] = [
  { id: "figma", name: "Figma", icon: <FigmaIcon /> },
  { id: "uxpilot", name: "UX Pilot", icon: <UXPilotIcon /> },
];

export const DEFAULT_TOGGLES: Record<string, boolean> = {
  zoom: true,
  outlook: false,
  gmail: true,
  googlechat: true,
  googledrive: true,
  confluence: true,
  figma: true,
  uxpilot: false,
};
