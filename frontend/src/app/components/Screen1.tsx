import React, { useState } from "react";
import { MonkeySvg } from "./MonkeySvg";
import svgPaths1 from "../../assets/svgPaths1";
import imgBg from "../../assets/bg.png";

export function Screen1({ onNext }: { onNext: (value: string) => void }) {
  const [value, setValue] = useState("");
  const canProceed = value.trim().length > 0;

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
      <div className="relative flex flex-col items-center px-6 py-10 flex-1">
        <div className="flex flex-col items-start" style={{ width: 800, gap: 80 }}>
          {/* Hero */}
          <div className="flex flex-col items-center gap-2 w-full">
            <div style={{ transform: "scaleY(-1) rotate(180deg)" }}>
              <MonkeySvg paths={svgPaths1} />
            </div>
            <p
              className="text-[24px] text-[#002557] tracking-[0.07px] whitespace-nowrap"
              style={{ fontFamily: "'Poppins', sans-serif", fontWeight: 500 }}
            >
              Give Mona a starting point.
            </p>
            <p
              className="text-[14px] text-[#6b727e] tracking-[-0.15px] text-center"
              style={{ fontFamily: "'Poppins', sans-serif", fontWeight: 400, width: 635 }}
            >
              Just two steps to get started. Mona will keep an eye on things, listen to your needs, suggest ideas, and create agents to take care of the busywork for you.
            </p>
          </div>

          {/* Input */}
          <div className="flex flex-col gap-2 w-full">
            <label
              className="text-[16px] text-[#0a0a0a]"
              style={{ fontFamily: "'Poppins', sans-serif", fontWeight: 700 }}
            >
              What are we going to build?
            </label>
            <div
              className="relative rounded-[8px] w-full"
              style={{
                background: "rgba(255,255,255,0.7)",
                border: "1px solid rgba(0,0,0,0.1)",
                height: 48,
              }}
            >
              <input
                className="size-full px-[13px] py-[9px] bg-transparent outline-none text-[14px] tracking-[-0.15px] rounded-[8px]"
                style={{
                  fontFamily: "'Poppins', sans-serif",
                  fontWeight: 400,
                  color: value ? "#0a0a0a" : "#717182",
                }}
                placeholder="Enter project name, description or any ideas"
                value={value}
                onChange={(e) => setValue(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && canProceed && onNext(value)}
              />
            </div>
          </div>

          {/* Next button */}
          <div className="flex justify-end w-full">
            <button
              onClick={() => canProceed && onNext(value)}
              className="flex items-center gap-2 px-4 rounded-[8px] transition-opacity"
              style={{
                background: "#1e2340",
                height: 36,
                width: 98,
                opacity: canProceed ? 1 : 0.4,
                cursor: canProceed ? "pointer" : "not-allowed",
              }}
            >
              <span
                className="text-[14px] text-white tracking-[-0.15px]"
                style={{ fontFamily: "'Poppins', sans-serif", fontWeight: 500 }}
              >
                Next
              </span>
              <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
                <path d="M2.91667 7H11.0833" stroke="white" strokeWidth="1.16667" strokeLinecap="round" strokeLinejoin="round" />
                <path d={svgPaths1.pf23dd00} stroke="white" strokeWidth="1.16667" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
