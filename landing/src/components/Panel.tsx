import { component, dark, styleSheet } from "vasille-web";
import logoSvg from "../assets/logo.svg";
import docsSvg from "../assets/docs.svg";
import githubSvg from "../assets/github.svg";
import playgroundSvg from "../assets/playground.svg";
import lightSvg from "../assets/light.svg";
import darkSvg from "../assets/dark.svg";

interface ItemProps {
  src: string;
  text: string;
  href: string;
}

const Item = component(({ src, text, href }: ItemProps) => {
  <a class={[styles.panelItem, "panel-item"]} href={href}>
    <div
      class={[styles.panelItemIcon, "panel-item-icon"]}
      style={{ mask: `url("${src}")` }}
    />
    <div class={styles.panelItemText}>{text}</div>
  </a>;
});

const Switcher = component(() => {
  <div class={[styles.switcher, "theme-switcher"]}>
    <div class={styles.switcherTrack}>
      <div class={styles.switcherKnob} />
    </div>
    <div class={styles.switcherIcon}>
      <img
        class={[styles.switcherIconSvg, styles.switcherIconDark]}
        src={lightSvg}
        alt={"light"}
      />
      <img
        class={[styles.switcherIconSvg, styles.switcherIconLight]}
        src={darkSvg}
        alt={"dark"}
      />
    </div>
  </div>;
});

interface InternalPanelProps {
  fg: string;
  bg: string;
  border: string;
  accent: string;
  className: string;
}

const InternalPanel = component(
  ({ fg, border, bg, accent, className }: InternalPanelProps) => {
    <div
      class={[styles.panel, className]}
      style={{
        "--fg": fg,
        "--bg": bg,
        "--border": border,
        "--accent": accent,
      }}
    >
      <div class={styles.logo} style={{ "mask-image": `url("${logoSvg}")` }} />
      <Item src={docsSvg} text={"Docs"} href={"/docs"} />
      <Item src={playgroundSvg} text={"Playground"} href={"/pg"} />
      <Item src={githubSvg} text={"GitHub"} href={"/github"} />
    </div>;
  },
);

export const Panel = component(() => {
  <InternalPanel
    fg={"#191919"}
    border={"#B2B2B2"}
    bg={"#FFFFFFED"}
    accent={"#0302DF"}
    className={styles.lightPanel}
  />;
  <InternalPanel
    fg={"#FFFFFF"}
    bg={"#191919"}
    border={"#4D4D4DED"}
    accent={"#ff946a"}
    className={styles.darkPanel}
  />;
  <div class={styles.panelSwitcher}>
    <Switcher />
  </div>;
});

const styles = styleSheet({
  panel: {
    position: "absolute",
    width: 96,
    height: "100%",
    display: "flex",
    "flex-direction": "column",
    background: "var(--bg)",
    "border-right": "1px solid var(--border)",
    transition: "left 0.2s ease-in-out",
    "backdrop-filter": "blur(10px)",
  },
  darkPanel: {
    left: ["-97px", dark(0)],
  },
  lightPanel: {
    left: [0, dark("-97px")],
  },
  logo: {
    width: 56,
    height: 56,
    padding: 20,
    margin: [0, 0, 12],
    background: "var(--accent)",
    "mask-position": "center",
    "mask-repeat": "no-repeat",
  },
  panelItem: {
    width: 64,
    height: 47,
    padding: [12, 16],
    display: "flex",
    "flex-direction": "column",
    "align-items": "center",
    "text-decoration": "none",
    color: "var(--fg)",
    ":hover": {
      color: "var(--accent)",
    },
    ":hover > .panel-item-icon": {
      "background-color": "var(--accent)",
    },
    transition: "color 0.2s ease-in-out",
  },
  panelItemText: {
    "font-size": "12px",
    "font-weight": 500,
    margin: [7, 0, 0],
  },
  panelItemIcon: {
    width: 24,
    height: 24,
    "background-color": "var(--fg)",
    transition: "background-color 0.2s ease-in-out",
  },
  panelSwitcher: {
    position: "absolute",
    bottom: 0,
    left: 0,
    width: 96,
    height: 54,
    display: "flex",
    "align-items": "center",
    "flex-direction": "column",
  },
  switcher: {
    margin: 10,
    display: "flex",
    cursor: "pointer",
  },
  switcherTrack: {
    width: 32,
    height: 18,
    "border-radius": 9,
    position: "relative",
    background: ["#191919", dark("#6380FF")],
    transition: "background 0.2s ease-in-out",
  },
  switcherKnob: {
    width: 14,
    height: 14,
    "border-radius": 7,
    background: "#fff",
    position: "absolute",
    top: 2,
    left: [2, dark(16)],
    transition: "left 0.2s ease-in-out",
  },
  switcherIcon: {
    width: 16,
    height: 16,
    margin: [1, 0, 1, 4],
    position: "relative",
  },
  switcherIconSvg: {
    position: "absolute",
    transition: "opacity 0.2s ease-in-out, transform 0.2s ease-in-out",
  },
  switcherIconDark: {
    transform: ["rotate(180deg)", dark("rotate(0deg)")],
    opacity: [0, dark(1)],
  },
  switcherIconLight: {
    opacity: [1, dark(0)],
    transform: ["rotate(0deg)", dark("rotate(720deg)")],
  },
});
