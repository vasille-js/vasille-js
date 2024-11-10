import { compose } from "vasille-dx";

interface Props {
  a: {
    b: number;
  };
}

export const C1 = compose(({ a }: Props) => {
  console.log(a.b);
});

export const C2 = compose(() => {
  const o = { b: 1 };

  <C1 a={o} />;
});
