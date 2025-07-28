import { compose, reactiveObject } from "vasille-dx";

export const C = compose(() => {
  let o = reactiveObject({});
});
