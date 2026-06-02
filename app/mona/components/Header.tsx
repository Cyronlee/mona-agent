import React from "react";

const imgLogo = "/mona/logo.png";

export function Header() {
  return (
    <div
      className="flex items-center gap-6 px-4 shrink-0 relative z-10"
      style={{ height: 48, borderBottom: "1px solid rgba(0,0,0,0.08)" }}
    >
      <img src={imgLogo} alt="Mona" style={{ height: 24, width: "auto" }} />
      <div className="flex-1" />
      <div
        className="flex items-center justify-center rounded-full shrink-0"
        style={{ width: 28, height: 28, background: "#d9d9d9" }}
      >
        <span
          className="text-[12px] text-[#002557]"
          style={{ fontFamily: "'Poppins', sans-serif", fontWeight: 500 }}
        >
          ZA
        </span>
      </div>
    </div>
  );
}
