import { component, ref } from "vasille-web";
const C = component(Vasille => {
  const $a = ref(0, "a");
  return {
    $a
  };
}, "C");
const C2 = component((Vasille, props) => {}, "C2");
C({
  callback(data) {
    data.$a;
  },
  // @ts-expect-error
  slot() {}
});
C2({
  $a: ref(1),
  slot: 2
});
