import { Svg12, Svg14 } from "./icons";

export function SearchIcon() {
  return (
    <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
      <path
        d="M6.41667 10.5C8.67283 10.5 10.5 8.67283 10.5 6.41667C10.5 4.1605 8.67283 2.33333 6.41667 2.33333C4.1605 2.33333 2.33333 4.1605 2.33333 6.41667C2.33333 8.67283 4.1605 10.5 6.41667 10.5Z"
        stroke="#717182"
        strokeWidth="1.16667"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path
        d="M11.6667 11.6667L9.44922 9.44922"
        stroke="#717182"
        strokeWidth="1.16667"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

export function BellIcon() {
  return (
    <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
      <path
        d="M10.5 4.95833C10.5 3.02534 8.93299 1.45833 7 1.45833C5.067 1.45833 3.5 3.02534 3.5 4.95833V6.64555C3.5 7.00641 3.36088 7.35337 3.11167 7.61258L2.33333 8.41667H11.6667L10.8883 7.61258C10.6391 7.35337 10.5 7.00641 10.5 6.64555V4.95833Z"
        stroke="#717182"
        strokeWidth="1.16667"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path
        d="M5.54167 10.5C5.72203 11.0426 6.25369 11.4167 6.83333 11.4167H7.16667C7.74631 11.4167 8.27797 11.0426 8.45833 10.5"
        stroke="#717182"
        strokeWidth="1.16667"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

export function HelpIcon() {
  return (
    <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
      <path
        d="M7 11.6667C9.57733 11.6667 11.6667 9.57733 11.6667 7C11.6667 4.42267 9.57733 2.33333 7 2.33333C4.42267 2.33333 2.33333 4.42267 2.33333 7C2.33333 9.57733 4.42267 11.6667 7 11.6667Z"
        stroke="#717182"
        strokeWidth="1.16667"
      />
      <path
        d="M5.64648 5.60002C5.64648 4.85251 6.2523 4.24669 6.99982 4.24669C7.74733 4.24669 8.35315 4.85251 8.35315 5.60002C8.35315 6.18548 7.98061 6.68393 7.45964 6.86898C7.18964 6.96483 6.99982 7.21876 6.99982 7.50526V7.70002"
        stroke="#717182"
        strokeWidth="1.16667"
        strokeLinecap="round"
      />
      <path
        d="M7 9.33331H7.00583"
        stroke="#717182"
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

export function PanelToggleIcon({
  side,
  open,
}: {
  side: "left" | "right";
  open: boolean;
}) {
  const arrowPoints =
    side === "left"
      ? open
        ? "8.5 4 5.5 7 8.5 10"
        : "5.5 4 8.5 7 5.5 10"
      : open
        ? "5.5 4 8.5 7 5.5 10"
        : "8.5 4 5.5 7 8.5 10";

  return (
    <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
      <rect
        x="2"
        y="2"
        width="10"
        height="10"
        rx="2"
        stroke="#717182"
        strokeWidth="1.16667"
      />
      <path
        d={side === "left" ? "M5 2.5V11.5" : "M9 2.5V11.5"}
        stroke="#717182"
        strokeWidth="1.16667"
        strokeLinecap="round"
      />
      <polyline
        points={arrowPoints}
        stroke="#717182"
        strokeWidth="1.16667"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

export function ToolBoxIcon() {
  return (
    <svg width="14" height="14" viewBox="0 0 20 20" fill="none">
      <path
        d="M3.41667 15.5833V8.52625C3.41667 8.15083 3.54618 7.83465 3.80521 7.57771C4.06424 7.32076 4.38132 7.19229 4.75646 7.19229H6.70833V5.75208C6.70833 5.37569 6.83785 5.05903 7.09687 4.80208C7.3559 4.54514 7.67299 4.41667 8.04812 4.41667H11.9519C12.327 4.41667 12.6441 4.54618 12.9031 4.80521C13.1622 5.06424 13.2917 5.38132 13.2917 5.75646V7.19229H15.2435C15.6187 7.19229 15.9358 7.32181 16.1948 7.58083C16.4538 7.83986 16.5833 8.15694 16.5833 8.53208V15.5833H3.41667ZM7.24354 11.9294V12.6794H6.16021V11.9294H4.5V14.5H15.5V11.9294H13.8398V12.6794H12.7565V11.9294H7.24354ZM4.5 8.53208V10.8463H6.16021V10.0963H7.24354V10.8463H12.7565V10.0963H13.8398V10.8463H15.5V8.53208C15.5 8.46792 15.4733 8.40917 15.4198 8.35583C15.3665 8.30236 15.3077 8.27562 15.2435 8.27562H4.75646C4.69229 8.27562 4.63354 8.30236 4.58021 8.35583C4.52674 8.40917 4.5 8.46792 4.5 8.53208ZM7.79167 7.19229H12.2083V5.75646C12.2083 5.69229 12.1816 5.63354 12.1281 5.58021C12.0748 5.52674 12.016 5.5 11.9519 5.5H8.04812C7.98396 5.5 7.92521 5.52674 7.87188 5.58021C7.8184 5.63354 7.79167 5.69229 7.79167 5.75646V7.19229Z"
        fill="#717182"
      />
    </svg>
  );
}

export { Svg12, Svg14 };
