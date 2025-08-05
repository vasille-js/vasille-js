import { compose, Debug, $ as VasilleWeb } from "vasille-web";
const C0 = compose((Vasille, {
  x
}) => {
  Debug({
    model: x.$
  }, Vasille);
}, "VasilleWeb:C0");
class Class {
  x = VasilleWeb.r(2);
}
const C1 = compose((Vasille, props) => {
  const cx = props.cx.$;
  Debug({
    model: cx.x
  }, Vasille);
  Debug({
    model: cx.x
  }, Vasille);
}, "VasilleWeb:C1");
const C = compose(Vasille => {
  const b = VasilleWeb.r(2);
  const c = new Class();
  C0({
    x: b
  }, Vasille);
  C1({
    cx: c
  }, Vasille);
}, "VasilleWeb:C");
