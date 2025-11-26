import { store } from "steel-frame";

const userStore = store(() => {
  let $a = 1;

  return { $a };
});

userStore.$a satisfies number;
