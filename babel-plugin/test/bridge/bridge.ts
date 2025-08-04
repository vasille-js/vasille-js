import { bind, bridge, compose, ref } from "vasille-web";

let a = bridge.ref(2);
let b = bridge.bind(bridge.value(a) + 1);
let c = bridge.calculate(() => {
  return bridge.value(a) + bridge.value(b);
});
const d = bridge.arrayModel();
const e = bridge.arrayModel([1, 2, 3]);
const f = bridge.setModel([1, 2, 3]);
const g = bridge.mapModel([
  [1, 2],
  [2, 3],
]);
const h = bridge.reactiveObject({ a: 1, b: 2 });
const i = 0;

bridge.setValue(h.a, 3);

bridge.watch(() => {
  console.log(bridge.value(c), bridge.stored(a));
});

const C = compose(() => {
  let z = 0;
  const o = { a: 1 };
  const y = bridge.bind(z);
  const x = bridge.bind(23);
  let embed = ref(bridge.value(a));
  let hybrid = bind(z + bridge.value(a));

  bridge.stored(z);
  bridge.stored(o.a);
  bridge.stored(i);

  bridge.destroy(x);

  function overrideTest() {
    const bridge = {
      ref(x: unknown) {
        return x;
      },
    };
    const xx = bridge.ref(2);
  }
});
