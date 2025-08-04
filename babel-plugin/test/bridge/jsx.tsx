import { bridge, compose, Debug } from "vasille-web";

const a = bridge.ref(1);
const o = bridge.ref({ p: 2 });

const C0 = compose(({ x }: { x: number }) => {
  <Debug model={x + bridge.value(a)} />;
});

const C = compose(() => {
  const b = bridge.value(a);
  let c = bridge.value(a);
  let { p } = bridge.value(o);

  <C0 x={bridge.value(a)} />;
  <C0 x={b} />;
  <C0 x={c} />;

  console.log(a, b, c, p);
});
