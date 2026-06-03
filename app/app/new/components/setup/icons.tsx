import svgPaths2 from "@/assets/svgPaths2"
import { AppIcon } from "./appIcon"

function CheckCircleSvg() {
  return (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none">
      <path d={svgPaths2.p39456c00} fill="white" />
    </svg>
  )
}

export function CheckCircle() {
  return <CheckCircleSvg />
}

function LetterIcon({ letter, bg }: { letter: string; bg: string }) {
  return (
    <AppIcon bg={bg}>
      <span
        className="text-[14px] text-black"
        style={{ fontFamily: "'Poppins', sans-serif", fontWeight: 500 }}
      >
        {letter}
      </span>
    </AppIcon>
  )
}

export const OutlookIcon = () => <LetterIcon letter="O" bg="#eff6ff" />
export const GmailIcon = () => <LetterIcon letter="G" bg="#eef2ff" />
export const FigmaIcon = () => <LetterIcon letter="F" bg="#f5f3ff" />
export const UXPilotIcon = () => <LetterIcon letter="U" bg="#f5f3ff" />

export function ZoomIcon() {
  return (
    <AppIcon bg="#eff6ff">
      <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
        <path
          d={svgPaths2.p144f51c0}
          stroke="#002557"
          strokeWidth="1.33333"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
        <path
          d={svgPaths2.p1e94b080}
          stroke="#002557"
          strokeWidth="1.33333"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </svg>
    </AppIcon>
  )
}

export function GoogleChatIcon() {
  return (
    <AppIcon bg="#f5f3ff">
      <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
        <path
          d={svgPaths2.p1db90b80}
          stroke="#002557"
          strokeWidth="1.33333"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </svg>
    </AppIcon>
  )
}

export function GoogleDriveIcon() {
  return (
    <AppIcon bg="#ecfdf5">
      <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
        <path
          d="M14.6667 8H1.33333"
          stroke="#002557"
          strokeWidth="1.33333"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
        <path
          d={svgPaths2.pf8d0500}
          stroke="#002557"
          strokeWidth="1.33333"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
        <path
          d="M4 10.6667H4.00667"
          stroke="#002557"
          strokeWidth="1.33333"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
        <path
          d="M6.66667 10.6667H6.67333"
          stroke="#002557"
          strokeWidth="1.33333"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </svg>
    </AppIcon>
  )
}

export function ConfluenceIcon() {
  return (
    <AppIcon bg="#eef2ff">
      <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
        <path
          d={svgPaths2.p19416e00}
          stroke="#002557"
          strokeWidth="1.33333"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
        <path
          d={svgPaths2.p3e059a80}
          stroke="#002557"
          strokeWidth="1.33333"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
        <path
          d="M6.66667 6H5.33333"
          stroke="#002557"
          strokeWidth="1.33333"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
        <path
          d="M10.6667 8.66667H5.33333"
          stroke="#002557"
          strokeWidth="1.33333"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
        <path
          d="M10.6667 11.3333H5.33333"
          stroke="#002557"
          strokeWidth="1.33333"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </svg>
    </AppIcon>
  )
}

export function UploadIcon() {
  return (
    <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
      <path
        d={svgPaths2.p34aacb00}
        stroke="#002557"
        strokeWidth="1.16667"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path
        d={svgPaths2.p2ed38dc0}
        stroke="#002557"
        strokeWidth="1.16667"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path
        d="M7 1.75V8.75"
        stroke="#002557"
        strokeWidth="1.16667"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  )
}