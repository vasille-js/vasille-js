import { compose, Slot } from "vasille-dx";

export const C = compose(
  ({
    slot01,
  }: {
    slot01(props: { a: number; b: number }): void;
    slot02?(props: { a: number; b: number }): void;
    slot03?(props: { a: number; b: number }): void;
    slot04?(props: { a: number; b: number }): void;
    slot05?(props: { a: number; b: number }): void;
    slot06?(props: { a: number; b: number }): void;
    slot07?(props: { a: number; b: number }): void;
    slot08?(props: { a: number; b: number }): void;
    slot09?(props: { a: number; b: number }): void;
    slot10?(props: { a: number; b: number }): void;
    slot11?(props: { a: number; b: number }): void;
    slot12?(props: { a: number; b: number }): void;
    slot13?(props: { a: number; b: number }): void;
    slot14?(props: { a: number; b: number }): void;
    slot15?(props: { a: number; b: number }): void;
    slot16?(props: { a: number; b: number }): void;
    slot17?(props: { a: number; b: number }): void;
    slot18?(props: { a: number; b: number }): void;
    slot19?(props: { a: number; b: number }): void;
  }) => {
    <Slot model={slot01} a={1} b={2} />;
  },
);

export const C1 = compose(() => {
  <C
    slot01={({ a, b }) => {
      console.log(a, b);
      debugger;
    }}
    slot02={({ a, b }) => {
      console.log(a, b);

      do {
        b > 1 && <div />;
      } while (b < 1);
    }}
    slot03={({ a, b }) => {
      console.log(a, b);

      for (const key in {}) {
        key.length > 1 ? <div /> : 0;
      }
    }}
    slot04={({ a, b }) => {
      console.log(a, b);

      switch (a) {
        case 1:
          a > 1 ? 2 : <div />;
          break;
      }
    }}
    slot05={({ a, b }) => {
      console.log(a, b);

      while (b < 1) {
        <div />;
      }
    }}
    slot06={({ a, b }) => {
      console.log(a, b);

      for (const item of []) {
        <div />;
      }
    }}
    slot07={({ a, b }) => {
      console.log(a, b);

      err: <div />;
    }}
    slot08={({ a, b }) => {
      console.log(a, b);

      try {
        <div />;
      } catch (e) {
        console.log(e);
      }
    }}
    slot09={({ a, b }) => {
      console.log(a, b);

      try {
        console.log(1);
      } catch (e) {
        <div />;
      }
    }}
    slot10={({ a, b }) => {
      console.log(a, b);

      try {
        console.log(1);
      } finally {
        <div />;
      }
    }}
    slot11={({ a, b }) => {
      console.log(a, b);

      for (let i = 0; i < 9; i++) {
        <div />;
      }
    }}
    slot12={({ a, b }) => {
      console.log(a, b);

      if (a > 1) {
        <div />;
      }
    }}
    slot13={({ a, b }) => {
      console.log(a, b);

      if (a > 1) {
        console.log(a);
      } else {
        <div />;
      }
    }}
    slot19={() => <div />}
  />;
});
