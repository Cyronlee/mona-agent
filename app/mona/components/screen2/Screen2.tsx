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

export function Screen2({
  initialName,
  onBack,
  onStart,
}: {
  initialName: string;
  onBack: () => void;
  onStart: () => void;
}) {
  const [projectName, setProjectName] = useState(
    initialName || "Global Shopping App",
  );
  const [domain, setDomain] = useState("Retail");
  const [description, setDescription] = useState("");
  const [toggles, setToggles] = useState<Record<string, boolean>>(
    DEFAULT_TOGGLES,
  );

  const toggle = (id: string) =>
    setToggles((t) => ({ ...t, [id]: !t[id] }));

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

          <ActionBar onBack={onBack} onStart={onStart} />
        </div>
      </div>
    </div>
  );
}
