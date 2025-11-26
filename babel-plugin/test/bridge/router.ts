import { beforeMount, calculate, compose, router } from "steel-frame";

const C = compose(() => {
  let $a = 2;
  const $b = calculate(() => {
    router()?.goTo("/1");

    return $a + 1;
  });

  function goNext() {
    router()?.goTo("/x");
  }

  beforeMount(() => router()?.goTo("/"));
  beforeMount(() => router());
});
