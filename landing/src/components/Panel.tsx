import { component, dark, mobile, styleSheet, watch } from "steel-frame";
import docsSvg from "../assets/docs.svg";
import githubSvg from "../assets/github.svg";
import playgroundSvg from "../assets/playground.svg";
import lightSvg from "../assets/light.svg";
import darkSvg from "../assets/dark.svg";
import menuSvg from "../assets/menu.svg";

interface ItemProps {
  src: string;
  text: string;
  href: string;
  $active: boolean;
  accessKey: string;
}

const Item = component(({ src, text, href, $active, accessKey }: ItemProps) => {
  <a
    class={[styles.panelItem, "panel-item"]}
    href={href}
    accesskey={$active ? accessKey : undefined}
    tabindex={$active ? "0" : "-1"}
  >
    <div
      class={[styles.panelItemIcon, "panel-item-icon"]}
      style={{ mask: `url("${src}")` }}
    />
    <div class={styles.panelItemText}>{text}</div>
  </a>;
});

const Switcher = component(() => {
  <button
    type={"button"}
    class={[styles.switcher]}
    onclick={() => {
      document.body.classList.toggle("dark");
    }}
  >
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
  </button>;
});

interface InternalPanelProps {
  fg: string;
  bg: string;
  border: string;
  accent: string;
  className: string;
  activeClassName: string;
  lightZ: number;
  darkZ: number;
  $active: boolean;
}

const InternalPanel = component(
  ({
    fg,
    border,
    bg,
    accent,
    className,
    lightZ,
    darkZ,
    $active,
    activeClassName,
  }: InternalPanelProps) => {
    <nav
      role={"navigation"}
      aria-hidden={$active ? "false" : "true"}
      class={[styles.panel, className, $active && activeClassName]}
      style={{
        "--fg": fg,
        "--bg": bg,
        "--border": border,
        "--accent": accent,
        "--light-z": `${lightZ}`,
        "--dark-z": `${darkZ}`,
      }}
    >
      <div class={[styles.logo, "logo"]} />
      <Item
        src={docsSvg}
        text={"Docs"}
        href={"https://deepwiki.com/vasille-js/steel-frame"}
        $active={$active}
        accessKey={"d"}
      />
      <Item
        src={playgroundSvg}
        text={"Playground"}
        href={"#"}
        $active={$active}
        accessKey={"p"}
      />
      <Item
        src={githubSvg}
        text={"GitHub"}
        href={"https://github.com/vasille-js/steel-frame"}
        $active={$active}
        accessKey={"g"}
      />
    </nav>;
  },
);

export const Panel = component(() => {
  let $active = false;
  let $overlayDisplay = false;
  let $overlayActive = false;

  watch(() => {
    if ($active) {
      $overlayDisplay = true;
      requestAnimationFrame(() => {
        $overlayActive = true;
      });
    } else {
      $overlayActive = false;
    }
  });

  <button
    type="button"
    class={[
      styles.overlay,
      $overlayActive && styles.overlayActive,
      $overlayDisplay && styles.overlayDisplay,
    ]}
    onclick={() => ($active = false)}
    ontransitionend={() => {
      if (!$active) {
        $overlayDisplay = false;
      }
    }}
  />;
  <button
    type="button"
    class={styles.burgerButton}
    onclick={() => ($active = true)}
  >
    <div
      class={styles.burgerButtonIcon}
      style={{ "mask-image": `url("${menuSvg}")` }}
    />
    SteelFrameKit
  </button>;
  <InternalPanel
    fg={"#191919"}
    border={"#B2B2B2"}
    bg={"#FFFFFFED"}
    accent={"#0302DF"}
    $active={$active}
    className={styles.lightPanel}
    activeClassName={styles.lightPanelActive}
    lightZ={998}
    darkZ={999}
  />;
  <InternalPanel
    fg={"#FFFFFF"}
    bg={"#191919"}
    border={"#4D4D4DED"}
    accent={"#ff946a"}
    $active={$active}
    className={styles.darkPanel}
    activeClassName={styles.darkPanelActive}
    lightZ={999}
    darkZ={998}
  />;
  <div class={styles.panelSwitcher}>
    <Switcher />
  </div>;
});

const styles = styleSheet({
  panel: {
    position: "fixed",
    width: 96,
    height: "100%",
    display: "flex",
    "flex-direction": "column",
    background: "var(--bg)",
    "border-right": "1px solid var(--border)",
    transition: "left 0.2s ease-in-out",
    "backdrop-filter": "blur(10px)",
    "z-index": ["var(--light-z)", dark("var(--dark-z)")],
    top: 0,
  },
  darkPanel: {
    left: ["-97px", dark(0), mobile(dark("-97px"))],
  },
  darkPanelActive: {
    left: ["-97px", dark(0), mobile(dark(0))],
  },
  lightPanel: {
    left: [0, dark("-97px"), mobile("-97px")],
  },
  lightPanelActive: {
    left: [0, dark("-97px"), mobile(0)],
  },
  logo: {
    width: 56,
    height: 56,
    padding: 20,
    margin: [0, 0, 12],
    background: "var(--accent)",
    "mask-position": "center",
    "mask-repeat": "no-repeat",
    "mask-size": 56,
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
    position: "fixed",
    bottom: 0,
    left: 0,
    width: 96,
    height: 54,
    display: "flex",
    "align-items": "center",
    "flex-direction": "column",
    "z-index": "1000",
  },
  switcher: {
    padding: 10,
    display: "flex",
    cursor: "pointer",
    background: [mobile("#FFFFFF"), dark(mobile("#191919")), "#80808000"],
    transition: "background 0.2s ease-in-out",
    "border-radius": 16,
    border: "none",
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
    left: 0,
    top: 0,
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
  overlay: {
    position: "fixed",
    inset: 0,
    "z-index": "997",
    "background-color": ["#ffffff70", dark("#00000070")],
    opacity: "0",
    border: "none",
    transition: "opacity 0.2s ease-in-out",
    display: "none",
  },
  overlayActive: {
    opacity: "1",
  },
  overlayDisplay: {
    display: [mobile("block")],
  },
  burgerButton: {
    height: 40,
    "border-radius": 25,
    "backdrop-filter": "blur(10px)",
    background: ["#FFFFFFd0", dark("#191919d0")],
    position: "fixed",
    top: 24,
    left: 12,
    overflow: "hidden",
    "z-index": "996",
    "box-sizing": "border-box",
    display: ["none", mobile("flex")],
    cursor: "pointer",
    border: "none",
    padding: 0,
    "align-items": "center",
    color: ["#191919", dark("#fff")],
    transition: "color 1s ease-in-out",
    "font-size": 20,
    "letter-spacing": "-0.54px",
    "font-weight": "500",
    "padding-right": 15,
  },
  burgerButtonIcon: {
    background: ["#191919", dark("#FFFFFF")],
    transition: "background 0.2s ease-in-out",
    "mask-size": [24, 24],
    "mask-position": "center",
    "mask-repeat": "no-repeat",
    height: 24,
    width: 24,
    margin: 8,
  },
});
