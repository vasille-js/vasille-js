import { compose, watch, set as VasilleSet } from "vasille-web";
const C = compose((Vasille, props) => {
  (() => {
    VasilleSet(props, "$a", props.$a?.V + 1);
    VasilleSet(props, "$a", 2);
  })();
  function update() {
    VasilleSet(props, "$b", props.$b?.V && true);
    VasilleSet(props, "$b", false);
  }
});