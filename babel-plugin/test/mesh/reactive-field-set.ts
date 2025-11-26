import { beforeMount, compose, ref } from "steel-frame";

let o1 = {
  $x: ref(1),
};

const o2 = {
  $x: ref(1),
};

const C = compose(() => {
  const o3 = {
    $x: 1,
  };

  beforeMount(() => (o1.$x = 2));
  beforeMount(() => (o2.$x = 2));
  beforeMount(() => (o3.$x = 3));
});
