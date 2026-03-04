import { view } from "steel-frame";
import { FeatureRow } from "../components/feature/FeatureRow.js";
import { FeatureKey } from "../components/feature/FeatureKey.js";
import { FeatureTitle } from "../components/feature/FeatureTitle.js";
import { Accordion } from "../components/Accordion.js";
import { VLine } from "../components/VLine.js";
import { HLine } from "../components/HLine.js";

export const ExperienceView = view(() => {
  <FeatureRow>
    <FeatureKey>Experience</FeatureKey>
    <FeatureTitle>The Developer Experience You've Been Missing</FeatureTitle>
  </FeatureRow>;
  <Accordion
    items={[
      {
        id: "peace",
        title: "Peace of Mind as Standard",
        descTitle: "Friday 5 PM deployments? Now they're routine.",
        descBody:
          "Deploy with confidence even under pressure. " +
          "Built-in fault isolation keeps production stable, " +
          "so last-minute changes feel safe, predictable, " +
          "and entirely unremarkable — exactly how deployments should be.",
        link: "#",
        maskPosX: 0,
        maskPosY: 0,
      },
      {
        id: "speed",
        title: "The Speed You Crave",
        descTitle: "Instant feedback, no waiting.",
        descBody:
          "SteelFrame's hot-reloading and instant feedback " +
          "make it easy to iterate quickly, " +
          "even when you're working on a complex app.",
        link: "#",
        maskPosX: 256,
        maskPosY: 0,
      },
      {
        id: "arch",
        title: "Architecture That Scales",
        descTitle: "Modular, scalable, and maintainable.",
        descBody:
          "SteelFrame's modular architecture makes it easy to " +
          "build large-scale apps, " +
          "while still keeping your code organized and maintainable.",
        link: "#",
        maskPosX: 0,
        maskPosY: 256,
      },
      {
        id: "confidence",
        title: "Power of Refactor",
        descTitle: "Refactor Fearlessly with tools you already know.",
        descBody:
          "SteelFrame's robust tooling integrated to IDE " +
          "make it easy to refactor, " +
          "even when you're working on a complex app.",
        link: "#",
        maskPosX: 256,
        maskPosY: 256,
      },
    ]}
    id={"experience"}
  />;
  <VLine reverse height={40} />;
  <HLine />;
});
