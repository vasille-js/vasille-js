import { For, compose } from "vasille-dx";

export const C = compose(() => {
  const a = [1, 2, 3];

  <For of={a} slot={value => {
    console.log(value);
  }}/>
});
