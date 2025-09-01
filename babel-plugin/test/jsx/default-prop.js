import { compose, ref as VasilleRef } from "vasille-web";
const C1 = compose((Vasille, props) => {}, "C1");
const C2 = compose(Vasille => {
  C1({
    bool: true,
    "$bool": VasilleRef(true)
  }, Vasille);
}, "C2");
