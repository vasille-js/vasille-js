import { Reference } from "vasille";
import { compose, CoreProps } from "vasille-explicit";

interface Props extends CoreProps {
  a: number;
}

export const C = compose<Props>(({ a = new Reference(2) }) => {
  a.$ = 3;
});
