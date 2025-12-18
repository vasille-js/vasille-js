import { dark, styleSheet, view } from "vasille-web";
import { HLine } from "../components/HLine.js";
import { VLine } from "../components/VLine.js";
import { Button } from "../components/Button.js";
import { DoubleTitle } from "../components/DoubleTitle.js";
import { DoubleDescription } from "../components/DoubleDescription.js";
import metalPng from "../assets/metal.png";

export const HeroView = view(() => {
  <div class={styles.hero}>
    <img class={[styles.metal, styles.topRight]} src={metalPng} alt={"metal"} />
    <img
      class={[styles.metal, styles.leftBottom]}
      src={metalPng}
      alt={"metal"}
    />
    <VLine />
    <span class={styles.title}>SteelFrameKit</span>
    <DoubleTitle
      title={({ classes }) => {
        <h1 class={[styles.h1, ...classes]}>
          Build Fault–Tolerant Web Applications Effortlessly
        </h1>;
      }}
    />
    <DoubleDescription
      description={({ classes }) => {
        <div class={[styles.description, ...classes]}>
          Imagine shipping features without fearing production breakdowns. With
          intuitive state management and minimal boilerplate, focus on what
          matters - building great products
        </div>;
      }}
    />
    <div class={styles.cta}>
      <Button text={"Get started"} primary minWidth={161} />
      <Button text={"See Live Demo"} minWidth={161} />
    </div>
    <VLine reverse />
  </div>;
  <HLine />;
});

const styles = styleSheet({
  hero: {
    "min-height": "100vh",
    display: "flex",
    "flex-direction": "column",
    "align-items": "center",
    position: "relative",
    overflow: "hidden",
    "@media screen and (min-height: 1500px)": {
      "min-height": "800px",
    },
  },
  metal: {
    position: "absolute",
    opacity: ["0.65", dark("0.8")],
    "transition-timing-function": "ease-in-out",
    "transition-duration": "0.5s",
    "transform-origin": "90% 60%",
    "z-index": "-1",
  },
  topRight: {
    transform: ["rotate(126.31deg)", dark("rotate(147.31deg)")],
    width: 456,
    height: 512,
    top: [22, dark("-129px")],
    right: [148, dark(178)],
    "transition-property": "transform, opacity, top, right",
  },
  leftBottom: {
    transform: ["rotate(-48.65deg)", dark("rotate(-49.65deg)")],
    width: 335.73,
    height: 376.97,
    bottom: [108, dark(0)],
    left: ["-120px", dark("-100px")],
    "transition-property": "transform, opacity, left, bottom",
  },
  title: {
    margin: [40, 0, 32],
    padding: [5, 10],
    "border-width": 2,
    "border-style": "solid",
    "border-color": ["#191919", dark("#fff")],
    "border-radius": 17,
    color: ["#191919", dark("#fff")],
    transition: "color 1s ease-in-out, border-color 1s ease-in-out",
  },
  h1: {
    "font-size": 35,
    "letter-spacing": "-3%",
    "line-height": "1.10",
    "text-align": "center",
    "max-width": 427,
    "text-transform": "uppercase",
    margin: [0, 0, 12],
  },
  description: {
    "font-size": 15,
    "line-height": "120%",
    "letter-spacing": "-2%",
    "max-width": 494,
    "margin-bottom": 18,
    "text-align": "center",
  },
  flex1: {
    flex: 1,
  },
  cta: {
    display: "flex",
    "margin-bottom": 40,
  },
});
