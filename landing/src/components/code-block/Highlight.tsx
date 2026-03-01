import { component, Slot } from "steel-frame";

interface Props {
  isDark: boolean;
  slot(): void;
}

export const Highlight = component<Props>(({ isDark, slot }) => {
  <span
    style={{ color: isDark ? "#899fff" : "#0302DF", "font-weight": "bold" }}
  >
    <Slot model={slot} />
  </span>;
});
