import { compose, reactiveObject } from "vasille-dx";

export const C = compose(() => {
  // @ts-ignore
  const o = reactiveObject(2);
});
