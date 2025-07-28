import { state } from "vasille-dx";

const S = state(() => {
  let a = 3;

  return { a };
});
