import { store } from "vasille-web";

const sStore = store(() => {
  let $a = 3;

  return { a: $a };
});
