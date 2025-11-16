import { view, ref as VasilleRef } from "vasille-web";
const X1View = view(Vasille => {
  const $a = VasilleRef(1);
});
const X2View = view((Vasille, props) => {
  const $a = VasilleRef(props.a);
});
const X3View = view((Vasille, props) => {
  const $a = VasilleRef(1);
  return {
    $a,
    b: props.a
  };
});
const X4View = view(Vasille => {
  const $a = VasilleRef(1);
  return $a.V;
});
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
