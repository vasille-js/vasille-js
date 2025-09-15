import { compose, ref, set as VasilleSet } from "vasille-web";
let o1 = {
  $x: ref(1)
};
const o2 = {
  $x: ref(1)
};
const C = compose(Vasille => {
  const o3 = {
    $x: ref(1)
  };
  VasilleSet(o1, "$x", 2);
  o2.$x.V = 2;
  o3.$x.V = 3;
});
