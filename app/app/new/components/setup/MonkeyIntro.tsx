import { MonkeySvg } from "@/mona/components/MonkeySvg"
import svgPaths2 from "@/assets/svgPaths2"

const POPPINS = { fontFamily: "'Poppins', sans-serif" } as const

export function MonkeyIntro({
  title,
  description,
}: {
  title: string
  description: string
}) {
  return (
    <div className="flex w-full items-center gap-6">
      <div className="shrink-0" style={{ transform: "scaleY(-1) rotate(180deg)" }}>
        <MonkeySvg paths={svgPaths2} />
      </div>
      <div className="flex min-w-0 flex-1 flex-col gap-1">
        <p
          className="text-[16px] tracking-[0.07px] text-[#002557]"
          style={{ ...POPPINS, fontWeight: 500 }}
        >
          {title}
        </p>
        <p
          className="text-[14px] tracking-[-0.15px] text-[#6b727e]"
          style={{ ...POPPINS, fontWeight: 400 }}
        >
          {description}
        </p>
      </div>
    </div>
  )
}