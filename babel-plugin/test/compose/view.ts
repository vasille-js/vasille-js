import { view } from "vasille-web";

const X1View = view(() => {
  let $a = 1;
});

const X2View = view((props: { a: number }) => {
  let $a = props.a;
});

const X3View = view((props: { a: number }) => {
  let $a = 1;

  return { $a, b: props.a };
});

const X4View = view(() => {
  let $a = 1;

  return $a;
});

X1View({});

X2View({ a: 1 });

X3View({
  a: 1,
  callback(data) {
    data.$a satisfies number;
    data.b satisfies number;
  },
});

X4View({
  callback(data) {
    data satisfies number;
  },
});
