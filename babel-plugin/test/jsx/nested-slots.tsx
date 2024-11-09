import { Slot, compose } from "vasille-dx";

export const C1 = compose(({ slot }: { slot(props: { a: number }): void }) => {
  let a = 0;

  <div>
    <Slot model={slot} a={a} />
  </div>;
});

export const C2 = compose(() => {
  <C1
    slot={({ a }) => {
      console.log(a);
    }}
  />;
  <C1
    slot={({ a }) => {
      console.log(a);

      <>{a}</>;
    }}
  />;
  <C1
    slot={() => {
      <div />;
    }}
  />;
});
