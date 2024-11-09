import { compose } from "vasille-dx";

export const C = compose(() => {
  let a = 0.5;
  const b = 0;

  <video bind:volume={a} />;
  <video bind:volume={b} />;
  <video bind:volume={1} />;
});
