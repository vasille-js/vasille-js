import { component } from "steel-frame";

const k = "key";

interface Props {
  $data: {
    key: number;
  };
}

const C = component(({ ["$data"]: $d }: Props) => {
  const key = "a";
  const o = {
    [key]: 2,
  };
});
