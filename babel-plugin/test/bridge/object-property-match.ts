import { compose } from "vasille-web";

const key = "a";

const C = compose(() => {
  const a = {
    $a: 1,
    [key]: 2,
  };
});
