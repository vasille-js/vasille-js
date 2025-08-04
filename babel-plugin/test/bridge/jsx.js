import { compose, Debug, $ as VasilleWeb } from "vasille-web";
const a = VasilleWeb.ref(1);
const o = VasilleWeb.ref({
  p: 2
});
const C0 = compose((Vasille, {
  x
}) => {
  Debug({
    model: Vasille.expr((Vasille_x, Vasille_a) => Vasille_x + Vasille_a, [x, a])
  }, Vasille);
}, "VasilleWeb:C0");
const C = compose(Vasille => {
  const b = a.$;
  const c = Vasille.ref(a.$, "c");
  let {
    p
  } = o.$;
  C0({
    x: a
  }, Vasille);
  C0({
    x: b
  }, Vasille);
  C0({
    x: c
  }, Vasille);
  console.log(a, b, c.$, p);
}, "VasilleWeb:C");
