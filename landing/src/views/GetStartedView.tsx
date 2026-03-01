import { component, styleSheet, view } from "steel-frame";
import { FeatureRow } from "../components/feature/FeatureRow.js";
import { FeatureKey } from "../components/feature/FeatureKey.js";
import { FeatureTitle } from "../components/feature/FeatureTitle.js";
import { FeatureDescription } from "../components/feature/FeatureDescription.js";
import { CodeTabs } from "../components/code-block/CodeTabs.js";
import { VLine } from "../components/VLine.js";
import { ComponentExample } from "../components/code-block/examples/ComponentExample.js";
import { TemplateExample } from "../components/code-block/examples/TemplateExample.js";
import { ReactiveExample } from "../components/code-block/examples/ReactiveExample.js";
import { PropertiesExample } from "../components/code-block/examples/PropertiesExample.js";
import { DomExample } from "../components/code-block/examples/DomExample.js";
import { SlotsExample } from "../components/code-block/examples/SlotsExample.js";
import { HLine } from "../components/HLine.js";

export const GetStartedView = view(() => {
  <FeatureRow>
    <FeatureKey>GET STARTED</FeatureKey>
    <FeatureTitle>The first steps are simple</FeatureTitle>
    <FeatureDescription
      content={({ isDark }) => {
        const color = isDark ? "#ff946a" : "#0302DF";

        <>
          Scaffold your first project via{" "}
          <span class={styles.code} style={{ color }}>
            npm create steel-frame
          </span>{" "}
          and open it in your favorite editor!
        </>;
      }}
    ></FeatureDescription>
  </FeatureRow>;
  <CodeTabs
    storageKey={"get-started"}
    tabs={[
      {
        label: "Declare a component",
        class: "comp",
        content: () => ComponentExample,
      },
      {
        label: "Add data to templates",
        class: "data",
        content: () => TemplateExample,
      },
      {
        label: "Add reactive logic",
        class: "logic",
        content: () => ReactiveExample,
      },
      {
        label: "Add properties",
        class: "props",
        content: () => PropertiesExample,
      },
      { label: "Access DOM directly", class: "dom", content: () => DomExample },
      {
        label: "Add children via slots",
        class: "slot",
        content: () => SlotsExample,
      },
    ]}
  />;
  <VLine reverse height={40} />;
  <HLine />;
});

const styles = styleSheet({
  code: {
    "font-family": "FM, monospace",
    "font-size": 13,
    "white-space": "nowrap",
  },
});
