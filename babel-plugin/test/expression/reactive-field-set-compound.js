import { compose, ref, watch, extract as VasilleExtract, set as VasilleSet } from "vasille-web";
let state = {
  $value: ref(1)
};
const list = [0];
const C = compose(Vasille => {
  const index = 0;
  (() => {
    VasilleSet(state, "$value", VasilleExtract(state.$value) + 2);
    VasilleSet(list, index, VasilleExtract(list[index]) + 3);
  })();
});