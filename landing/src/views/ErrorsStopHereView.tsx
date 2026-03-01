import { view } from "steel-frame";
import { FeatureRow } from "../components/feature/FeatureRow.js";
import { FeatureKey } from "../components/feature/FeatureKey.js";
import { FeatureTitle } from "../components/feature/FeatureTitle.js";
import { FeatureDescription } from "../components/feature/FeatureDescription.js";
import { CodeTabs } from "../components/code-block/CodeTabs.js";
import { ApiChangeExample } from "../components/code-block/stop-bugs/ApiChangeExample.js";
import { VLine } from "../components/VLine.js";
import { HLine } from "../components/HLine.js";
import { NpmUpdateExample } from "../components/code-block/stop-bugs/NpmUpdateExample.js";
import { ThirdPartyScriptsExample } from "../components/code-block/stop-bugs/ThirdPartyScriptsExample.js";
import { BackendIsDownExample } from "../components/code-block/stop-bugs/BackendIsDownExample.js";
import { OptionalDataExample } from "../components/code-block/stop-bugs/OptionalDataExample.js";
import { NoTypescriptExample } from "../components/code-block/stop-bugs/NoTypescriptExample.js";

export const ErrorsStopHereView = view(() => {
  <FeatureRow>
    <FeatureKey>Fault Tolerance</FeatureKey>
    <FeatureTitle>
      Errors Stop Here
      <br />
      Not Across Your App
    </FeatureTitle>
    <FeatureDescription>
      SteelFrame, components are isolated by design — if one fails, the rest
      stay alive. Even when APIs change or data structures break, your core
      experience remains stable and responsive
    </FeatureDescription>
  </FeatureRow>;
  <CodeTabs
    storageKey={"errors-stop-here"}
    tabs={[
      {
        label: "API Change",
        class: "api-change",
        content: () => ApiChangeExample,
      },
      {
        label: "NPM package update",
        class: "npm-package",
        content: () => NpmUpdateExample,
      },
      {
        label: "Javascript troubles",
        class: "javascript",
        content: () => NoTypescriptExample,
      },
      {
        label: "Critical data",
        class: "critical",
        content: () => BackendIsDownExample,
      },
      {
        label: "Optional data",
        class: "optional",
        content: () => OptionalDataExample,
      },
      {
        label: "Third party scripts",
        class: "third-party",
        content: () => ThirdPartyScriptsExample,
      },
    ]}
  />;
  <VLine reverse height={40} />;
  <HLine />;
});
