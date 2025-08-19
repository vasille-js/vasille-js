import { beforeMount, router, store } from "vasille-web";

export const S = store(() => {
  beforeMount(() => router());

  return {};
});
