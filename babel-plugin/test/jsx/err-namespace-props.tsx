import { compose } from "steel-frame";

const C = compose((props: { a: unknown }) => {
  <div />;
});

const D = compose(() => {
  // @ts-expect-error
  <C bind:a />;
});
