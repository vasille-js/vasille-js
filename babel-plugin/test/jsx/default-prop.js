import { compose, ref as VasilleRef } from "vasille-web";
const C1 = compose((Vasille, props) => {});
const C2 = compose(Vasille => {
  C1({
    bool: true,
    "$bool": VasilleRef(true)
  }, Vasille);
});
