import { compose, ref as VasilleRef } from "vasille-web";
const C = compose((Vasille, {
  ["$1"]: $1 = VasilleRef(2)
}) => {
  const {
    ["$a1"]: $a2 = VasilleRef()
  } = {
    ["$a1"]: VasilleRef($1.V)
  };
});