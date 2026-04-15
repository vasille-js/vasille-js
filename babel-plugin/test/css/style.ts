import { styleSheet, dark, prefersDark, prefersLight, mobile, laptop, tablet, theme } from "steel-frame";

export const styles = styleSheet({
  c1: {
    margin: 0,
    opacity: 1,
    padding: [10, 5],
    display: "block",
  },
  c2: {
    ":hover": {
      margin: 0,
      padding: [10, 5],
      display: "block",
      flex: 1,
    },
  },
  c3: {
    "@media (max-width: 1000px)": {
      ":active": {
        margin: 0,
        padding: [10, 5],
        display: "block",
      },
    },
  },
  c4: {
    margin: [laptop(40), tablet(20), mobile(10)],
  },
  c5: {
    padding: [laptop(laptop([50, 45])), tablet(mobile([10, 5]))],
  },
  c6: {
    color: [prefersLight("#fff"), prefersDark("#222")],
  },
  c7: {
    background: ["#fff", dark("#000")],
  },
  c8: {
    color: [theme("red", "#f00"), theme("green", "#0f0"), theme("blue", "#00f")],
  },
  c9: {
    display: ["block", "flex"],
  },
});
