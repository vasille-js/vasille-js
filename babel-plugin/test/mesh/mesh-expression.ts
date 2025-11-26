import { compose } from "steel-frame";

type Composed<In extends object> = ReturnType<typeof compose<In>>;

!compose(() => {}) === false;
let a = 1;

function tag(args: TemplateStringsArray, arg: unknown) {
  return arg;
}

`compose:${compose(() => {})}`;
tag`compose:${compose(() => {})}`;
a = 2;
// @ts-ignore
compose(() => {}) + [];
// @ts-ignore
[] + compose(() => {});
compose(() => {}) ? 1 : 3;
a > 2 ? compose(() => {}) : 3;
a < 3 ? 2 : compose(() => {});
!compose(() => {}) && a > 3;
a < 5 || !compose(() => {});
new String(compose(() => {}));
// @ts-ignore
(0, compose(() => {}));

function* generator() {
  yield 1;
  yield compose(() => {});
}

async function fn() {
  await Promise.resolve(compose(() => {}));
}

const VMap = Map<string, number>;
// @ts-ignore
const v10 = new VMap([[2, a]]);
const Composed: Composed<object> = compose(() => {});

compose(() => {}) as Composed<object>;
<Composed<object>>compose(() => {});
compose(() => {}) satisfies Composed<object>;

() => {
  compose(() => {});
};

const cx = class {
  m() {
    compose(() => {});
  }
};

const obj = { a: 1, b: { c: 2 }, ...{ d: 4 } };
