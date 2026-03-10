import { dark, styleSheet, view } from "steel-frame";
import { VLine } from "../components/VLine.js";
import { Button } from "../components/Button.js";
import { DoubleTitle } from "../components/DoubleTitle.js";
import { DoubleDescription } from "../components/DoubleDescription.js";
import metalPng from "../assets/metal.avif";
import { centerText, description, h1 } from "../style/text.js";

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
        <h1 class={[h1, centerText, ...classes]} style={{ "max-width": 427 }}>
          Build Fault–Tolerant Web Applications Effortlessly
        </h1>;
      }}
    />
    <div
      style={{
        display: "flex",
        "flex-wrap": "wrap",
        "justify-content": "center",
      }}
    >
      <a class={styles.a} href="https://www.npmjs.com/package/steel-frame">
        <img
          alt="npm"
          src="https://img.shields.io/npm/v/steel-frame?style=flat-square"
        />
      </a>
      <a class={styles.a} href="https://deepwiki.com/vasille-js/steel-frame">
        <img alt="Ask DeepWiki" src="https://deepwiki.com/badge.svg" />
      </a>
      <a
        class={styles.a}
        href="https://coveralls.io/github/vasille-js/steel-frame?branch=v5"
      >
        <img
          alt="Coverage Status"
          src="https://coveralls.io/repos/github/vasille-js/steel-frame/badge.svg?branch=v5"
        />
      </a>
      <a class={styles.a} href="https://github.com/vasille-js/steel-frame">
        <img
          alt="GitHub"
          src="https://img.shields.io/github/last-commit/vasille-js/steel-frame"
        />
      </a>
    </div>
    <DoubleDescription
      description={({ classes }) => {
        <div
          class={[description, centerText, ...classes]}
          style={{ "max-width": 494 }}
        >
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
});

const styles = styleSheet({
  hero: {
    "min-height": "100vh",
    display: "flex",
    "flex-direction": "column",
    "align-items": "center",
    position: "relative",
    overflow: "hidden",
    "@media screen and (min-height: 800px) and (min-width: 1125px)": {
      "min-height": "600px",
    },
    "align-self": "stretch",
    padding: [0, 50],
  },
  metal: {
    position: "absolute",
    opacity: ["0.65", dark("0.8")],
    "transition-timing-function": "ease-in-out",
    "transition-duration": "0.5s",
    "transform-origin": "90% 60%",
    "z-index": "-1",
    "@media(max-width: 1000px) and (max-height: 800px)": {
      display: "none",
    },
  },
  topRight: {
    transform: ["rotate(147.31deg)"],
    width: 456,
    height: 512,
    top: "-129px",
    right: 178,
    "transition-property": "opacity",
    "@media(max-width: 850px)": {
      top: "-200px",
      right: 140,
    },
    "@media(max-width: 650px)": {
      display: "none",
    },
  },
  leftBottom: {
    transform: ["rotate(-49.65deg)"],
    width: 335.73,
    height: 376.97,
    bottom: [0],
    left: ["-100px"],
    "transition-property": "opacity",
    "@media(max-width: 850px)": {
      bottom: "-30px",
    },
    "@media(max-width: 650px)": {
      display: "none",
    },
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
  flex1: {
    flex: 1,
  },
  cta: {
    display: "flex",
    "margin-bottom": 40,
    "flex-wrap": "wrap",
    "justify-content": "center",
  },
  a: {
    margin: 4,
  },
});
