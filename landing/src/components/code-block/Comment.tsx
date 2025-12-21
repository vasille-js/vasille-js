import { component, Slot } from "vasille-web";

interface Props {
  isDark: boolean;
  slot(): void;
}

export const Comment = component<Props>(({ isDark, slot }) => {
  <span style={{ color: isDark ? "#a5a5a5" : "#585858" }}>
    <Slot model={slot} />
  </span>;
});
