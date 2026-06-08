import { Header } from "@/mona/components/Header"

const sharedShellStyle = {
  maxWidth: "100%",
  background: "#f5f6f8",
  backgroundImage: "url(/mona/bg.png)",
  backgroundRepeat: "repeat",
  boxShadow: "0px 1px 3px 0px rgba(0,0,0,0.1), 0px 1px 2px -1px rgba(0,0,0,0.1)",
  border: "1px solid rgba(0,0,0,0.08)",
  minHeight: "100vh",
} satisfies React.CSSProperties

export default function NewLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <div className="relative flex flex-col overflow-hidden" style={sharedShellStyle}>
      <Header />
      {children}
    </div>
  )
}