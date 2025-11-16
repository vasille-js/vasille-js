import { component, ref } from "vasille-web";
const C = component(Vasille => {
  const $a = ref(0);
  return {
    $a
  };
});
const C2 = component((Vasille, props) => {});
C({
  callback(data) {
    data.$a?.V;
  },
  // @ts-expect-error
  slot() {}
});
C2({
  $a: ref(1),
  slot: 2
});
