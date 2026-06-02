import { MonkeySvg } from "../MonkeySvg";
import svgPaths2 from "../../../assets/svgPaths2";

const POPPINS = { fontFamily: "'Poppins', sans-serif" } as const;

export function MonkeyIntro({
  title,
  description,
}: {
  title: string;
  description: string;
}) {
  return (
    <div className="flex items-center gap-6 w-full">
      <div className="shrink-0" style={{ transform: "scaleY(-1) rotate(180deg)" }}>
        <MonkeySvg paths={svgPaths2} />
      </div>
      <div className="flex flex-col gap-1 flex-1 min-w-0">
        <p
          className="text-[16px] text-[#002557] tracking-[0.07px]"
          style={{ ...POPPINS, fontWeight: 500 }}
        >
          {title}
        </p>
        <p
          className="text-[14px] text-[#6b727e] tracking-[-0.15px]"
          style={{ ...POPPINS, fontWeight: 400 }}
        >
          {description}
        </p>
      </div>
    </div>
  );
}
