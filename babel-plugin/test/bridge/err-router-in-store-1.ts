import { beforeMount, router, store } from "vasille-web";

export const sStore = store(() => {
  beforeMount(() => router());

  return {};
});
