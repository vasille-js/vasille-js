import { compose, reactiveObject } from "vasille-web";

export const C = compose(() => {
  // @ts-ignore
  const o = reactiveObject(2);
});
