import { store } from "vasille-web";

const userStore = store(() => {
  let $a = 1;

  return { $a };
});

userStore.$a satisfies number;
