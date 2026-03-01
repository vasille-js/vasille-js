import { dark, For, styleSheet, view } from "steel-frame";
import { FeatureRow } from "../components/feature/FeatureRow.js";
import { FeatureKey } from "../components/feature/FeatureKey.js";
import { FeatureTitle } from "../components/feature/FeatureTitle.js";
import { FeatureDescription } from "../components/feature/FeatureDescription.js";
import laptopPng from "../assets/laptop.avif";
import bugPng from "../assets/bug.avif";
import timePng from "../assets/time.avif";
import itemSvg from "../assets/item.svg";
import { VLine } from "../components/VLine.js";
import { HLine } from "../components/HLine.js";
import { Row } from "../components/code-block/lib/Row.js";

interface CardProps {
  title: string;
  image: string;
  features: string[];
  ease: string;
  originY: number;
}

const CardView = view<CardProps>(
  ({ title, image, features, originY, ease }: CardProps) => {
    <div class={styles.card}>
      <div class={styles.doubleContainer}>
        <div class={[styles.title, styles.light]}>{title}</div>
        <div class={[styles.title, styles.dark]}>{title}</div>
      </div>
      <div
        class={styles.image}
        style={{
          transition: `background-color 3.5s ${ease}, transform 2s ${ease}`,
          "transform-origin": `50% ${originY}%`,
        }}
      >
        <img src={image} alt={title} width={140} height={140} />
      </div>
      <div class={styles.list}>
        <For
          of={features}
          slot={(feature) => {
            <div class={styles.listItem}>
              <div
                class={[styles.listItemIcon]}
                style={{ "mask-image": `url("${itemSvg}")` }}
              />
              <div>{feature}</div>
            </div>;
          }}
        />
      </div>
      <a href={"#"}>
        <div class={styles.overlay}>
          <div class={[styles.title, styles.overlayTitle]}>{title}</div>
          <div class={[styles.overlayIcon, styles.overlayIconBg]} />
          <div
            class={styles.overlayIcon}
            style={{ "mask-image": `url("${itemSvg}")` }}
          />
        </div>
      </a>
    </div>;
  },
);

export const GameChangerView = view(() => {
  <FeatureRow reverse>
    <FeatureKey>Core Features</FeatureKey>
    <FeatureTitle>New Game Changer</FeatureTitle>
    <FeatureDescription>
      Navigate massive codebases with advanced search and analysis tools,
      Identify and resolve issues before they hit production and ship apps that
      feel instant from the very first click, without the bloat.
    </FeatureDescription>
  </FeatureRow>;
  <Row>
    <CardView
      title={"Find Code Instantly"}
      image={laptopPng}
      features={[
        "Code indexing",
        "Cross-reference search",
        "Seamless IDE integration",
      ]}
      ease={"ease-in"}
      originY={60}
    />
    <div class={styles.separator} />
    <CardView
      title={"Fix Bugs at Lightspeed"}
      image={bugPng}
      features={[
        "Time-travel debugging",
        "Automatic bug reporting",
        "Find and fix bugs ASAP",
      ]}
      ease={"ease-in-out"}
      originY={40}
    />
    <div class={styles.separator} />
    <CardView
      title={"Build Blazing-Fast Experiences"}
      image={timePng}
      features={[
        "Surgical updates via reactivity",
        "Under 3kB for ultra-fast loads",
        "Your app responds instantly",
      ]}
      ease={"ease-out"}
      originY={58}
    />
  </Row>;
  <VLine reverse height={40} />;
  <HLine />;
});

const styles = styleSheet({
  card: {
    display: "flex",
    "flex-direction": "column",
    flex: 1,
    "border-radius": 16,
    "background-color": ["#F9F9F9", dark("#2A2A2A")],
    padding: [32, 14],
    position: "relative",
    transition: "background-color 0.2s ease-in-out",
  },
  title: {
    "font-size": 20,
    "letter-spacing": "-0.6px",
    "text-transform": "uppercase",
    padding: [0, 6, 24],
    "min-height": 40,
  },
  image: {
    width: 150,
    height: 150,
    "border-radius": 75,
    "background-color": ["#EDEDED", dark("#383737")],
    display: "flex",
    "align-items": "center",
    "justify-content": "center",
    "align-self": "center",
    transform: ["rotate(360deg)", dark("rotate(0)")],
  },
  list: {
    "padding-top": 20,
  },
  listItem: {
    display: "flex",
    "align-items": "center",
    "font-size": 15,
    "letter-spacing": "-0.3px",
    color: ["#6F6F6F", dark("#858585")],
    transition: "color 0.2s ease-in-out",
  },
  listItemIcon: {
    width: 24,
    height: 24,
    "mask-size": [24, 24],
    "background-color": ["#191919", dark("#EDEDED")],
    transition: "background-color 5s ease-in-out",
  },
  separator: {
    width: 12,
  },
  overlay: {
    position: "absolute",
    inset: 0,
    "border-radius": 16,
    "background-color": ["#EDEDEDCC", dark("#383737CC")],
    padding: [32, 14],
    cursor: "pointer",
    transition: "opacity 0.2s ease-in-out",
    opacity: "0",
    ":hover": {
      opacity: "1",
    },
  },
  overlayIcon: {
    width: 60,
    height: 60,
    "border-radius": 30,
    "background-color": ["#191919", dark("#FFFFFF")],
    right: 14,
    bottom: 32,
    position: "absolute",
    "mask-size": "contain",
  },
  overlayIconBg: {
    "background-color": ["#FFFFFF", dark("#191919")],
  },
  overlayTitle: {
    color: ["#0302df", dark("#ff946a")],
    "text-decoration": "underline",
  },
  doubleContainer: {
    position: "relative",
    width: "fit-content",
    height: "fit-content",
    overflow: "hidden",
  },
  light: {
    position: "absolute",
    transform: ["", dark("translateX(100%)")],
    color: "#191919",
    transition: "transform 0.2s ease-in-out",
    width: "100%",
  },
  dark: {
    color: "#fff",
    opacity: ["0", dark("1")],
    transition: "opacity 0.2s ease-in-out",
  },
});
