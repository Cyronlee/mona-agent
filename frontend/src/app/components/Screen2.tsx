import React, { useState } from "react";
import { MonkeySvg } from "./MonkeySvg";
import svgPaths1 from "../../assets/svgPaths1";
import svgPaths2 from "../../assets/svgPaths2";
import imgBg from "../../assets/bg.png";

// ── Check-circle SVG ──────────────────────────────────────────────────────────
function CheckCircleSvg() {
  return (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none">
      <path d={svgPaths2.p39456c00} fill="white" />
    </svg>
  );
}

// ── App icon container ────────────────────────────────────────────────────────
function AppIcon({ bg, children }: { bg: string; children: React.ReactNode }) {
  return (
    <div
      className="flex items-center justify-center rounded-[10px] shrink-0"
      style={{ background: bg, width: 36, height: 36 }}
    >
      {children}
    </div>
  );
}

// ── Toggle button ─────────────────────────────────────────────────────────────
function ToggleBtn({
  checked,
  onToggle,
  icon,
  label,
}: {
  checked: boolean;
  onToggle: () => void;
  icon: React.ReactNode;
  label: string;
}) {
  return (
    <button
      onClick={onToggle}
      className="flex items-center justify-between px-[13px] w-full rounded-[10px] cursor-pointer transition-all"
      style={{
        background: "rgba(255,255,255,0.8)",
        border: "1px solid rgba(0,0,0,0.08)",
        height: 62,
      }}
    >
      <div className="flex items-center gap-3">
        {icon}
        <span
          className="text-[14px] text-[#111827] whitespace-nowrap"
          style={{ fontFamily: "'Poppins', sans-serif", fontWeight: 500 }}
        >
          {label}
        </span>
      </div>
      <div
        className="flex items-center justify-center rounded-full shrink-0 transition-all"
        style={{
          width: 20,
          height: 20,
          background: checked ? "#FF7F26" : "#f5f6f8",
          border: "1px solid rgba(0,0,0,0.08)",
        }}
      >
        {checked && <CheckCircleSvg />}
      </div>
    </button>
  );
}

// ── Upload icon ───────────────────────────────────────────────────────────────
function UploadIcon() {
  return (
    <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
      <path d={svgPaths2.p34aacb00} stroke="#002557" strokeWidth="1.16667" strokeLinecap="round" strokeLinejoin="round" />
      <path d={svgPaths2.p2ed38dc0} stroke="#002557" strokeWidth="1.16667" strokeLinecap="round" strokeLinejoin="round" />
      <path d="M7 1.75V8.75" stroke="#002557" strokeWidth="1.16667" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

// ── App category column ───────────────────────────────────────────────────────
function AppCategory({
  label,
  apps,
  toggles,
  onToggle,
  showUpload,
}: {
  label: string;
  apps: { id: string; name: string; icon: React.ReactNode }[];
  toggles: Record<string, boolean>;
  onToggle: (id: string) => void;
  showUpload?: boolean;
}) {
  return (
    <div className="flex flex-col gap-2 flex-1 min-w-0">
      <span
        className="text-[14px] text-[#6b727e] whitespace-nowrap"
        style={{ fontFamily: "'Poppins', sans-serif", fontWeight: 400 }}
      >
        {label}
      </span>
      {apps.map((app) => (
        <ToggleBtn
          key={app.id}
          checked={!!toggles[app.id]}
          onToggle={() => onToggle(app.id)}
          icon={app.icon}
          label={app.name}
        />
      ))}
      {showUpload ? (
        <button
          className="flex items-center gap-2 text-[14px] text-[#111827] cursor-pointer hover:opacity-70 transition-opacity"
          style={{ fontFamily: "'Poppins', sans-serif", fontWeight: 500 }}
        >
          <UploadIcon />
          Upload file
        </button>
      ) : (
        <span
          className="text-[14px] text-[#111827] cursor-pointer hover:opacity-70 transition-opacity"
          style={{ fontFamily: "'Poppins', sans-serif", fontWeight: 500 }}
        >
          + More
        </span>
      )}
    </div>
  );
}

export function Screen2({
  initialName,
  onBack,
  onStart,
}: {
  initialName: string;
  onBack: () => void;
  onStart: () => void;
}) {
  const [projectName, setProjectName] = useState(initialName || "Global Shopping App");
  const [domain, setDomain] = useState("Retail");
  const [description, setDescription] = useState("");
  const [toggles, setToggles] = useState<Record<string, boolean>>({
    zoom: true,
    outlook: false,
    gmail: true,
    googlechat: true,
    googledrive: true,
    confluence: true,
    figma: true,
    uxpilot: false,
  });

  const toggle = (id: string) => setToggles((t) => ({ ...t, [id]: !t[id] }));
  const domains = ["Retail", "Finance", "Healthcare", "Education", "Technology", "Other"];

  const meetingApps = [
    {
      id: "zoom", name: "Zoom",
      icon: (
        <AppIcon bg="#eff6ff">
          <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
            <path d={svgPaths2.p144f51c0} stroke="#002557" strokeWidth="1.33333" strokeLinecap="round" strokeLinejoin="round" />
            <path d={svgPaths2.p1e94b080} stroke="#002557" strokeWidth="1.33333" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        </AppIcon>
      ),
    },
    {
      id: "outlook", name: "Outlook",
      icon: (
        <AppIcon bg="#eff6ff">
          <span className="text-[14px] text-black" style={{ fontFamily: "'Poppins', sans-serif", fontWeight: 500 }}>O</span>
        </AppIcon>
      ),
    },
  ];

  const mailApps = [
    {
      id: "gmail", name: "Gmail",
      icon: (
        <AppIcon bg="#eef2ff">
          <span className="text-[14px] text-black" style={{ fontFamily: "'Poppins', sans-serif", fontWeight: 500 }}>G</span>
        </AppIcon>
      ),
    },
    {
      id: "googlechat", name: "Google Chat",
      icon: (
        <AppIcon bg="#f5f3ff">
          <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
            <path d={svgPaths2.p1db90b80} stroke="#002557" strokeWidth="1.33333" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        </AppIcon>
      ),
    },
  ];

  const docApps = [
    {
      id: "googledrive", name: "Google Drive",
      icon: (
        <AppIcon bg="#ecfdf5">
          <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
            <path d="M14.6667 8H1.33333" stroke="#002557" strokeWidth="1.33333" strokeLinecap="round" strokeLinejoin="round" />
            <path d={svgPaths2.pf8d0500} stroke="#002557" strokeWidth="1.33333" strokeLinecap="round" strokeLinejoin="round" />
            <path d="M4 10.6667H4.00667" stroke="#002557" strokeWidth="1.33333" strokeLinecap="round" strokeLinejoin="round" />
            <path d="M6.66667 10.6667H6.67333" stroke="#002557" strokeWidth="1.33333" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        </AppIcon>
      ),
    },
    {
      id: "confluence", name: "Confluence",
      icon: (
        <AppIcon bg="#eef2ff">
          <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
            <path d={svgPaths2.p19416e00} stroke="#002557" strokeWidth="1.33333" strokeLinecap="round" strokeLinejoin="round" />
            <path d={svgPaths2.p3e059a80} stroke="#002557" strokeWidth="1.33333" strokeLinecap="round" strokeLinejoin="round" />
            <path d="M6.66667 6H5.33333" stroke="#002557" strokeWidth="1.33333" strokeLinecap="round" strokeLinejoin="round" />
            <path d="M10.6667 8.66667H5.33333" stroke="#002557" strokeWidth="1.33333" strokeLinecap="round" strokeLinejoin="round" />
            <path d="M10.6667 11.3333H5.33333" stroke="#002557" strokeWidth="1.33333" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        </AppIcon>
      ),
    },
  ];

  const designApps = [
    {
      id: "figma", name: "Figma",
      icon: (
        <AppIcon bg="#f5f3ff">
          <span className="text-[14px] text-black" style={{ fontFamily: "'Poppins', sans-serif", fontWeight: 500 }}>F</span>
        </AppIcon>
      ),
    },
    {
      id: "uxpilot", name: "UX Pilot",
      icon: (
        <AppIcon bg="#f5f3ff">
          <span className="text-[14px] text-black" style={{ fontFamily: "'Poppins', sans-serif", fontWeight: 500 }}>U</span>
        </AppIcon>
      ),
    },
  ];

  return (
    <div
      className="relative flex flex-col overflow-hidden"
      style={{
        backgroundColor: "#f5f6f8",
        backgroundImage: `url(${imgBg})`,
        backgroundRepeat: "repeat",
        flex: 1,
      }}
    >
      <div className="relative flex flex-col items-center px-6 py-10">
        <div className="flex flex-col gap-8 w-full" style={{ maxWidth: 880 }}>

          {/* Monkey + Intro */}
          <div className="flex items-center gap-6 w-full">
            <div className="shrink-0" style={{ transform: "scaleY(-1) rotate(180deg)" }}>
              <MonkeySvg paths={svgPaths2} />
            </div>
            <div className="flex flex-col gap-1 flex-1 min-w-0">
              <p className="text-[16px] text-[#002557] tracking-[0.07px]" style={{ fontFamily: "'Poppins', sans-serif", fontWeight: 500 }}>
                One last step
              </p>
              <p className="text-[14px] text-[#6b727e] tracking-[-0.15px]" style={{ fontFamily: "'Poppins', sans-serif", fontWeight: 400 }}>
                Mona will keep an eye on things, listen to your needs, suggest ideas, and create agents to take care of the busywork for you.
              </p>
            </div>
          </div>

          {/* Project Name + Domain */}
          <div className="flex gap-6 items-start w-full">
            <div className="flex flex-col gap-2" style={{ width: 492 }}>
              <label className="text-[14px] text-[#0a0a0a]" style={{ fontFamily: "'Poppins', sans-serif", fontWeight: 700 }}>Project name</label>
              <div className="relative rounded-[8px]" style={{ background: "rgba(255,255,255,0.7)", border: "1px solid rgba(0,0,0,0.1)", height: 48 }}>
                <input
                  className="size-full px-[13px] py-[9px] bg-transparent outline-none text-[14px] text-[#0a0a0a] tracking-[-0.15px] rounded-[8px]"
                  style={{ fontFamily: "'Poppins', sans-serif", fontWeight: 400 }}
                  value={projectName}
                  onChange={(e) => setProjectName(e.target.value)}
                />
              </div>
            </div>
            <div className="flex flex-col gap-2 flex-1 min-w-0">
              <label className="text-[14px] text-[#0a0a0a]" style={{ fontFamily: "'Poppins', sans-serif", fontWeight: 700 }}>Domain</label>
              <div className="relative rounded-[8px]" style={{ background: "rgba(255,255,255,0.7)", border: "1px solid rgba(0,0,0,0.1)", height: 48 }}>
                <select
                  className="size-full px-[13px] py-[9px] bg-transparent outline-none text-[14px] text-[#0a0a0a] tracking-[-0.15px] rounded-[8px] appearance-none cursor-pointer"
                  style={{ fontFamily: "'Poppins', sans-serif", fontWeight: 400 }}
                  value={domain}
                  onChange={(e) => setDomain(e.target.value)}
                >
                  {domains.map((d) => <option key={d} value={d}>{d}</option>)}
                </select>
                <div className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none">
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
                    <path d="M10 16.998V6.998L15 11.998L10 16.998Z" fill="#717182" transform="rotate(90 12 12)" />
                  </svg>
                </div>
              </div>
            </div>
          </div>

          {/* App integrations */}
          <div className="flex flex-col gap-2 w-full">
            <p className="text-[16px] text-[#0a0a0a]" style={{ fontFamily: "'Poppins', sans-serif", fontWeight: 500 }}>
              Allow Mona to connect your apps or read your files
            </p>
            <p className="text-[12px] text-[#6b727e]" style={{ fontFamily: "'Poppins', sans-serif", fontWeight: 400 }}>
              Mona will read context from these apps to surface suggestions. You can always change the setting later.
            </p>
            <div
              className="rounded-[14px] p-6"
              style={{ background: "rgba(255,255,255,0.5)", border: "1px solid rgba(0,0,0,0.08)", boxShadow: "0px 1px 3px 0px rgba(0,0,0,0.1), 0px 1px 2px 0px rgba(0,0,0,0.1)" }}
            >
              <div className="flex gap-4 w-full">
                <AppCategory label="Meeting" apps={meetingApps} toggles={toggles} onToggle={toggle} />
                <AppCategory label="Mails & Chats" apps={mailApps} toggles={toggles} onToggle={toggle} />
                <AppCategory label="Documentation" apps={docApps} toggles={toggles} onToggle={toggle} showUpload />
                <AppCategory label="Design tools" apps={designApps} toggles={toggles} onToggle={toggle} />
              </div>
            </div>
          </div>

          {/* Optional description */}
          <div className="flex flex-col gap-2 w-full">
            <p className="text-[16px] text-[#0a0a0a]" style={{ fontFamily: "'Poppins', sans-serif", fontWeight: 500 }}>
              I want to explain the project more{" "}
              <span className="text-[16px] text-[#717182]" style={{ fontFamily: "'Poppins', sans-serif", fontWeight: 400 }}>(Optional)</span>
            </p>
            <div className="relative rounded-[8px]" style={{ background: "rgba(255,255,255,0.7)", border: "1px solid rgba(0,0,0,0.1)", height: 48 }}>
              <input
                className="size-full px-[13px] py-[9px] bg-transparent outline-none text-[14px] text-[#717182] tracking-[-0.15px] rounded-[8px]"
                style={{ fontFamily: "'Poppins', sans-serif", fontWeight: 400 }}
                placeholder="Describe here..."
                value={description}
                onChange={(e) => setDescription(e.target.value)}
              />
            </div>
          </div>

          {/* Action buttons */}
          <div className="flex items-center justify-between w-full" style={{ maxWidth: 861 }}>
            <button
              onClick={onBack}
              className="flex items-center gap-2 px-4 rounded-[8px] cursor-pointer transition-opacity hover:opacity-70"
              style={{ background: "transparent", border: "1px solid rgba(0,0,0,0.12)", height: 38 }}
            >
              <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
                <path d="M11.0833 7H2.91667" stroke="#6b727e" strokeWidth="1.16667" strokeLinecap="round" strokeLinejoin="round" />
                <path d="M7 11.0833L2.91667 7L7 2.91667" stroke="#6b727e" strokeWidth="1.16667" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
              <span className="text-[14px] text-[#6b727e] tracking-[-0.15px]" style={{ fontFamily: "'Poppins', sans-serif", fontWeight: 500 }}>Back</span>
            </button>

            <button
              onClick={onStart}
              className="flex items-center gap-2 px-4 rounded-[8px] cursor-pointer transition-opacity hover:opacity-90"
              style={{ background: "#002557", border: "1px solid #ff7f26", height: 38, minWidth: 139 }}
            >
              <span className="text-[14px] text-[#ff7f26] tracking-[-0.15px]" style={{ fontFamily: "'Poppins', sans-serif", fontWeight: 700 }}>Start project</span>
              <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
                <path d="M2.91667 7H11.0833" stroke="#FF7F26" strokeWidth="1.16667" strokeLinecap="round" strokeLinejoin="round" />
                <path d={svgPaths1.pf23dd00} stroke="#FF7F26" strokeWidth="1.16667" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
