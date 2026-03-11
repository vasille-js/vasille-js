import { share, store } from "steel-frame";

const userStore = store(() => {
  share("a", "a");
  return { a: 1 };
});
