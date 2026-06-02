const POPPINS = { fontFamily: "'Poppins', sans-serif" } as const;

const FIELD_STYLE = {
  background: "rgba(255,255,255,0.7)",
  border: "1px solid rgba(0,0,0,0.1)",
  height: 48,
} as const;

const INPUT_STYLE = {
  fontFamily: "'Poppins', sans-serif",
  fontWeight: 400,
} as const;

function FieldShell({ children }: { children: React.ReactNode }) {
  return (
    <div
      className="relative rounded-[8px]"
      style={FIELD_STYLE}
    >
      {children}
    </div>
  );
}

function ProjectNameField({
  value,
  onChange,
}: {
  value: string;
  onChange: (v: string) => void;
}) {
  return (
    <div className="flex flex-col gap-2" style={{ width: 492 }}>
      <label
        className="text-[14px] text-[#0a0a0a]"
        style={{ ...POPPINS, fontWeight: 700 }}
      >
        Project name
      </label>
      <FieldShell>
        <input
          className="size-full px-[13px] py-[9px] bg-transparent outline-none text-[14px] text-[#0a0a0a] tracking-[-0.15px] rounded-[8px]"
          style={INPUT_STYLE}
          value={value}
          onChange={(e) => onChange(e.target.value)}
        />
      </FieldShell>
    </div>
  );
}

const DOMAINS = [
  "Retail",
  "Finance",
  "Healthcare",
  "Education",
  "Technology",
  "Other",
];

function DomainField({
  value,
  onChange,
}: {
  value: string;
  onChange: (v: string) => void;
}) {
  return (
    <div className="flex flex-col gap-2 flex-1 min-w-0">
      <label
        className="text-[14px] text-[#0a0a0a]"
        style={{ ...POPPINS, fontWeight: 700 }}
      >
        Domain
      </label>
      <FieldShell>
        <select
          className="size-full px-[13px] py-[9px] bg-transparent outline-none text-[14px] text-[#0a0a0a] tracking-[-0.15px] rounded-[8px] appearance-none cursor-pointer"
          style={INPUT_STYLE}
          value={value}
          onChange={(e) => onChange(e.target.value)}
        >
          {DOMAINS.map((d) => (
            <option key={d} value={d}>
              {d}
            </option>
          ))}
        </select>
        <div className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none">
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
            <path
              d="M10 16.998V6.998L15 11.998L10 16.998Z"
              fill="#717182"
              transform="rotate(90 12 12)"
            />
          </svg>
        </div>
      </FieldShell>
    </div>
  );
}

export function ProjectMetaFields({
  projectName,
  onProjectNameChange,
  domain,
  onDomainChange,
}: {
  projectName: string;
  onProjectNameChange: (v: string) => void;
  domain: string;
  onDomainChange: (v: string) => void;
}) {
  return (
    <div className="flex gap-6 items-start w-full">
      <ProjectNameField value={projectName} onChange={onProjectNameChange} />
      <DomainField value={domain} onChange={onDomainChange} />
    </div>
  );
}

export function DescriptionField({
  value,
  onChange,
}: {
  value: string;
  onChange: (v: string) => void;
}) {
  return (
    <div className="flex flex-col gap-2 w-full">
      <p
        className="text-[16px] text-[#0a0a0a]"
        style={{ ...POPPINS, fontWeight: 500 }}
      >
        I want to explain the project more{" "}
        <span
          className="text-[16px] text-[#717182]"
          style={{ ...POPPINS, fontWeight: 400 }}
        >
          (Optional)
        </span>
      </p>
      <FieldShell>
        <input
          className="size-full px-[13px] py-[9px] bg-transparent outline-none text-[14px] text-[#717182] tracking-[-0.15px] rounded-[8px]"
          style={INPUT_STYLE}
          placeholder="Describe here..."
          value={value}
          onChange={(e) => onChange(e.target.value)}
        />
      </FieldShell>
    </div>
  );
}
