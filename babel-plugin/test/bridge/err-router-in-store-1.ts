import { beforeMount, router, store } from "steel-frame";

const sStore = store(() => {
  beforeMount(() => router());

  return {};
});
