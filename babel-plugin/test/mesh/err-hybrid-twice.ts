import { hybridView } from "vasille-web";

interface Models {
  string: string;
}

interface Props {
  string: string;
}

export const C = hybridView(({ string: s0 }: Models, { string: s1 }: Props) => {
  console.log(s0, s1);
});
