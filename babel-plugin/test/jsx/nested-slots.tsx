import { Slot, compose, afterMount, beforeMount } from "steel-frame";

const C1 = compose(({ slot }: { slot(props: { $a: number }): void }) => {
  let $a = 0;

  <div>
    <Slot model={slot} $a={$a} />
  </div>;
});

const C2 = compose(() => {
  let $a = 2;

  <C1
    slot={({ $a }) => {
      console.log($a);
    }}
  />;
  <C1
    slot={({ $a }) => {
      beforeMount(() => console.log($a));

      <>{$a}</>;
    }}
  />;
  <C1
    slot={() => {
      <div />;
    }}
  />;

  afterMount(() => console.log($a));
});
