import { afterMount, compose, Slot } from "vasille-web";

const C = compose(
  ({
    slot02,
  }: {
    slot01(props: { a: number; b: number }): void;
    slot02?(props: { $a: number; $b: number }): void;
    slot03(): void;
  }) => {
    <Slot model={slot02} $a={1} $b={2} />;
  },
);

const C1 = compose(() => {
  <C
    slot01={({ a, b }) => {
      console.log(a, b);
    }}
    slot02={({ $a, $b }) => {
      <div />;
      afterMount(() => console.log($a, $b));
    }}
    slot03={() => <div />}
  />;
});
