import { compose } from "vasille-web";

const C = compose(() => {
  let $a = 0.5;
  const b = 0;

  <video bind:volume={$a} />;
  <video bind:volume={b} />;
  <video bind:volume={1} />;
  <video bind:volume={$a + 0.1} />;
  <video bind:volume={b + 0.1} />;
  // @ts-expect-error
  <video bind:volume />;
  <input bind:value="value" />;
});
