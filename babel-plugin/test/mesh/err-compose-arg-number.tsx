import { compose, For } from "steel-frame";

const C = compose((props: { slot: (a: number, b: number) => void }) => {});

const C1 = compose(() => {
  <C
    slot={(a: number, b: number) => {
      <div>
        {a}, {b}
      </div>;
    }}
  />;
});
