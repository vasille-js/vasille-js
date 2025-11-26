import { compose } from "steel-frame";

const key = "a";

const C = compose(() => {
  const a = {
    $a: 1,
    [key]: 2,
  };
});
