"use client";

import { useState } from "react";
import { Dashboard } from "./components/Dashboard";
import { Header } from "./components/Header";
import { Screen1 } from "./components/Screen1";
import { Screen2 } from "./components/Screen2";
import { Screen3 } from "./components/Screen3";

export default function App() {
  const [screen, setScreen] = useState<1 | 2 | 3 | 4>(1);
  const [projectIdea, setProjectIdea] = useState("");

  return (
    <div
      className="relative flex flex-col overflow-hidden"
      style={{
        maxWidth: "100%",
        background: "#f5f6f8",
        boxShadow: "0px 1px 3px 0px rgba(0,0,0,0.1), 0px 1px 2px -1px rgba(0,0,0,0.1)",
        border: "1px solid rgba(0,0,0,0.08)",
        minHeight: 812,
      }}
    >
      {screen !== 4 && <Header />}
      {screen === 1 && (
        <Screen1 onNext={(v) => { setProjectIdea(v); setScreen(2); }} />
      )}
      {screen === 2 && (
        <Screen2 initialName={projectIdea} onBack={() => setScreen(1)} onStart={() => setScreen(3)} />
      )}
      {screen === 3 && (
        <Screen3 onDone={() => setScreen(4)} />
      )}
      {screen === 4 && (
        <Dashboard />
      )}
    </div>
  );
}
