import { compose, raw } from "steel-frame";

interface Props {
  $1: number;
}

const C = compose(({ ["$1"]: $1 = 2 }: Props) => {
  const { ["$a1"]: $a2 } = { ["$a1"]: raw($1) };
});
