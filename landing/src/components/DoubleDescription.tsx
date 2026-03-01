import { component, dark, Slot, styleSheet } from "steel-frame";

interface Props {
  description?(props: { classes: string[]; isDark: boolean }): void;
}

export const DoubleDescription = component(({ description }: Props) => {
  <div class={[styles.container]}>
    <Slot
      model={description}
      classes={[styles.dark, styles.text]}
      isDark={true}
    />
    <Slot
      model={description}
      classes={[styles.light, styles.text]}
      isDark={false}
    />
  </div>;
});

const styles = styleSheet({
  container: {
    position: "relative",
    width: "fit-content",
    height: "fit-content",
    overflow: "hidden",
  },
  light: {
    position: "absolute",
    top: ["0", dark("-100%")],
    color: "#858585",
    transition: "top 1s ease-in-out",
  },
  dark: {
    color: "#8E8C8C",
    opacity: ["0", dark("1")],
    transition: "opacity 1s ease-in-out",
  },
  text: {
    "font-size": 15,
    "letter-spacing": "-0.3px",
  },
});
