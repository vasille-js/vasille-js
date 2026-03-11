import { compose } from "vasille-web";
!compose(Vasille => {}) === false;
let a = 1;
function tag(args, arg) {
  return arg;
}
`compose:${compose(Vasille => {})}`;
tag`compose:${compose(Vasille => {})}`;
a = 2;
// @ts-ignore
compose(Vasille => {}) + [];
// @ts-ignore
[] + compose(Vasille => {});
compose(Vasille => {}) ? 1 : 3;
a > 2 ? compose(Vasille => {}) : 3;
a < 3 ? 2 : compose(Vasille => {});
!compose(Vasille => {}) && a > 3;
a < 5 || !compose(Vasille => {});
new String(compose(Vasille => {}));
// @ts-ignore
0, compose(Vasille => {});
function* generator() {
  yield 1;
  yield compose(Vasille => {});
}
async function fn() {
  await Promise.resolve(compose(Vasille => {}));
}
const VMap = Map;
// @ts-ignore
const v10 = new VMap([[2, a]]);
const Composed = compose(Vasille => {});
compose(Vasille => {});
compose(Vasille => {});
compose(Vasille => {});
() => {
  compose(Vasille => {});
};
const cx = class {
  m() {
    compose(Vasille => {});
  }
};
const o1 = {
  e: 1
};
const obj = {
  a: 1,
  b: {
    c: 2
  },
  ...{
    d: 4
  },
  ...o1
};
