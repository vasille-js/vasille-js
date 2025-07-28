import { compose } from "vasille-dx";

interface Props {
  a: {
    b: number;
  };
}

const C = compose(({ a: { b } }: Props) => {});
