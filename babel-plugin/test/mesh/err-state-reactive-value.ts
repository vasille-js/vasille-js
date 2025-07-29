import { state } from "vasille-web";

const S = state(() => {
  let a = 3;

  return { a };
});
