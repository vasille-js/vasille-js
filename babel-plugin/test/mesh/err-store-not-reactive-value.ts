import { store } from "steel-frame";

const sStore = store(() => {
  let $a = 3;

  return {
    $a() {
      return $a;
    },
  };
});
