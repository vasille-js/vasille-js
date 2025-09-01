import { compose } from "vasille-web";

interface Props {
  $a: {
    b: number;
  };
}

const C = compose(({ $a: { b } }: Props) => {});
