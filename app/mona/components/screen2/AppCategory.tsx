import type { ReactNode } from "react";
import { CheckCircle, UploadIcon } from "./icons";

function ToggleBtn({
  checked,
  onToggle,
  icon,
  label,
}: {
  checked: boolean;
  onToggle: () => void;
  icon: ReactNode;
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
        {checked && <CheckCircle />}
      </div>
    </button>
  );
}

export function AppCategory({
  label,
  apps,
  toggles,
  onToggle,
  showUpload,
}: {
  label: string;
  apps: { id: string; name: string; icon: ReactNode }[];
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
