import { component, Slot } from "steel-frame";
import { orangeDark, orangeLight } from "../../style/text.js";

interface Props {
  isDark: boolean;
  slot(): void;
}

export const Keyword = component<Props>(({ isDark, slot }) => {
  <span class={isDark ? orangeDark : orangeLight}>
    <Slot model={slot} />
  </span>;
});
