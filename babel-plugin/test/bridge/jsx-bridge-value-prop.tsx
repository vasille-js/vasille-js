import { bridge, BridgeValue, compose, Debug } from "vasille-web";


const C0 = compose(({ x }: { x: BridgeValue<number> }) => {
  <Debug model={bridge.value(x)} />;
});

class Class {
  public readonly x = bridge.ref(2);
}

const C1 = compose((props: { cx: Class }) => {
  const cx = bridge.stored(props.cx);

  <Debug model={bridge.value(cx.x)} />;
  <Debug model={cx.x} />;
});

const C = compose(() => {
  const b = bridge.ref(2);
  const c = new Class();

  <C0 x={b} />;
  <C1 cx={c} />;
});
