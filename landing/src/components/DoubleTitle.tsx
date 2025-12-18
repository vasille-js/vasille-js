import { component, dark, Slot, styleSheet } from "vasille-web";

interface Props {
  title?(props: { classes: string[]; isDark: boolean }): void;
}

export const DoubleTitle = component(({ title }: Props) => {
  <div class={[styles.container]}>
    <Slot model={title} classes={[styles.dark]} isDark={true} />
    <Slot model={title} classes={[styles.light]} isDark={false} />
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
    top: ["0", dark("100%")],
    color: "#191919",
    transition: "top 0.2s ease-in-out",
  },
  dark: {
    color: "#fff",
    opacity: ["0", dark("1")],
    transition: "opacity 0.2s ease-in-out",
  },
});
