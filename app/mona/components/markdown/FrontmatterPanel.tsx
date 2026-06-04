"use client";

import { cn } from "@/lib/utils";

export type FrontmatterValue =
  | string
  | number
  | boolean
  | string[]
  | undefined
  | null;

export type FrontmatterChange = {
  key: string;
  value: FrontmatterValue;
};

export function FrontmatterPanel({
  fields,
  className,
  onChange,
  saving,
  errors,
}: {
  fields: Record<string, FrontmatterValue>;
  className?: string;
  onChange?: (change: FrontmatterChange) => void;
  saving?: boolean;
  errors?: Record<string, string>;
}) {
  const entries = Object.entries(fields).filter(
    ([, v]) => v !== undefined && v !== null && v !== "",
  );

  if (entries.length === 0) {
    return (
      <div
        className={cn(
          "text-[12px] text-[#a1a1aa] italic px-4 py-3",
          className,
        )}
        style={{ fontFamily: "Poppins, sans-serif" }}
      >
        No metadata
      </div>
    );
  }

  return (
    <div
      className={cn("flex flex-col gap-3 p-4 overflow-y-auto", className)}
      style={{ fontFamily: "Poppins, sans-serif" }}
    >
      {saving && (
        <div className="flex items-center gap-1.5 text-[11px] text-[#717182]">
          <span
            className="inline-block w-2 h-2 rounded-full animate-pulse"
            style={{ background: "#FF7F26" }}
          />
          Saving…
        </div>
      )}
      {entries.map(([key, value]) => (
        <Field
          key={key}
          fieldKey={key}
          value={value}
          onChange={onChange}
          error={errors?.[key]}
        />
      ))}
    </div>
  );
}

function Field({
  fieldKey,
  value,
  onChange,
  error,
}: {
  fieldKey: string;
  value: FrontmatterValue;
  onChange?: (change: FrontmatterChange) => void;
  error?: string;
}) {
  const disabled = !onChange;
  return (
    <div className="flex flex-col gap-1 min-w-0">
      <label
        htmlFor={`fm-${fieldKey}`}
        className="text-[11px] text-[#717182] uppercase tracking-wide"
        style={{ fontWeight: 600 }}
      >
        {fieldKey}
      </label>
      <FrontmatterInput
        id={`fm-${fieldKey}`}
        fieldKey={fieldKey}
        value={value}
        disabled={disabled}
        onChange={onChange}
      />
      {error && (
        <span className="text-[11px] text-[#d4183d]">{error}</span>
      )}
    </div>
  );
}

function FrontmatterInput({
  id,
  fieldKey,
  value,
  disabled,
  onChange,
}: {
  id: string;
  fieldKey: string;
  value: FrontmatterValue;
  disabled: boolean;
  onChange?: (change: FrontmatterChange) => void;
}) {
  if (Array.isArray(value)) {
    return (
      <textarea
        id={id}
        rows={Math.max(2, value.length)}
        disabled={disabled}
        defaultValue={value.join("\n")}
        onBlur={(e) => {
          if (!onChange) return;
          const next = e.target.value
            .split("\n")
            .map((s) => s.trim())
            .filter(Boolean);
          onChange({ key: fieldKey, value: next });
        }}
        className={cn(
          "w-full text-[13px] text-[#0a0a0a] rounded-[6px] px-2 py-1.5 outline-none transition-colors resize-y",
          "bg-white border border-[rgba(0,0,0,0.1)] focus:border-[#FF7F26] focus:ring-2 focus:ring-[#FF7F26]/15",
          "placeholder:text-[#a1a1aa] disabled:opacity-60 disabled:cursor-not-allowed",
        )}
        style={{ fontWeight: 400, fontFamily: "Inter, sans-serif" }}
        placeholder="One item per line"
      />
    );
  }
  if (typeof value === "number") {
    return (
      <input
        id={id}
        type="number"
        disabled={disabled}
        defaultValue={value}
        onBlur={(e) => {
          if (!onChange) return;
          const raw = e.target.value.trim();
          if (raw === "") {
            onChange({ key: fieldKey, value: null });
            return;
          }
          const n = Number(raw);
          if (Number.isFinite(n)) onChange({ key: fieldKey, value: n });
        }}
        className={cn(
          "w-full text-[13px] text-[#0a0a0a] rounded-[6px] px-2 py-1.5 outline-none transition-colors",
          "bg-white border border-[rgba(0,0,0,0.1)] focus:border-[#FF7F26] focus:ring-2 focus:ring-[#FF7F26]/15",
          "placeholder:text-[#a1a1aa] disabled:opacity-60 disabled:cursor-not-allowed",
        )}
        style={{ fontWeight: 400, fontFamily: "Inter, sans-serif" }}
      />
    );
  }
  if (typeof value === "boolean") {
    return (
      <input
        id={id}
        type="checkbox"
        disabled={disabled}
        defaultChecked={value}
        onChange={(e) =>
          onChange?.({ key: fieldKey, value: e.target.checked })
        }
        className="h-4 w-4 rounded border-[rgba(0,0,0,0.2)] text-[#FF7F26] focus:ring-[#FF7F26] disabled:opacity-60"
      />
    );
  }
  return (
    <input
      id={id}
      type="text"
      disabled={disabled}
      defaultValue={String(value)}
      onBlur={(e) => {
        if (!onChange) return;
        const next = e.target.value;
        onChange({ key: fieldKey, value: next });
      }}
      className={cn(
        "w-full text-[13px] text-[#0a0a0a] rounded-[6px] px-2 py-1.5 outline-none transition-colors",
        "bg-white border border-[rgba(0,0,0,0.1)] focus:border-[#FF7F26] focus:ring-2 focus:ring-[#FF7F26]/15",
        "placeholder:text-[#a1a1aa] disabled:opacity-60 disabled:cursor-not-allowed",
      )}
      style={{ fontWeight: 400, fontFamily: "Inter, sans-serif" }}
    />
  );
}
