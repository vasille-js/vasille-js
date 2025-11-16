import { component, compose, ref } from "vasille-web";
const C = compose(Vasille => {
  const $a = ref(2);
  return {
    $a
  };
});
const C2 = component((Vasille, props) => {});
C({
  callback(data) {
    data.$a?.V;
  }
});
C2({
  $a: ref(1),
  // @ts-expect-error
  callback: () => void 0
});
