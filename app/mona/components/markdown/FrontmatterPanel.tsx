import { cn } from "@/lib/utils";

export type FrontmatterValue = string | number | boolean | string[] | undefined | null;

export function FrontmatterPanel({
  fields,
  className,
}: {
  fields: Record<string, FrontmatterValue>;
  className?: string;
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
      {entries.map(([key, value]) => (
        <div key={key} className="flex flex-col gap-1 min-w-0">
          <span
            className="text-[11px] text-[#717182] uppercase tracking-wide"
            style={{ fontWeight: 600 }}
          >
            {key}
          </span>
          <FrontmatterValueRender value={value} />
        </div>
      ))}
    </div>
  );
}

function FrontmatterValueRender({ value }: { value: FrontmatterValue }) {
  if (Array.isArray(value)) {
    if (value.length === 0) return <span className="text-[12px] text-[#a1a1aa]">—</span>;
    return (
      <ul className="flex flex-col gap-0.5 pl-0 m-0 list-none">
        {value.map((item, i) => (
          <li
            key={i}
            className="text-[13px] text-[#0a0a0a] flex items-start gap-1.5"
            style={{ fontWeight: 400 }}
          >
            <span className="text-[#717182] shrink-0">•</span>
            <span className="break-words min-w-0">{item}</span>
          </li>
        ))}
      </ul>
    );
  }
  return (
    <span
      className="text-[13px] text-[#0a0a0a] break-words"
      style={{ fontWeight: 400 }}
    >
      {String(value)}
    </span>
  );
}
