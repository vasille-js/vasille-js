import { compose, ref, set as VasilleSet, safe as VasilleSafe } from "vasille-web";
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
  VasilleSafe(() => VasilleSet(o1, "$x", 2))();
  VasilleSafe(() => o2.$x.V = 2)();
  VasilleSafe(() => o3.$x.V = 3)();
});
