import { store } from "vasille-web";

const S = store(() => {
  let $a = 3;

  return { $a() {
    return $a;
    } };
});
