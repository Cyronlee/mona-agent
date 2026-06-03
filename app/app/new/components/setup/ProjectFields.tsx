const POPPINS = { fontFamily: "'Poppins', sans-serif" } as const

const FIELD_STYLE = {
  background: "rgba(255,255,255,0.7)",
  border: "1px solid rgba(0,0,0,0.1)",
  height: 48,
} as const

const INPUT_STYLE = {
  fontFamily: "'Poppins', sans-serif",
  fontWeight: 400,
} as const

function FieldShell({ children }: { children: React.ReactNode }) {
  return (
    <div className="relative rounded-[8px]" style={FIELD_STYLE}>
      {children}
    </div>
  )
}

function ProjectNameField({
  value,
  onChange,
}: {
  value: string
  onChange: (value: string) => void
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
          className="size-full rounded-[8px] bg-transparent px-[13px] py-[9px] text-[14px] tracking-[-0.15px] text-[#0a0a0a] outline-none"
          style={INPUT_STYLE}
          value={value}
          onChange={(e) => onChange(e.target.value)}
        />
      </FieldShell>
    </div>
  )
}

const DOMAINS = [
  "Retail",
  "Finance",
  "Healthcare",
  "Education",
  "Technology",
  "Other",
]

function DomainField({
  value,
  onChange,
}: {
  value: string
  onChange: (value: string) => void
}) {
  return (
    <div className="flex min-w-0 flex-1 flex-col gap-2">
      <label
        className="text-[14px] text-[#0a0a0a]"
        style={{ ...POPPINS, fontWeight: 700 }}
      >
        Domain
      </label>
      <FieldShell>
        <select
          className="size-full appearance-none rounded-[8px] bg-transparent px-[13px] py-[9px] text-[14px] tracking-[-0.15px] text-[#0a0a0a] outline-none cursor-pointer"
          style={INPUT_STYLE}
          value={value}
          onChange={(e) => onChange(e.target.value)}
        >
          {DOMAINS.map((domain) => (
            <option key={domain} value={domain}>
              {domain}
            </option>
          ))}
        </select>
        <div className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2">
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
  )
}

export function ProjectMetaFields({
  projectName,
  onProjectNameChange,
  domain,
  onDomainChange,
}: {
  projectName: string
  onProjectNameChange: (value: string) => void
  domain: string
  onDomainChange: (value: string) => void
}) {
  return (
    <div className="flex w-full items-start gap-6">
      <ProjectNameField value={projectName} onChange={onProjectNameChange} />
      <DomainField value={domain} onChange={onDomainChange} />
    </div>
  )
}

export function DescriptionField({
  value,
  onChange,
}: {
  value: string
  onChange: (value: string) => void
}) {
  return (
    <div className="flex w-full flex-col gap-2">
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
          className="size-full rounded-[8px] bg-transparent px-[13px] py-[9px] text-[14px] tracking-[-0.15px] text-[#717182] outline-none"
          style={INPUT_STYLE}
          placeholder="Describe here..."
          value={value}
          onChange={(e) => onChange(e.target.value)}
        />
      </FieldShell>
    </div>
  )
}