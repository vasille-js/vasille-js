import { calculate, router, store } from "vasille-web";

const sStore = store(() => {
  let $a = 2;
  const b = calculate(() => {
    router()?.goTo("/1");

    return $a + 1;
  });

  return {};
});
