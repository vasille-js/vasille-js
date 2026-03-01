import { component, Slot } from "steel-frame";

interface Props {
  isDark: boolean;
  slot(): void;
}

export const Keyword = component<Props>(({ isDark, slot }) => {
  <span style={{ color: isDark ? "#ff946a" : "#b20000" }}>
    <Slot model={slot} />
  </span>;
});
