import { compose } from "vasille-dx";

const C = compose((props: { a: unknown }) => {
  <div />;
});

const D = compose(() => {
  <C bind:a />;
});
