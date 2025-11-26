import { calculate, compose } from "steel-frame";

const C = compose(() => {
  const x = calculate(() => {
    function $add(a: number, b: number) {
      return a + b;
    }

    return $add(1, 2);
  });
});
