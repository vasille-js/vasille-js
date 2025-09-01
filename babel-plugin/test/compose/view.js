import { view, ref as VasilleRef } from "vasille-web";
const X1View = view(Vasille => {
  const $a = VasilleRef(1, "a");
}, "X1View");
const X2View = view((Vasille, props) => {
  const $a = VasilleRef(props.a, "a");
}, "X2View");
const X3View = view((Vasille, props) => {
  const $a = VasilleRef(1, "a");
  return {
    $a,
    b: props.a
  };
}, "X3View");
const X4View = view(Vasille => {
  const $a = VasilleRef(1, "a");
  return $a.V;
}, "X4View");
X1View({});
X2View({
  a: 1
});
X3View({
  a: 1,
  callback(data) {
    data.$a?.V;
    data.b;
  }
});
X4View({
  callback(data) {
    data;
  }
});
