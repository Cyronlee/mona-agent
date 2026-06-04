export function BottomBar() {
  return (
    <footer
      className="fixed inset-x-0 bottom-0 z-20 flex items-center px-3"
      style={{
        height: 28,
        borderTop: "1px solid rgba(0,0,0,0.08)",
        background: "#f8fafc",
      }}
    >
      <span
        className="text-[10px] text-[#717182]"
        style={{ fontFamily: "Inter, sans-serif" }}
      >
        Last sync: 2 mins ago
      </span>
    </footer>
  );
}
