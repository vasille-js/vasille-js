import { component, dark, Slot, styleSheet } from "vasille-web";

interface Props {
  description?(props: { classes: string[] }): void;
}

export const DoubleDescription = component(({ description }: Props) => {
  <div class={[styles.container]}>
    <Slot model={description} classes={[styles.dark]} />
    <Slot model={description} classes={[styles.light]} />
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
    transition: "top 0.2s ease-in-out",
  },
  dark: {
    color: "#8E8C8C",
    opacity: [0, dark(1)],
    transition: "opacity 0.2s ease-in-out",
  },
});
