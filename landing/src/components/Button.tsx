import { component, dark, styleSheet } from "steel-frame";

interface Props {
  text: string;
  primary?: boolean;
  minWidth?: number;
}

export const Button = component(({ primary, text, minWidth }: Props) => {
  <a
    href={"#"}
    class={[styles.btn, primary ? styles.primary : styles.secondary]}
    type={"button"}
    style={{ "min-width": minWidth }}
  >
    <div class={[styles.text]}>
      <div class={[styles.dark, styles.item]}>{text}</div>
      <div class={[styles.light, styles.item]}>{text}</div>
    </div>
  </a>;
});

const styles = styleSheet({
  btn: {
    padding: [0, 24],
    height: 47,
    "border-radius": 24,
    border: "none",
    margin: 6,
    overflow: "hidden",
    transition: "background 0.2s ease-in-out",
    "font-family": "inherit",
    "font-weight": 500,
    "text-decoration": "none",
  },
  primary: {
    background: ["#0302DF", dark("#8ba1ff")],
    ":hover": {
      background: ["#0100c8", dark("#a0b3ff")],
    },
  },
  secondary: {
    background: ["#191919", dark("#FFFFFF")],
    ":hover": {
      background: ["#232323", dark("#dedede")],
    },
  },
  text: {
    "font-size": 16,
    display: "flex",
    "flex-direction": "column",
    height: 94,
    position: "relative",
    top: ["-47px", dark(0)],
    transition: "top 0.2s ease-in-out",
    "letter-spacing": "-0.32px",
    "align-items": "center",
  },
  item: {
    height: 47,
    display: "flex",
    "align-items": "center",
  },
  light: {
    color: "#fff",
  },
  dark: {
    color: "#191919",
  },
});
