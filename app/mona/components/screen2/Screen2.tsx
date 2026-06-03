import { useState } from "react";
import { ActionBar } from "./ActionBar";
import { AppIntegrations } from "./AppIntegrations";
import { DEFAULT_TOGGLES } from "./appsData";
import { MonkeyIntro } from "./MonkeyIntro";
import {
  DescriptionField,
  ProjectMetaFields,
} from "./ProjectFields";

const imgBg = "/mona/bg.png";

export type Screen2Payload = {
  title: string;
  description: string;
};

export function Screen2({
  initialName,
  initialDescription,
  errorMessage,
  onBack,
  onStart,
}: {
  initialName: string;
  initialDescription?: string;
  errorMessage?: string | null;
  onBack: () => void;
  onStart: (payload: Screen2Payload) => void;
}) {
  const [projectName, setProjectName] = useState(
    initialName || "Global Shopping App",
  );
  const [domain, setDomain] = useState("Retail");
  const [description, setDescription] = useState(initialDescription ?? "");
  const [toggles, setToggles] = useState<Record<string, boolean>>(
    DEFAULT_TOGGLES,
  );

  const toggle = (id: string) =>
    setToggles((t) => ({ ...t, [id]: !t[id] }));

  const handleStart = () => {
    onStart({ title: projectName.trim(), description: description.trim() });
  };

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
      <div className="relative flex flex-col items-center px-6 py-10">
        <div className="flex flex-col gap-8 w-full" style={{ maxWidth: 880 }}>
          <MonkeyIntro
            title="One last step"
            description="Mona will keep an eye on things, listen to your needs, suggest ideas, and create agents to take care of the busywork for you."
          />

          <ProjectMetaFields
            projectName={projectName}
            onProjectNameChange={setProjectName}
            domain={domain}
            onDomainChange={setDomain}
          />

          <AppIntegrations toggles={toggles} onToggle={toggle} />

          <DescriptionField value={description} onChange={setDescription} />

          {errorMessage && (
            <div
              role="alert"
              className="flex items-start gap-2 rounded-[8px] w-full"
              style={{
                background: "rgba(254, 226, 226, 0.7)",
                border: "1px solid rgba(220, 38, 38, 0.3)",
                padding: "10px 12px",
                maxWidth: 880,
              }}
            >
              <span
                className="text-[13px]"
                style={{
                  fontFamily: "'Poppins', sans-serif",
                  color: "#991b1b",
                }}
              >
                {errorMessage}
              </span>
            </div>
          )}

          <ActionBar onBack={onBack} onStart={handleStart} />
        </div>
      </div>
    </div>
  );
}
