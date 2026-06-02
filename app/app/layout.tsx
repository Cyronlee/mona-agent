import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Mona",
  description: "Mona prototype migrated into Next.js",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="h-full antialiased">
      <body className="flex min-h-full flex-col overflow-hidden">{children}</body>
    </html>
  );
}
