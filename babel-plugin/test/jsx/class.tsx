import { compose } from "vasille-dx";

export const C = compose(() => {
  let a = "a";

  <div class={["static1", "static2", a, a === "b" && "aIsB"]} />;
});
