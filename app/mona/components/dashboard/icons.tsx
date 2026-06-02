import type { ReactNode } from "react";

const pf = (d: string, stroke = "#0A0A0A") => (
  <path d={d} stroke={stroke} strokeLinecap="round" strokeLinejoin="round" />
);

export function Svg12({ children }: { children: ReactNode }) {
  return (
    <svg width="12" height="12" viewBox="0 0 12 12" fill="none">
      {children}
    </svg>
  );
}

export function Svg14({ children }: { children: ReactNode }) {
  return (
    <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
      {children}
    </svg>
  );
}

export function Svg16({ children }: { children: ReactNode }) {
  return (
    <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
      {children}
    </svg>
  );
}

export { pf };
