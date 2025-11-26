import { compose } from "steel-frame";

interface Props {
  $a: {
    b: number;
  };
}

const C = compose(({ $a: { b } }: Props) => {});
