import { dark, For, styleSheet, view } from "steel-frame";
import { FeatureRow } from "../components/feature/FeatureRow.js";
import { FeatureKey } from "../components/feature/FeatureKey.js";
import { FeatureTitle } from "../components/feature/FeatureTitle.js";
import { Row } from "../components/code-block/lib/Row.js";
import businessLightAvif from "../assets/businessLight.avif";
import businessDarkAvif from "../assets/businessDark.avif";
import codeLightAvif from "../assets/codeLight.avif";
import codeDarkAvif from "../assets/codeDark.avif";
import itemSvg from "../assets/item.svg";
import { VLine } from "../components/VLine.js";
import { HLine } from "../components/HLine.js";

interface HalfProps {
  number: string;
  why: string;
  images: [string, string];
  list: string[];
  color: string;
  bg: string;
  border: string;
  imageClass: string;
}

const HalfView = view<HalfProps>(
  ({ why, list, color, imageClass, images, border, bg, number }: HalfProps) => {
    <div class={styles.half}>
      <div class={[styles.number, color]}>{number}</div>
      <div class={styles.hr} />
      <div class={styles.why}>{why}</div>
      <div class={[styles.container, border]}>
        <div class={[styles.innerContainer, border]}>
          <div
            class={[styles.image, imageClass]}
            style={{
              "background-image": `url("${images[0]}"), url("${images[1]}")`,
            }}
          />
          <div class={styles.list}>
            <For
              of={list}
              slot={(item) => {
                <div class={styles.listItem}>
                  <div
                    class={[styles.itemIcon, bg]}
                    style={{ "mask-image": `url("${itemSvg}")` }}
                  />
                  <div class={styles.itemText}>{item}</div>
                </div>;
              }}
            />
          </div>
        </div>
      </div>
    </div>;
  },
);

export const GreatForView = view(() => {
  <FeatureRow reverse>
    <FeatureKey>Impact</FeatureKey>
    <FeatureTitle>
      Good for Business
      <br />
      Great for Developers
    </FeatureTitle>
  </FeatureRow>;
  <Row class={styles.columnOnTablet}>
    <HalfView
      number={"01"}
      why={"Why It Matters for Your Business"}
      images={[businessLightAvif, businessDarkAvif]}
      list={[
        "Less downtime = More revenue",
        "Faster time-to-market for new features",
        "Reduced onboarding costs for new hires",
      ]}
      color={styles.blueColor}
      bg={styles.blueBg}
      border={styles.blueBorder}
      imageClass={styles.imageLeft}
    />
    <div class={styles.delimiter} />
    <HalfView
      number={"02"}
      why={"Why Developers Love It"}
      images={[codeDarkAvif, codeLightAvif]}
      list={[
        "Rapid debugging with advanced tooling",
        "Code confidently without breaking production",
        "Focus on business logic instead of framework complexities",
      ]}
      color={styles.yellowColor}
      bg={styles.yellowBg}
      border={styles.yellowBorder}
      imageClass={styles.imageRight}
    />
  </Row>;
  <VLine reverse height={50} />;
  <HLine />;
});

const styles = styleSheet({
  half: {
    flex: "1",
    "border-radius": 16,
    padding: [24, 14, 14],
    "background-color": ["#F9F9F9", dark("#2A2A2A")],
    transition: "background-color 0.2s ease-in-out",
    "max-width": "506px",
    "align-self": "center",
    width: "100%",
    "box-sizing": "border-box",
  },
  number: {
    "font-size": 35,
    "font-weight": "500",
    "letter-spacing": "-1.05px",
    "line-height": "1.10",
    "text-transform": "uppercase",
    margin: [0, 0, 12],
    transition: "color 0.2s ease-in-out",
  },
  hr: {
    height: 2,
    "background-color": [dark("#373737"), "#EFEFEF"],
    transition: "background-color 0.2s ease-in-out",
  },
  why: {
    "font-size": 20,
    "letter-spacing": "-0.6px",
    "text-transform": "uppercase",
    "font-weight": "500",
    "margin-bottom": 24,
    color: "#B0B0B0",
  },
  container: {
    "border-width": 2,
    "border-style": "solid",
    padding: 2,
    "border-radius": 16,
    "background-color": [dark("#191919"), "#fff"],
    transition:
      "border-color 0.2s ease-in-out, background-color 0.2s ease-in-out",
  },
  innerContainer: {
    "border-width": 2,
    "border-style": "solid",
    "border-radius": 12,
    display: "flex",
    "flex-direction": "column",
    "align-items": "stretch",
    overflow: "hidden",
    "background-color": [dark("#383737"), "#EDEDED"],
    transition:
      "border-color 0.2s ease-in-out, background-color 0.2s ease-in-out",
  },
  list: {
    padding: [24, 12, 32],
    display: "flex",
    "flex-direction": "column",
  },
  listItem: {
    display: "flex",
    "align-items": "flex-start",
  },
  itemIcon: {
    width: 24,
    height: 24,
    "mask-size": [24, 24],
    transition: "background-color 0.2s ease-in-out",
  },
  itemText: {
    "font-size": 15,
    "letter-spacing": "-0.3px",
    color: [dark("#C5C5C5"), "#605F5F"],
    transition: "color 0.2s ease-in-out",
    "margin-left": 2,
    "line-height": 18,
    padding: [3, 0, 3, 3],
  },
  yellowColor: {
    color: ["#FD4B05", dark("#ff946a")],
  },
  yellowBg: {
    "background-color": ["#FD4B05", dark("#ff946a")],
  },
  yellowBorder: {
    "border-color": ["#FD4B05", dark("#ff946a")],
  },
  blueColor: {
    color: ["#0302DF", dark("#6380FF")],
  },
  blueBg: {
    "background-color": ["#0302DF", dark("#6380FF")],
  },
  blueBorder: {
    "border-color": ["#0302DF", dark("#6380FF")],
  },
  image: {
    "aspect-ratio": "1372 / 394",
    transition: "transform 3.5s ease 0.2s",
    "background-size": "50% 101%",
    "background-repeat": "no-repeat",
    "background-position": "top left, top right",
    width: "200%",
  },
  imageLeft: {
    transform: ["translateX(0)", dark("translateX(-50%)")],
  },
  imageRight: {
    transform: ["translateX(-50%)", dark("translateX(0)")],
  },
  delimiter: {
    width: 12,
    height: 12,
  },
  columnOnTablet: {
    "@media screen and (max-width: 800px)": {
      "flex-direction": "column",
    },
  },
});
