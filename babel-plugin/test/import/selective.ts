import { compose } from "vasille-web";

export const C = compose(({ $a = 0 }: { $a: number }) => {
  $a = 3;
});
