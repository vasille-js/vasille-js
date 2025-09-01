import { beforeMount, router, store } from "vasille-web";

const sStore = store(() => {
  beforeMount(() => router());

  return {};
});
